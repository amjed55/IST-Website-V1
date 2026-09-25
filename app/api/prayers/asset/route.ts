import { NextRequest, NextResponse } from 'next/server';
import { prayerClockAssetUrl } from '@/lib/prayer-server';

const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src');
  if (!src) return NextResponse.json({ error: 'src is required' }, { status: 400 });

  try {
    const upstream = prayerClockAssetUrl(src);
    const response = await fetch(upstream, {
      cache: 'force-cache',
      redirect: 'error',
      headers: { Accept: 'image/*' },
    });
    if (!response.ok) throw new Error(`Upstream ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (!contentType.startsWith('image/') || contentLength > MAX_ASSET_BYTES) {
      return NextResponse.json({ error: 'Unsupported asset' }, { status: 415 });
    }

    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_ASSET_BYTES) {
      return NextResponse.json({ error: 'Asset too large' }, { status: 413 });
    }

    return new NextResponse(body, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Prayer Clock asset unavailable' }, { status: 502 });
  }
}
