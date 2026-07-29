import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listAnnouncements, writeAudit } from '@/lib/db';

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ announcements: listAnnouncements(false) });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const message = String(body.message || '').trim();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
  const result = getDb()
    .prepare(
      `INSERT INTO announcements (message, is_active, sort_order, source, updated_at)
       VALUES (?, ?, ?, 'local', datetime('now'))`,
    )
    .run(message, body.is_active === false || body.is_active === 0 ? 0 : 1, Number(body.sort_order || 0));
  writeAudit(session.username, 'create', 'announcement', String(result.lastInsertRowid), message);
  return NextResponse.json({ ok: true, id: result.lastInsertRowid });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb()
    .prepare(
      `UPDATE announcements SET message = ?, is_active = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(
      String(body.message || ''),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      Number(body.sort_order || 0),
      id,
    );
  writeAudit(session.username, 'update', 'announcement', String(id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare(`DELETE FROM announcements WHERE id = ?`).run(id);
  writeAudit(session.username, 'delete', 'announcement', String(id));
  return NextResponse.json({ ok: true });
}
