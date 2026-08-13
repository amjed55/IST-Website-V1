import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listMedia, writeAudit } from '@/lib/db';
import { saveUploadedImage } from '@/lib/uploads';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ media: listMedia() });
}

export async function PUT(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const key = String(body.keyName || body.key_name || '')
    .trim()
    .slice(0, 80);
  if (!key) return NextResponse.json({ error: 'key_name required' }, { status: 400 });
  const src = String(body.src || '').trim().slice(0, 1000);
  const alt = String(body.alt || '').trim().slice(0, 300);
  if (!src) return NextResponse.json({ error: 'src required' }, { status: 400 });
  const db = getDb();
  const existing = db.prepare('SELECT id FROM media WHERE key_name = ?').get(key) as
    | { id: string }
    | undefined;
  if (existing) {
    db.prepare(
      `UPDATE media SET src = ?, alt = ?, updated_at = datetime('now') WHERE key_name = ?`,
    ).run(src, alt, key);
  } else {
    db.prepare(
      `INSERT INTO media (id, key_name, src, alt, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`,
    ).run(key, key, src, alt);
  }
  writeAudit(session.username, 'update', 'media', key, alt || src);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file');
  const keyName = String(form.get('key_name') || form.get('keyName') || '')
    .trim()
    .slice(0, 80);
  const alt = String(form.get('alt') || 'Site image').trim().slice(0, 300);
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }
  if (!keyName) return NextResponse.json({ error: 'key_name required' }, { status: 400 });

  const safe = keyName.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  if (!safe) return NextResponse.json({ error: 'Invalid key_name' }, { status: 400 });

  let src: string;
  try {
    src = await saveUploadedImage(file, safe);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid upload' },
      { status: 400 },
    );
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM media WHERE key_name = ?').get(safe) as
    | { id: string }
    | undefined;
  if (existing) {
    db.prepare(
      `UPDATE media SET src = ?, alt = ?, updated_at = datetime('now') WHERE key_name = ?`,
    ).run(src, alt, safe);
  } else {
    db.prepare(
      `INSERT INTO media (id, key_name, src, alt, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`,
    ).run(safe, safe, src, alt);
  }

  writeAudit(session.username, 'upload', 'media', safe, src);
  return NextResponse.json({ ok: true, src, key_name: safe });
}
