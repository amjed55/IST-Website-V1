import { NextResponse } from 'next/server';
import {
  getInstagramSyncMeta,
  listInstagramPosts,
  setInstagramSyncMeta,
  upsertLiveInstagramPosts,
} from '@/lib/data';
import { isEmbeddablePost, instagramEmbedSrc } from '@/lib/instagram';
import { fetchLiveInstagramPosts, mediaProxyPath } from '@/lib/instagram-live';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CACHE_MS = 30 * 60 * 1000;

async function mapRows() {
  const rows = (await listInstagramPosts(true)).filter((p) => isEmbeddablePost(p.permalink));
  return rows.map((p) => {
    const code = p.permalink.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i)?.[2];
    return {
      id: p.id,
      permalink: p.permalink,
      mediaType: p.media_type,
      caption: p.caption || undefined,
      posterSrc: p.poster_src || (code ? mediaProxyPath(code) : undefined),
      videoSrc: p.video_src || undefined,
      embedSrc: instagramEmbedSrc(p.permalink, true),
      embeddable: true,
      source: p.source || undefined,
    };
  });
}

async function syncLive(force = false) {
  const meta = await getInstagramSyncMeta();
  const syncedAt = meta.syncedAt ? Date.parse(meta.syncedAt) : 0;
  const fresh = syncedAt && Date.now() - syncedAt < CACHE_MS;
  const existingLive = await mapRows();
  if (fresh && !force && existingLive.length) {
    return { synced: false, source: meta.source || 'cache', count: existingLive.length };
  }

  const live = await fetchLiveInstagramPosts(12);
  if (live.posts.length) {
    await upsertLiveInstagramPosts(
      live.posts.map((p, i) => ({
        id: p.id,
        permalink: p.permalink,
        media_type: p.mediaType,
        caption: p.caption || null,
        poster_src: p.posterSrc || mediaProxyPath(p.shortcode),
        sort_order: i,
      })),
    );
    await setInstagramSyncMeta(live.source);
  }
  return { synced: true, source: live.source, error: live.error, count: live.posts.length };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get('refresh') === '1';

  let sync: {
    synced: boolean;
    source: string;
    error?: string;
    count?: number;
  } | null = null;
  try {
    sync = await syncLive(force);
  } catch (err) {
    sync = {
      synced: false,
      source: 'error',
      error: err instanceof Error ? err.message : 'sync failed',
    };
  }

  const posts = await mapRows();
  return NextResponse.json(
    {
      posts,
      live: true,
      sync,
      profile: 'https://www.instagram.com/islamicsocietyoftoronto/',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
