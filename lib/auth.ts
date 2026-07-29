import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

const COOKIE = 'ist_admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.ADMIN_JWT_SECRET || 'ist-dev-secret-change-in-production';
  return new TextEncoder().encode(s);
}

export async function verifyAdminCredentials(username: string, password: string) {
  const db = getDb();
  const row = db
    .prepare('SELECT id, username, password_hash FROM admins WHERE username = ?')
    .get(username) as { id: number; username: string; password_hash: string } | undefined;
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id, username: row.username };
}

export async function createAdminSession(username: string) {
  const token = await new SignJWT({ role: 'admin', username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== 'admin' || typeof payload.username !== 'string') return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export async function requireAdminPage(): Promise<{ username: string }> {
  const { redirect } = await import('next/navigation');
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
