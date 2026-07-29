import { NextResponse } from 'next/server';
import { createAdminSession, verifyAdminCredentials } from '@/lib/auth';
import { writeAudit } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    const user = await verifyAdminCredentials(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    await createAdminSession(user.username);
    writeAudit(user.username, 'login', 'auth', null, 'Admin signed in');
    return NextResponse.json({ ok: true, username: user.username });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
