'use client';

import { useEffect, useState } from 'react';
import { links } from '@/lib/content';
import { Button } from '@/components/ui';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion';
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function isVideoType(type: string) {
  return type === 'video' || type === 'reel';
}

function Tile({
  post,
  onExpand,
}: {
  post: FeedPost;
  onExpand: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group relative aspect-square w-full overflow-hidden border border-ist-green/10 bg-ist-green/[0.04] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ist-teal"
    >
      {post.posterSrc && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.posterSrc}
          alt={post.caption || 'Instagram post'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-ist-green to-ist-green-deep">
          <IconInstagram className="h-10 w-10 text-white/80" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
        <p className="line-clamp-2 text-xs leading-snug sm:text-sm">
          {post.caption || `@${USERNAME}`}
        </p>
      </div>

      {isVideoType(post.mediaType) && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          {post.mediaType === 'reel' ? 'Reel' : 'Video'}
        </span>
      )}

      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ist-green opacity-0 transition group-hover:opacity-100">
        Expand
      </span>
    </button>
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
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<FeedPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/content/instagram');
        const data = await res.json();
        if (cancelled) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        if (!data.posts?.length && data.sync?.error) setError(data.sync.error);
      } catch {
        if (!cancelled) setError('Could not load Instagram feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const gridClass = compact
    ? 'grid grid-cols-2 gap-2 sm:grid-cols-3'
    : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div>
      {showHeading && (
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Social</span>
              <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">On Instagram</h2>
              <p className="mt-2 max-w-xl text-sm text-ist-ink/60 sm:text-base">
                Live posts from{' '}
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ist-teal hover:underline"
                >
                  @{USERNAME}
                </a>
                . Tap a tile to expand — videos play on this page.
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
          <div className={gridClass}>
            {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-ist-green/[0.06]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-ist-green/10 bg-white px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <InstagramIconBadge />
              <h3 className="mt-5 font-display text-2xl text-ist-green">@{USERNAME}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">
                {error ||
                  'Live posts could not be loaded right now. Open Instagram for the latest updates.'}
              </p>
              <Button href={profileUrl} variant="primary" external className="mt-6">
                <IconInstagram className="h-4 w-4" />
                View on Instagram
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Stagger staggerDelay={0.05} className={gridClass}>
              {posts.map((post) => (
                <StaggerItem key={post.id}>
                  <Tile post={post} onExpand={() => setExpanded(post)} />
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-4 text-center text-xs text-ist-muted">
              Live from Instagram · {posts.length} recent post{posts.length === 1 ? '' : 's'} ·{' '}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ist-teal hover:underline"
              >
                @{USERNAME}
              </a>
            </p>
          </>
        )}
      </FadeUp>

      {expanded && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ist-green-deep/85 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Instagram post"
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ist-green/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <InstagramIconBadge />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ist-green">@{USERNAME}</p>
                  <p className="truncate text-xs text-ist-muted">
                    {expanded.mediaType}
                    {expanded.caption ? ` · ${expanded.caption}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={expanded.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full border border-ist-green/15 px-3 py-1.5 text-xs font-semibold text-ist-green hover:bg-ist-green/5 sm:inline-flex"
                >
                  Open on Instagram
                </a>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setExpanded(null)}
                  className="rounded-full bg-ist-green p-2 text-white hover:bg-ist-green-deep"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[#0a1f1b]">
              {expanded.videoSrc ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  key={expanded.videoSrc}
                  className="max-h-[75vh] w-full object-contain"
                  src={expanded.videoSrc}
                  poster={expanded.posterSrc}
                  controls
                  autoPlay
                  playsInline
                />
              ) : expanded.embedSrc ? (
                <iframe
                  title={expanded.caption || 'Instagram post'}
                  src={expanded.embedSrc}
                  className="h-[min(75vh,720px)] w-full border-0 bg-white"
                  allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="p-8 text-center text-white/80">
                  <p>Preview unavailable.</p>
                  <a
                    href={expanded.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-ist-teal-light underline"
                  >
                    View on Instagram
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
