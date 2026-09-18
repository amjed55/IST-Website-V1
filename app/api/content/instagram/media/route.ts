import { NextResponse } from 'next/server';
import { resolveInstagramMediaUrl } from '@/lib/instagram-live';

export const dynamic = 'force-dynamic';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Proxy Instagram post thumbnails through our origin.
 * Instagram CDN sets Cross-Origin-Resource-Policy: same-origin, so a 302
 * redirect from this route breaks <img> tiles in the browser.
 */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code')?.trim();
  if (!code || !/^[A-Za-z0-9_-]{5,}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const mediaUrl = await resolveInstagramMediaUrl(code);
  if (!mediaUrl) {
    return NextResponse.json({ error: 'Media unavailable' }, { status: 404 });
  }

  try {
    const upstream = await fetch(mediaUrl, {
      headers: {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'https://www.instagram.com/',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream media ${upstream.status}` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Not an image' }, { status: 502 });
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Length': String(bytes.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Media fetch failed' }, { status: 502 });
  }
}
