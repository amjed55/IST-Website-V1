import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listAnnouncements, writeAudit } from '@/lib/data';
import { dbGet, dbRun } from '@/lib/database';

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ announcements: await listAnnouncements(false) });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const message = String(body.message || '').trim();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
  const created = await dbGet<{ id: number }>(
    `INSERT INTO announcements (message, is_active, sort_order, source, updated_at)
     VALUES (?, ?, ?, 'local', datetime('now')) RETURNING id`,
    [message, body.is_active === false || body.is_active === 0 ? 0 : 1, Number(body.sort_order || 0)],
  );
  await writeAudit(session.username, 'create', 'announcement', String(created.id), message);
  return NextResponse.json({ ok: true, id: created.id });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await dbRun(
    `UPDATE announcements SET message = ?, is_active = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
    [
      String(body.message || ''),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      Number(body.sort_order || 0),
      id,
    ],
  );
  await writeAudit(session.username, 'update', 'announcement', String(id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await dbRun(`DELETE FROM announcements WHERE id = ?`, [id]);
  await writeAudit(session.username, 'delete', 'announcement', String(id));
  return NextResponse.json({ ok: true });
}
