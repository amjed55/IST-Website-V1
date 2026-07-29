import { NextResponse } from 'next/server';
import { resolveInstagramMediaUrl } from '@/lib/instagram-live';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code')?.trim();
  if (!code || !/^[A-Za-z0-9_-]{5,}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const mediaUrl = await resolveInstagramMediaUrl(code);
  if (!mediaUrl) {
    return NextResponse.json({ error: 'Media unavailable' }, { status: 404 });
  }

  return NextResponse.redirect(mediaUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
