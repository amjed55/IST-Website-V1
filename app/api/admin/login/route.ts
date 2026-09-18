import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, verifyAdminCredentials } from '@/lib/auth';
import { writeAudit } from '@/lib/data';

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function consumeAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const attemptKey = `${clientIp(req)}:${username.toLowerCase()}`;
    const limit = consumeAttempt(attemptKey);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      );
    }

    const user = await verifyAdminCredentials(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    attempts.delete(attemptKey);
    await createAdminSession(user.username);
    await writeAudit(user.username, 'login', 'auth', null, 'Admin signed in');
    return NextResponse.json({ ok: true, username: user.username });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
