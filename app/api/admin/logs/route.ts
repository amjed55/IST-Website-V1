import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listAuditLogs } from '@/lib/db';

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get('limit') || 150);
  return NextResponse.json({ logs: listAuditLogs(Math.min(limit, 500)) });
}
