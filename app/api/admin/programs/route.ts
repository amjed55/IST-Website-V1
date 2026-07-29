import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listPrograms } from '@/lib/db';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ programs: listPrograms() });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id =
    String(body.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') || `program-${Date.now()}`;
  getDb()
    .prepare(
      `INSERT INTO programs (id, category, title, summary, schedule, tags_json, image_src, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      id,
      body.category === 'community' || body.category === 'service' ? body.category : 'education',
      String(body.title || 'Untitled'),
      String(body.summary || ''),
      body.schedule || null,
      body.tags ? JSON.stringify(body.tags) : null,
      body.imageSrc || body.image_src || null,
      Number(body.sortOrder ?? body.sort_order ?? 0),
    );
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb()
    .prepare(
      `UPDATE programs SET category = ?, title = ?, summary = ?, schedule = ?, tags_json = ?,
       image_src = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(
      body.category === 'community' || body.category === 'service' ? body.category : 'education',
      String(body.title || ''),
      String(body.summary || ''),
      body.schedule || null,
      body.tags ? JSON.stringify(body.tags) : null,
      body.imageSrc || body.image_src || null,
      Number(body.sortOrder ?? body.sort_order ?? 0),
      id,
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare('DELETE FROM programs WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
