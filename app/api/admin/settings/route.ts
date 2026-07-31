import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSiteSettings, setSiteSetting, writeAudit } from '@/lib/db';

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ settings: getSiteSettings() });
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const entries = Object.entries(body.settings || body);
  for (const [key, value] of entries) {
    if (typeof key === 'string' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
      setSiteSetting(key, String(value));
    }
  }
  writeAudit(session.username, 'update', 'settings', null, `Updated ${entries.length} setting(s)`);
  return NextResponse.json({ ok: true, settings: getSiteSettings() });
}
