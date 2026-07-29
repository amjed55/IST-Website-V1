import { NextResponse } from 'next/server';
import { listPublicCareers, getCareerById } from '@/lib/careers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const career = getCareerById(id);
    if (!career) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ career });
  }
  return NextResponse.json({ careers: listPublicCareers() });
}
