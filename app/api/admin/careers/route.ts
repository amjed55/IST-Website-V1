import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { careersEmail } from '@/lib/content';
import { getCareer, getDb, listCareers, writeAudit } from '@/lib/db';
import { saveUploadedImage } from '@/lib/uploads';

async function guard() {
  return getAdminSession();
}

function parseLines(raw: unknown) {
  if (Array.isArray(raw)) return JSON.stringify(raw.map(String).filter(Boolean));
  if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return JSON.stringify(parsed.map(String).filter(Boolean));
        }
      } catch {
        /* fall through to line split */
      }
    }
    return JSON.stringify(
      trimmed
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  return null;
}

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readBody(body: Record<string, unknown>) {
  const title = String(body.title || '').trim();
  return {
    title: title || 'Untitled role',
    type: String(body.type || 'Part-time').trim() || 'Part-time',
    department: body.department ? String(body.department).trim() : null,
    summary: String(body.summary || '').trim(),
    schedule: body.schedule ? String(body.schedule).trim() : null,
    location: body.location ? String(body.location).trim() : null,
    deadline: String(body.deadline || 'Open until filled').trim() || 'Open until filled',
    start_date: body.start_date || body.startDate ? String(body.start_date || body.startDate).trim() : null,
    contract: body.contract ? String(body.contract).trim() : null,
    apply_email: String(body.apply_email || body.applyEmail || careersEmail).trim() || careersEmail,
    apply_subject: String(body.apply_subject || body.applySubject || title || 'Job application').trim(),
    responsibilities_json: parseLines(body.responsibilities),
    requirements_json: parseLines(body.requirements),
    is_active: [false, 0, '0'].includes(body.is_active as never) ||
    [false, 0, '0'].includes(body.isActive as never)
      ? 0
      : 1,
    sort_order: Number(body.sort_order ?? body.sortOrder ?? 0) || 0,
  };
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ careers: listCareers(false) });
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let imageSrc: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const file = fd.get('poster') || fd.get('image');
    if (file instanceof File && file.size > 0) {
      imageSrc = await saveUploadedImage(file, String(body.title || 'career'));
    }
  } else {
    body = await req.json();
    imageSrc = (body.imageSrc || body.image_src || null) as string | null;
  }

  const fields = readBody(body);
  if (!fields.title || fields.title === 'Untitled role') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!fields.summary) {
    return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
  }

  const id =
    slugify(String(body.id || '')) || slugify(fields.title) || `career-${Date.now()}`;

  if (getCareer(id)) {
    return NextResponse.json({ error: `A role with id "${id}" already exists` }, { status: 409 });
  }

  getDb()
    .prepare(
      `INSERT INTO careers
        (id, title, type, department, summary, schedule, location, deadline, start_date, contract,
         apply_email, apply_subject, responsibilities_json, requirements_json, image_src, is_active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      id,
      fields.title,
      fields.type,
      fields.department,
      fields.summary,
      fields.schedule,
      fields.location,
      fields.deadline,
      fields.start_date,
      fields.contract,
      fields.apply_email,
      fields.apply_subject,
      fields.responsibilities_json,
      fields.requirements_json,
      imageSrc,
      fields.is_active,
      fields.sort_order,
    );

  writeAudit(session.username, 'create', 'career', id, fields.title);
  return NextResponse.json({ ok: true, id, imageSrc });
}

export async function PUT(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let imageSrc: string | null | undefined;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const file = fd.get('poster') || fd.get('image');
    if (file instanceof File && file.size > 0) {
      imageSrc = await saveUploadedImage(file, String(body.title || body.id || 'career'));
    } else if (body.image_src || body.imageSrc) {
      imageSrc = String(body.imageSrc || body.image_src);
    }
  } else {
    body = await req.json();
    if ('imageSrc' in body || 'image_src' in body) {
      imageSrc = (body.imageSrc || body.image_src || null) as string | null;
    }
  }

  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = getCareer(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const fields = readBody({
    ...existing,
    ...body,
    start_date: body.start_date ?? body.startDate ?? existing.start_date,
    apply_email: body.apply_email ?? body.applyEmail ?? existing.apply_email,
    apply_subject: body.apply_subject ?? body.applySubject ?? existing.apply_subject,
    responsibilities: body.responsibilities ?? existing.responsibilities_json,
    requirements: body.requirements ?? existing.requirements_json,
    is_active: body.is_active ?? body.isActive ?? existing.is_active,
  });

  const finalImage = imageSrc === undefined ? existing.image_src : imageSrc;

  getDb()
    .prepare(
      `UPDATE careers SET
        title = ?, type = ?, department = ?, summary = ?, schedule = ?, location = ?,
        deadline = ?, start_date = ?, contract = ?, apply_email = ?, apply_subject = ?,
        responsibilities_json = ?, requirements_json = ?, image_src = ?, is_active = ?,
        sort_order = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(
      fields.title,
      fields.type,
      fields.department,
      fields.summary,
      fields.schedule,
      fields.location,
      fields.deadline,
      fields.start_date,
      fields.contract,
      fields.apply_email,
      fields.apply_subject,
      fields.responsibilities_json,
      fields.requirements_json,
      finalImage,
      fields.is_active,
      fields.sort_order,
      id,
    );

  writeAudit(session.username, 'update', 'career', id, fields.title);
  return NextResponse.json({ ok: true, imageSrc: finalImage });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare('DELETE FROM careers WHERE id = ?').run(id);
  writeAudit(session.username, 'delete', 'career', id);
  return NextResponse.json({ ok: true });
}
