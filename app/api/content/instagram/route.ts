import { NextResponse } from 'next/server';
import { listInstagramPosts } from '@/lib/db';
import { isEmbeddablePost, instagramEmbedSrc } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = listInstagramPosts(true);
  const posts = rows.map((p) => {
    const embeddable = isEmbeddablePost(p.permalink);
    return {
      id: p.id,
      permalink: p.permalink,
      mediaType: p.media_type,
      caption: p.caption || undefined,
      posterSrc: p.poster_src || undefined,
      videoSrc: p.video_src || undefined,
      embedSrc: embeddable ? instagramEmbedSrc(p.permalink, true) : undefined,
      embeddable,
    };
  });
  return NextResponse.json({ posts });
}
