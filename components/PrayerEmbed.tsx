'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { links } from '@/lib/content';
import { Button } from './ui';

/**
 * Embeds the local Prayer Clock Classic board (Flask+React) at /classic.
 * Scales a 1920×1080 canvas into the available slot so the TV layout stays readable.
 */
export function PrayerEmbed() {
  const embed = links.prayerClock;
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [key, setKey] = useState(0);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const fit = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w < 40 || h < 40) return;
    setScale(Math.min(w / DESIGN_W, h / DESIGN_H));
  }, []);

  useEffect(() => {
    fit();
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [fit]);

  useEffect(() => {
    if (loaded || failed) return;
    const t = window.setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 10000);
    return () => window.clearTimeout(t);
  }, [loaded, failed, key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="overflow-hidden rounded-[1.5rem] border border-ist-green/15 bg-[#061a17] shadow-lift"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ist-teal-light">
            Live Classic board
          </p>
          <p className="text-sm text-white/70">Masjid Prayer Clock · local widget</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={embed} variant="teal" external className="!px-4 !py-2 text-xs">
            Open fullscreen
          </Button>
          <Button href="/visit" variant="ghost" className="!px-4 !py-2 text-xs text-white">
            Visit & parking
          </Button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="relative w-full overflow-hidden bg-black"
        style={{ height: 'min(72vh, 720px)', minHeight: 360 }}
      >
        {!loaded && !failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#061a17]">
            <div className="shimmer h-1.5 w-40 rounded-full" />
            <p className="text-sm text-white/60">Loading prayer board…</p>
          </div>
        )}

        {failed ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <h2 className="font-display text-3xl">Prayer Clock not reachable</h2>
            <p className="max-w-md text-sm text-white/75">
              Start the Prayer Clock app on port 5000, then retry. From{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">Prayer-Clock/Widget/backend</code>{' '}
              run <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">python run.py</code>.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={embed} variant="teal" external>
                Open board in new tab
              </Button>
              <Button
                type="button"
                variant="light"
                onClick={() => {
                  setFailed(false);
                  setLoaded(false);
                  setKey((k) => k + 1);
                }}
              >
                Retry embed
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <iframe
              key={key}
              title="IST Classic Prayer Clock"
              src={embed}
              className="max-w-none shrink-0 border-0 bg-black"
              style={{
                width: DESIGN_W,
                height: DESIGN_H,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
              allow="fullscreen"
              onLoad={() => {
                setLoaded(true);
                setFailed(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-2.5 text-xs text-white/50 sm:px-5">
        Source: <span className="text-white/70">{embed}</span> · Times subject to change
      </div>
    </motion.div>
  );
}
