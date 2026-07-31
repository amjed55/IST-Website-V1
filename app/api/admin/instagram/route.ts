import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, listInstagramPosts, writeAudit } from '@/lib/db';
import { detectMediaType, normalizeInstagramPermalink } from '@/lib/instagram';
import { saveUploadedFile } from '@/lib/uploads';

async function guard() {
  return getAdminSession();
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ posts: listInstagramPosts(false) });
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let posterSrc: string | null = null;
  let videoSrc: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const poster = fd.get('poster');
    const video = fd.get('video');
    if (poster instanceof File && poster.size > 0) {
      posterSrc = await saveUploadedFile(poster, 'ig-poster');
    }
    if (video instanceof File && video.size > 0) {
      videoSrc = await saveUploadedFile(video, 'ig-video');
    }
  } else {
    body = await req.json();
    posterSrc = (body.poster_src || body.posterSrc || null) as string | null;
    videoSrc = (body.video_src || body.videoSrc || null) as string | null;
  }

  const rawPermalink = String(body.permalink || '').trim();
  const permalink =
    normalizeInstagramPermalink(rawPermalink) ||
    (rawPermalink.includes('instagram.com') ? rawPermalink.replace(/\/?$/, '/') : '');
  if (!permalink) {
    return NextResponse.json(
      {
        error:
          'Paste a valid Instagram URL. Prefer post/reel links (…/p/… or …/reel/…) for in-site embeds.',
      },
      { status: 400 },
    );
  }

  const id =
    String(body.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') || `ig-${Date.now()}`;

  const mediaType =
    body.media_type === 'video' ||
    body.media_type === 'reel' ||
    body.media_type === 'carousel' ||
    body.media_type === 'image'
      ? body.media_type
      : detectMediaType(permalink);

  getDb()
    .prepare(
      `INSERT INTO instagram_posts
        (id, permalink, media_type, caption, poster_src, video_src, is_active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      id,
      permalink,
      mediaType,
      body.caption ? String(body.caption) : null,
      posterSrc,
      videoSrc,
      body.is_active === false || body.is_active === '0' ? 0 : 1,
      Number(body.sort_order ?? body.sortOrder ?? 0),
    );

  writeAudit(session.username, 'create', 'instagram_post', id, permalink);
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let posterSrc: string | null | undefined;
  let videoSrc: string | null | undefined;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const poster = fd.get('poster');
    const video = fd.get('video');
    if (poster instanceof File && poster.size > 0) {
      posterSrc = await saveUploadedFile(poster, 'ig-poster');
    } else if (body.poster_src || body.posterSrc) {
      posterSrc = String(body.posterSrc || body.poster_src);
    }
    if (video instanceof File && video.size > 0) {
      videoSrc = await saveUploadedFile(video, 'ig-video');
    } else if ('video_src' in body || 'videoSrc' in body) {
      videoSrc = String(body.videoSrc || body.video_src || '') || null;
    }
  } else {
    body = await req.json();
    if ('posterSrc' in body || 'poster_src' in body) {
      posterSrc = (body.posterSrc || body.poster_src || null) as string | null;
    }
    if ('videoSrc' in body || 'video_src' in body) {
      videoSrc = (body.videoSrc || body.video_src || null) as string | null;
    }
  }

  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = getDb()
    .prepare('SELECT * FROM instagram_posts WHERE id = ?')
    .get(id) as
    | {
        poster_src: string | null;
        video_src: string | null;
        permalink: string;
      }
    | undefined;
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rawPermalink = String(body.permalink || existing.permalink).trim();
  const permalink =
    normalizeInstagramPermalink(rawPermalink) ||
    (rawPermalink.includes('instagram.com') ? rawPermalink.replace(/\/?$/, '/') : existing.permalink);

  const mediaType =
    body.media_type === 'video' ||
    body.media_type === 'reel' ||
    body.media_type === 'carousel' ||
    body.media_type === 'image'
      ? body.media_type
      : detectMediaType(permalink);

  getDb()
    .prepare(
      `UPDATE instagram_posts SET
        permalink = ?, media_type = ?, caption = ?,
        poster_src = ?, video_src = ?, is_active = ?, sort_order = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(
      permalink,
      mediaType,
      body.caption ? String(body.caption) : null,
      posterSrc === undefined ? existing.poster_src : posterSrc,
      videoSrc === undefined ? existing.video_src : videoSrc,
      body.is_active === false || body.is_active === '0' ? 0 : 1,
      Number(body.sort_order ?? body.sortOrder ?? 0),
      id,
    );

  writeAudit(session.username, 'update', 'instagram_post', id, permalink);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  getDb().prepare('DELETE FROM instagram_posts WHERE id = ?').run(id);
  writeAudit(session.username, 'delete', 'instagram_post', id);
  return NextResponse.json({ ok: true });
}
