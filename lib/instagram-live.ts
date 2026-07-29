import { execFile } from 'child_process';
import { promisify } from 'util';
import { INSTAGRAM_USERNAME, detectMediaType, type InstagramMediaType } from '@/lib/instagram';

const execFileAsync = promisify(execFile);

export type LiveInstagramPost = {
  id: string;
  shortcode: string;
  permalink: string;
  mediaType: InstagramMediaType;
  caption?: string;
  posterSrc?: string;
  embedSrc: string;
};

const USERNAME = INSTAGRAM_USERNAME;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Recently verified public shortcodes for @islamicsocietyoftoronto.
 * Used when search discovery is rate-limited; refreshed whenever discovery succeeds.
 */
export const BOOTSTRAP_SHORTCODES = [
  'DaFiBEbRI0w',
  'DaYIREmuQ8q',
  'DayRdpgPgVA',
  'DayXO-yvciN',
  'DZ1Me47xE3C',
  'DZ_R5O2hdmD',
  'DYaOdQmscfN',
  'DYPq41ixkzS',
  'DXMVi8WkTE1',
  'DV8ltpyEZCU',
  'DUi42RpEYtn',
  'DSv2o44Edj8',
  'DRC5wg6EZyK',
  'DMc6gf_xDuP',
  'DMah5kmxT5H',
];

function permalinkFor(code: string, kind: 'p' | 'reel' = 'p') {
  return `https://www.instagram.com/${kind}/${code}/`;
}

export function embedSrcFor(permalink: string) {
  return `${permalink.replace(/\/?$/, '/')}embed/captioned/`;
}

export function mediaProxyPath(code: string) {
  return `/api/content/instagram/media?code=${encodeURIComponent(code)}`;
}

function shortcodeFromUrl(raw: string): string | null {
  return raw.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i)?.[1] || null;
}

async function curlGet(url: string): Promise<{ status: number; body: string }> {
  try {
    const { stdout } = await execFileAsync(
      'curl',
      ['-s', '-m', '20', '-A', UA, '-H', 'Accept-Language: en-US,en;q=0.9', '-w', '\n__IST_HTTP_STATUS__:%{http_code}', url],
      { maxBuffer: 5 * 1024 * 1024 },
    );
    const statusMatch = stdout.match(/__IST_HTTP_STATUS__:(\d+)\s*$/);
    const body = stdout.replace(/\n__IST_HTTP_STATUS__:\d+\s*$/, '');
    return { status: statusMatch ? Number(statusMatch[1]) : 0, body };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'curl failed');
  }
}

/** Resolve a post thumbnail via Instagram's media redirect. */
export async function resolveInstagramMediaUrl(code: string): Promise<string | null> {
  const url = `https://www.instagram.com/p/${encodeURIComponent(code)}/media/?size=m`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA },
      redirect: 'manual',
      cache: 'no-store',
    });
    const loc = res.headers.get('location');
    if (loc && /^https?:\/\//i.test(loc)) return loc;
    if (res.url && /cdninstagram\.com|fbcdn\.net/i.test(res.url)) return res.url;
  } catch {
    /* ignore */
  }
  return null;
}

async function discoverFromSearch(): Promise<string[]> {
  const queries = [
    `site:instagram.com/p "${USERNAME}"`,
    `site:instagram.com/reel "${USERNAME}"`,
    `"${USERNAME}" site:instagram.com/p`,
  ];
  const codes = new Set<string>();

  for (const q of queries) {
    try {
      const { body, status } = await curlGet(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
      );
      if (status >= 400 || body.length < 20000) continue;
      for (const m of body.matchAll(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/gi)) {
        codes.add(m[2]);
      }
    } catch {
      /* ignore */
    }
  }
  return [...codes];
}

function envConfiguredCodes(): string[] {
  const raw = process.env.NEXT_PUBLIC_INSTAGRAM_POSTS || '';
  return raw
    .split(',')
    .map((s) => shortcodeFromUrl(s.trim()))
    .filter(Boolean) as string[];
}

async function discoverFromGraphApi(): Promise<LiveInstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  if (!token || !userId) return [];

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.facebook.com/v21.0/${userId}/media?fields=${fields}&limit=18&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Graph API ${res.status}`);
  const data = (await res.json()) as {
    data?: {
      id: string;
      caption?: string;
      media_type?: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink?: string;
    }[];
  };

  return (data.data || [])
    .map((item) => {
      const permalink = (item.permalink || '').replace(/\?.*$/, '');
      const code = shortcodeFromUrl(permalink) || item.id;
      if (!/instagram\.com\/(p|reel|tv)\//i.test(permalink)) return null;
      const mediaType: InstagramMediaType =
        item.media_type === 'VIDEO' || item.media_type === 'REELS'
          ? 'reel'
          : item.media_type === 'CAROUSEL_ALBUM'
            ? 'carousel'
            : 'image';
      return {
        id: `live-${code}`,
        shortcode: code,
        permalink: permalink.endsWith('/') ? permalink : `${permalink}/`,
        mediaType,
        caption: item.caption || undefined,
        posterSrc: item.thumbnail_url || item.media_url || mediaProxyPath(code),
        embedSrc: embedSrcFor(permalink),
      } satisfies LiveInstagramPost;
    })
    .filter(Boolean) as LiveInstagramPost[];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, () => worker()));
  return out;
}

async function hydrateCodes(
  codes: string[],
  limit: number,
): Promise<LiveInstagramPost[]> {
  const unique = [...new Set(codes)].slice(0, 24);
  const verified = await mapWithConcurrency(unique, 5, async (code) => {
    const mediaUrl = await resolveInstagramMediaUrl(code);
    if (!mediaUrl) return null;
    const permalink = permalinkFor(code, 'p');
    return {
      id: `live-${code}`,
      shortcode: code,
      permalink,
      mediaType: detectMediaType(permalink),
      caption: `@${USERNAME}`,
      posterSrc: mediaProxyPath(code),
      embedSrc: embedSrcFor(permalink),
    } satisfies LiveInstagramPost;
  });
  return verified.filter(Boolean).slice(0, limit) as LiveInstagramPost[];
}

/**
 * Pull recent public posts for @islamicsocietyoftoronto.
 * Prefer Meta Graph API when configured; otherwise discover + verified shortcodes.
 */
export async function fetchLiveInstagramPosts(limit = 12): Promise<{
  posts: LiveInstagramPost[];
  source: 'graph' | 'public' | 'bootstrap' | 'none';
  error?: string;
}> {
  try {
    const graph = await discoverFromGraphApi();
    if (graph.length) return { posts: graph.slice(0, limit), source: 'graph' };
  } catch (err) {
    console.warn('[instagram-live] Graph API failed:', err);
  }

  try {
    const discovered = await discoverFromSearch();
    const envCodes = envConfiguredCodes();
    const merged = [...envCodes, ...discovered];
    if (merged.length) {
      const posts = await hydrateCodes(merged, limit);
      if (posts.length) return { posts, source: 'public' };
    }

    const bootstrap = await hydrateCodes([...envCodes, ...BOOTSTRAP_SHORTCODES], limit);
    if (bootstrap.length) return { posts: bootstrap, source: 'bootstrap' };

    return {
      posts: [],
      source: 'none',
      error: 'No live Instagram posts could be loaded',
    };
  } catch (err) {
    return {
      posts: [],
      source: 'none',
      error: err instanceof Error ? err.message : 'Live Instagram sync failed',
    };
  }
}
