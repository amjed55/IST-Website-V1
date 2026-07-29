import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listPrograms, writeAudit } from '@/lib/db';
import { saveUploadedImage } from '@/lib/uploads';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ programs: listPrograms() });
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

  getDb()
    .prepare(
      `INSERT INTO programs (id, category, title, summary, schedule, tags_json, image_src, hub, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      id,
      category,
      String(body.title || 'Untitled'),
      String(body.summary || ''),
      body.schedule || null,
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
    );

  writeAudit(session.username, 'create', 'program', id, String(body.title || id));
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

  const existing = getDb().prepare('SELECT image_src FROM programs WHERE id = ?').get(id) as
    | { image_src: string | null }
    | undefined;
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const finalImage = imageSrc === undefined ? existing.image_src : imageSrc;
  const category =
    body.category === 'community' || body.category === 'service' ? body.category : 'education';

  const hubRaw = String(body.hub || '').trim().toLowerCase();
  const hub = hubRaw === 'youth' || hubRaw === 'sisters' || hubRaw === 'seniors' ? hubRaw : null;

  getDb()
    .prepare(
      `UPDATE programs SET category = ?, title = ?, summary = ?, schedule = ?, tags_json = ?,
       image_src = ?, hub = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(
      category,
      String(body.title || ''),
      String(body.summary || ''),
      body.schedule || null,
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
    );

  writeAudit(session.username, 'update', 'program', id, String(body.title || id));
  return NextResponse.json({ ok: true, imageSrc: finalImage });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare('DELETE FROM programs WHERE id = ?').run(id);
  writeAudit(session.username, 'delete', 'program', id);
  return NextResponse.json({ ok: true });
}
