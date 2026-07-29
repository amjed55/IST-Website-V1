'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { links } from '@/lib/content';
import { Button } from '@/components/ui';
import { FadeUp } from '@/components/motion';
import { IconInstagram } from '@/components/icons';

const USERNAME = 'islamicsocietyoftoronto';

type FeedPost = {
  id: string;
  permalink: string;
  mediaType: string;
  caption?: string;
  posterSrc?: string;
  videoSrc?: string;
  embedSrc?: string;
  embeddable: boolean;
};

function InstagramIconBadge() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-soft">
      <IconInstagram className="h-6 w-6" />
    </span>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      {dir === 'left' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PostSlide({
  post,
  compact,
  expanded,
  autoPlayVideo,
}: {
  post: FeedPost;
  compact?: boolean;
  expanded?: boolean;
  autoPlayVideo?: boolean;
}) {
  const height = expanded ? (compact ? 640 : 780) : compact ? 480 : 560;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !post.videoSrc) return;
    if (autoPlayVideo) {
      void el.play().catch(() => undefined);
    } else if (!expanded) {
      el.pause();
    }
  }, [autoPlayVideo, expanded, post.videoSrc]);

  if (post.videoSrc) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-ist-green-deep">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          key={post.videoSrc}
          className="h-full w-full object-cover"
          style={{ minHeight: height }}
          src={post.videoSrc}
          poster={post.posterSrc}
          controls
          playsInline
          loop
          preload="metadata"
        />
        {post.caption && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-sm text-white">
            {post.caption}
          </p>
        )}
      </div>
    );
  }

  if (post.embeddable && post.embedSrc) {
    return (
      <iframe
        title={post.caption || `Instagram post ${post.id}`}
        src={post.embedSrc}
        className="h-full w-full border-0 bg-white"
        style={{ minHeight: height, height }}
        loading="lazy"
        allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <a
      href={post.permalink || links.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full min-h-[280px] w-full flex-col overflow-hidden bg-ist-green/[0.04]"
      style={{ minHeight: height }}
    >
      {post.posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.posterSrc}
          alt={post.caption || 'Instagram post'}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ist-green to-ist-green-deep">
          <InstagramIconBadge />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative mt-auto p-5 text-white sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-gold">@{USERNAME}</p>
        {post.caption && <p className="mt-2 text-sm leading-relaxed sm:text-base">{post.caption}</p>}
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/85">
          <IconInstagram className="h-3.5 w-3.5" />
          View on Instagram
        </span>
      </div>
    </a>
  );
}

export function InstagramFeed({
  compact = false,
  showHeading = true,
}: {
  compact?: boolean;
  showHeading?: boolean;
}) {
  const profileUrl = links.instagram;
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/content/instagram');
        const data = await res.json();
        if (!cancelled) setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = posts.length;
  const current = count ? posts[index % count] : null;

  const go = useCallback(
    (delta: number) => {
      if (!count) return;
      setIndex((i) => (i + delta + count) % count);
      setPaused(true);
    },
    [count],
  );

  useEffect(() => {
    if (!count || paused || expanded) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6500);
    return () => window.clearInterval(t);
  }, [count, paused, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded, go]);

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (Math.abs(dx) < 48) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div>
      {showHeading && (
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Social</span>
              <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">On Instagram</h2>
              <p className="mt-2 max-w-xl text-sm text-ist-ink/60 sm:text-base">
                Posts from{' '}
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ist-teal hover:underline"
                >
                  @{USERNAME}
                </a>{' '}
                — swipe through the carousel, expand any post, and play videos on this page.
              </p>
            </div>
            <Button href={profileUrl} variant="outline" external className="shrink-0">
              <IconInstagram className="h-4 w-4" />
              Follow on Instagram
            </Button>
          </div>
        </FadeUp>
      )}

      <FadeUp delay={0.08} className={showHeading ? 'mt-8' : ''}>
        {loading ? (
          <div
            className={`mx-auto flex items-center justify-center border border-ist-green/10 bg-white ${
              compact ? 'max-w-md' : 'max-w-lg'
            }`}
            style={{ minHeight: compact ? 480 : 560 }}
          >
            <div className="flex flex-col items-center gap-3 text-ist-muted">
              <InstagramIconBadge />
              <p className="text-sm">Loading Instagram carousel…</p>
            </div>
          </div>
        ) : count === 0 || !current ? (
          <div className="border border-ist-green/10 bg-white px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <InstagramIconBadge />
              <h3 className="mt-5 font-display text-2xl text-ist-green">@{USERNAME}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">
                Open our Instagram profile for the latest photos, reels, and announcements from Masjid
                Darus Salaam.
              </p>
              <Button href={profileUrl} variant="primary" external className="mt-6">
                <IconInstagram className="h-4 w-4" />
                View live feed
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`mx-auto ${compact ? 'max-w-md' : 'max-w-lg'}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="relative overflow-hidden border border-ist-green/10 bg-white shadow-soft"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <PostSlide
                key={current.id}
                post={current}
                compact={compact}
                autoPlayVideo={current.mediaType === 'video' || current.mediaType === 'reel'}
              />

              {count > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous post"
                    onClick={() => go(-1)}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ist-green shadow-soft backdrop-blur transition hover:bg-white"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next post"
                    onClick={() => go(1)}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ist-green shadow-soft backdrop-blur transition hover:bg-white"
                  >
                    <Chevron dir="right" />
                  </button>
                </>
              )}

              <div className="absolute right-3 top-3 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(true);
                    setPaused(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ist-green/90 px-3 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur transition hover:bg-ist-green"
                >
                  <ExpandIcon />
                  Expand
                </button>
              </div>
            </div>

            {count > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Instagram slides">
                {posts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Go to post ${i + 1}`}
                    onClick={() => {
                      setIndex(i);
                      setPaused(true);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? 'w-6 bg-ist-teal' : 'w-2 bg-ist-green/20 hover:bg-ist-green/40'
                    }`}
                  />
                ))}
              </div>
            )}

            <p className="mt-3 text-center text-xs text-ist-muted">
              {index + 1} / {count} · Videos play on this page ·{' '}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ist-teal hover:underline"
              >
                @{USERNAME}
              </a>
            </p>
          </div>
        )}
      </FadeUp>

      {expanded && current && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ist-green-deep/85 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Instagram post"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ist-green/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <InstagramIconBadge />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ist-green">@{USERNAME}</p>
                  <p className="truncate text-xs text-ist-muted">
                    {current.mediaType}
                    {current.caption ? ` · ${current.caption}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {count > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous"
                      onClick={() => go(-1)}
                      className="rounded-full border border-ist-green/15 p-2 text-ist-green hover:bg-ist-green/5"
                    >
                      <Chevron dir="left" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next"
                      onClick={() => go(1)}
                      className="rounded-full border border-ist-green/15 p-2 text-ist-green hover:bg-ist-green/5"
                    >
                      <Chevron dir="right" />
                    </button>
                  </>
                )}
                <a
                  href={current.permalink || profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full border border-ist-green/15 px-3 py-1.5 text-xs font-semibold text-ist-green hover:bg-ist-green/5 sm:inline-flex"
                >
                  Open on Instagram
                </a>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setExpanded(false)}
                  className="rounded-full bg-ist-green p-2 text-white hover:bg-ist-green-deep"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <PostSlide
                key={`expanded-${current.id}`}
                post={current}
                expanded
                autoPlayVideo={Boolean(current.videoSrc)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
