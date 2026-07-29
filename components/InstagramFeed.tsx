'use client';

import { useEffect, useRef, useState } from 'react';
import { links } from '@/lib/content';
import { Button } from '@/components/ui';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion';
import { IconInstagram } from '@/components/icons';

const USERNAME = 'islamicsocietyoftoronto';

function profileEmbedUrl() {
  const custom = process.env.NEXT_PUBLIC_INSTAGRAM_WIDGET_URL?.trim();
  if (custom) return custom;
  const base = (process.env.NEXT_PUBLIC_INSTAGRAM_URL || links.instagram).replace(/\/$/, '');
  return `${base}/embed`;
}

function featuredPostUrls(): string[] {
  const raw = process.env.NEXT_PUBLIC_INSTAGRAM_POSTS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\/(www\.)?instagram\.com\//i.test(s));
}

function loadInstagramEmbedScript() {
  if (typeof window === 'undefined') return;
  const w = window as Window & { instgrm?: { Embeds: { process: () => void } } };
  if (w.instgrm?.Embeds) {
    w.instgrm.Embeds.process();
    return;
  }
  const existing = document.querySelector('script[data-ist-instagram-embed]');
  if (existing) {
    existing.addEventListener('load', () => w.instgrm?.Embeds.process());
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://www.instagram.com/embed.js';
  script.async = true;
  script.dataset.istInstagramEmbed = '1';
  script.onload = () => w.instgrm?.Embeds.process();
  document.body.appendChild(script);
}

function InstagramIconBadge() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-soft">
      <IconInstagram className="h-6 w-6" />
    </span>
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
  const embedSrc = profileEmbedUrl();
  const posts = featuredPostUrls();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (posts.length > 0) loadInstagramEmbedScript();
  }, [posts.length]);

  useEffect(() => {
    if (embedFailed) return;
    const t = window.setTimeout(() => {
      // If the iframe never fires load (blocked), surface the fallback.
      if (!loaded) setEmbedFailed(true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [embedFailed, loaded]);

  return (
    <div>
      {showHeading && (
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Social</span>
              <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">
                On Instagram
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ist-ink/60 sm:text-base">
                Live updates from{' '}
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ist-teal hover:underline"
                >
                  @{USERNAME}
                </a>{' '}
                — programmes, events, and community moments.
              </p>
            </div>
            <Button href={profileUrl} variant="outline" external className="shrink-0">
              <IconInstagram className="h-4 w-4" />
              Follow on Instagram
            </Button>
          </div>
        </FadeUp>
      )}

      {/* Featured post embeds (optional via NEXT_PUBLIC_INSTAGRAM_POSTS) */}
      {posts.length > 0 && (
        <Stagger
          staggerDelay={0.08}
          className={`mt-8 grid gap-6 ${posts.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}
        >
          {posts.map((url) => (
            <StaggerItem key={url}>
              <blockquote
                className="instagram-media !m-0 !min-w-0 !max-w-full"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{ width: '100%' }}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Live profile feed */}
      <FadeUp delay={0.08} className={showHeading || posts.length ? 'mt-8' : ''}>
        {!embedFailed ? (
          <div
            className={`relative overflow-hidden border border-ist-green/10 bg-white ${
              compact ? 'mx-auto max-w-md' : 'mx-auto max-w-lg'
            }`}
          >
            {!loaded && (
              <div className="flex h-[480px] flex-col items-center justify-center gap-3 bg-ist-green/[0.03] text-ist-muted">
                <InstagramIconBadge />
                <p className="text-sm">Loading Instagram feed…</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title={`@${USERNAME} on Instagram`}
              src={embedSrc}
              className={`w-full border-0 ${loaded ? 'relative' : 'pointer-events-none absolute left-0 top-0 opacity-0'}`}
              style={{ height: compact ? 560 : 720, maxWidth: '100%' }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="encrypted-media; clipboard-write"
              onLoad={() => setLoaded(true)}
              onError={() => setEmbedFailed(true)}
            />
          </div>
        ) : (
          <div className="border border-ist-green/10 bg-white px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <InstagramIconBadge />
              <h3 className="mt-5 font-display text-2xl text-ist-green">@{USERNAME}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">
                Open our Instagram profile for the latest photos, reels, and announcements from
                Masjid Darus Salaam.
              </p>
              <Button href={profileUrl} variant="primary" external className="mt-6">
                <IconInstagram className="h-4 w-4" />
                View live feed
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-ist-muted">
          Feed powered by Instagram ·{' '}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ist-teal hover:underline"
          >
            instagram.com/{USERNAME}
          </a>
        </p>
      </FadeUp>
    </div>
  );
}
