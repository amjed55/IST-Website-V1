import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';
import { getDb, listMedia } from '@/lib/db';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ media: listMedia() });
}

export async function PUT(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const key = String(body.keyName || body.key_name || '').trim();
  if (!key) return NextResponse.json({ error: 'key_name required' }, { status: 400 });
  const src = String(body.src || '');
  const alt = String(body.alt || '');
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
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file');
  const keyName = String(form.get('key_name') || form.get('keyName') || '').trim();
  const alt = String(form.get('alt') || 'Site image');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }
  if (!keyName) return NextResponse.json({ error: 'key_name required' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const safe = keyName.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filename = `${safe}-${Date.now()}${ext}`;
  await writeFile(path.join(uploadDir, filename), bytes);
  const src = `/uploads/${filename}`;

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

  return NextResponse.json({ ok: true, src, key_name: safe });
}
