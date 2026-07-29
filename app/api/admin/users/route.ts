import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/auth';
import { getDb, listAdmins, writeAudit } from '@/lib/db';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ users: listAdmins() });
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const username = String(body.username || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');
  const displayName = String(body.displayName || body.display_name || username);
  const role = body.role === 'editor' ? 'editor' : 'admin';

  if (!username || password.length < 6) {
    return NextResponse.json(
      { error: 'Username and password (min 6 chars) required' },
      { status: 400 },
    );
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = getDb()
      .prepare(
        `INSERT INTO admins (username, password_hash, display_name, role, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
      )
      .run(username, hash, displayName, role);
    writeAudit(session.username, 'create', 'user', String(result.lastInsertRowid), username);
    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }
}

export async function PUT(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const displayName = String(body.displayName || body.display_name || '');
  const role = body.role === 'editor' ? 'editor' : 'admin';
  const password = body.password ? String(body.password) : '';

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const hash = bcrypt.hashSync(password, 10);
    getDb()
      .prepare(
        `UPDATE admins SET display_name = ?, role = ?, password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(displayName, role, hash, id);
  } else {
    getDb()
      .prepare(
        `UPDATE admins SET display_name = ?, role = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(displayName, role, id);
  }

  writeAudit(session.username, 'update', 'user', String(id), displayName || String(id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const row = getDb()
    .prepare(`SELECT username FROM admins WHERE id = ?`)
    .get(id) as { username: string } | undefined;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (row.username === session.username) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  const count = getDb().prepare(`SELECT COUNT(*) as c FROM admins`).get() as { c: number };
  if (count.c <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last admin user' }, { status: 400 });
  }

  getDb().prepare(`DELETE FROM admins WHERE id = ?`).run(id);
  writeAudit(session.username, 'delete', 'user', String(id), row.username);
  return NextResponse.json({ ok: true });
}
