import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listEvents } from '@/lib/db';

async function guard() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ events: listEvents() });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id =
    String(body.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') || `event-${Date.now()}`;
  const db = getDb();
  db.prepare(
    `INSERT INTO events (id, title, date_label, summary, badge, location, status, recurring, details_json, schedule_kind, image_src, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(
    id,
    String(body.title || 'Untitled'),
    String(body.dateLabel || body.date_label || ''),
    String(body.summary || ''),
    body.badge || null,
    body.location || null,
    body.status === 'past' ? 'past' : 'upcoming',
    body.recurring ? 1 : 0,
    body.details ? JSON.stringify(body.details) : null,
    body.scheduleKind || body.schedule_kind || null,
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
  const db = getDb();
  db.prepare(
    `UPDATE events SET
      title = ?, date_label = ?, summary = ?, badge = ?, location = ?, status = ?,
      recurring = ?, details_json = ?, schedule_kind = ?, image_src = ?, sort_order = ?,
      updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    String(body.title || ''),
    String(body.dateLabel || body.date_label || ''),
    String(body.summary || ''),
    body.badge || null,
    body.location || null,
    body.status === 'past' ? 'past' : 'upcoming',
    body.recurring ? 1 : 0,
    body.details ? JSON.stringify(body.details) : null,
    body.scheduleKind || body.schedule_kind || null,
    body.imageSrc || body.image_src || null,
    Number(body.sortOrder ?? body.sort_order ?? 0),
    id,
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare('DELETE FROM events WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
