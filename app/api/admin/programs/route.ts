import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listPrograms, writeAudit } from '@/lib/data';
import { dbGet, dbRun } from '@/lib/database';
import { saveUploadedImage } from '@/lib/uploads';

async function guard() {
  return getAdminSession();
}

function optionalText(value: unknown) {
  return value === null || value === undefined || value === '' ? null : String(value);
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ programs: await listPrograms() });
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
      imageSrc = await saveUploadedImage(file, String(body.title || 'program'));
    }
  } else {
    body = await req.json();
    imageSrc = (body.imageSrc || body.image_src || null) as string | null;
  }

  const id =
    String(body.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') || `program-${Date.now()}`;

  const category =
    body.category === 'community' || body.category === 'service' ? body.category : 'education';

  const hubRaw = String(body.hub || '').trim().toLowerCase();
  const hub = hubRaw === 'youth' || hubRaw === 'sisters' || hubRaw === 'seniors' ? hubRaw : null;

  await dbRun(
      `INSERT INTO programs (id, category, title, summary, schedule, tags_json, image_src, hub, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      id,
      category,
      String(body.title || 'Untitled'),
      String(body.summary || ''),
      optionalText(body.schedule),
      body.tags
        ? JSON.stringify(
            Array.isArray(body.tags)
              ? body.tags
              : String(body.tags)
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
          )
        : null,
      imageSrc,
      hub,
      Number(body.sortOrder ?? body.sort_order ?? 0),
    ],
  );

  await writeAudit(session.username, 'create', 'program', id, String(body.title || id));
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
      imageSrc = await saveUploadedImage(file, String(body.title || body.id || 'program'));
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

  const existing = await dbGet<{ image_src: string | null }>(
    'SELECT image_src FROM programs WHERE id = ?',
    [id],
  );
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const finalImage = imageSrc === undefined ? existing.image_src : imageSrc;
  const category =
    body.category === 'community' || body.category === 'service' ? body.category : 'education';

  const hubRaw = String(body.hub || '').trim().toLowerCase();
  const hub = hubRaw === 'youth' || hubRaw === 'sisters' || hubRaw === 'seniors' ? hubRaw : null;

  await dbRun(
      `UPDATE programs SET category = ?, title = ?, summary = ?, schedule = ?, tags_json = ?,
       image_src = ?, hub = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
    [
      category,
      String(body.title || ''),
      String(body.summary || ''),
      optionalText(body.schedule),
      body.tags
        ? JSON.stringify(
            Array.isArray(body.tags)
              ? body.tags
              : String(body.tags)
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
          )
        : null,
      finalImage,
      hub,
      Number(body.sortOrder ?? body.sort_order ?? 0),
      id,
    ],
  );

  await writeAudit(session.username, 'update', 'program', id, String(body.title || id));
  return NextResponse.json({ ok: true, imageSrc: finalImage });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await dbRun('DELETE FROM programs WHERE id = ?', [id]);
  await writeAudit(session.username, 'delete', 'program', id);
  return NextResponse.json({ ok: true });
}
