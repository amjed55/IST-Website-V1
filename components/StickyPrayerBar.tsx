'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  DAILY_PRAYERS,
  format12,
  getIqamah,
  getNextIqamahKey,
  type PrayerKey,
  type PrayerRow,
  type PrayerSettings,
  type TodayPrayersResponse,
} from '@/lib/prayer';
import { IconPrayer } from './icons';

const DISMISS_KEY = 'ist-prayer-bar-dismissed';

export function StickyPrayerBar() {
  const [dismissed, setDismissed] = useState(true);
  const [prayers, setPrayers] = useState<PrayerRow | null>(null);
  const [settings, setSettings] = useState<PrayerSettings | undefined>();
  const [nextKey, setNextKey] = useState<PrayerKey | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const prayersRef = useRef<PrayerRow | null>(null);
  const settingsRef = useRef<PrayerSettings | undefined>(undefined);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    prayersRef.current = prayers;
    settingsRef.current = settings;
  }, [prayers, settings]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/prayers/today');
        const data = (await res.json()) as TodayPrayersResponse & { error?: string };
        if (cancelled) return;
        if (!res.ok || !data.prayers) {
          setError(true);
          setPrayers(null);
          setNextKey(null);
          return;
        }
        setError(false);
        setPrayers(data.prayers);
        setSettings(data.settings);
        setNextKey(getNextIqamahKey(data.prayers, data.settings));
      } catch {
        if (!cancelled) {
          setError(true);
          setPrayers(null);
          setNextKey(null);
        }
      }
    }

    load();
    const poll = setInterval(load, 5 * 60 * 1000);
    const tick = setInterval(() => {
      const row = prayersRef.current;
      if (row) setNextKey(getNextIqamahKey(row, settingsRef.current));
    }, 30 * 1000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!ready || dismissed) {
      document.documentElement.style.removeProperty('--prayer-bar-h');
      return;
    }
    document.documentElement.style.setProperty('--prayer-bar-h', '3.35rem');
    return () => {
      document.documentElement.style.removeProperty('--prayer-bar-h');
    };
  }, [ready, dismissed]);

  function close() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function open() {
    setDismissed(false);
    try {
      sessionStorage.removeItem(DISMISS_KEY);
    } catch {
      /* ignore */
    }
  }

  if (!ready) return null;

  if (dismissed) {
    const nextLabel = nextKey
      ? DAILY_PRAYERS.find((p) => p.key === nextKey)?.short
      : null;
    const nextTime =
      nextKey && prayers ? format12(getIqamah(nextKey, prayers, settings)) : null;

    return (
      <button
        type="button"
        onClick={open}
        className="fixed bottom-[calc(var(--mobile-cta-h,3.75rem)+0.75rem+env(safe-area-inset-bottom,0px))] right-3 z-[45] inline-flex items-center gap-2 rounded-full border border-ist-green/15 bg-ist-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-ist-green-deep lg:bottom-5 lg:right-5"
        aria-label="Show iqamah prayer times bar"
      >
        <IconPrayer className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Iqamah</span>
        {nextLabel && nextTime && nextTime !== '—' ? (
          <span className="rounded-full bg-ist-teal/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
            {nextLabel} {nextTime}
          </span>
        ) : (
          <span className="text-xs font-medium text-white/80">Show times</span>
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-ist-green/15 bg-ist-green text-white shadow-[0_-8px_30px_rgba(11,61,54,0.18)]"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Today’s iqamah times"
    >
      <div className="mx-auto flex max-w-7xl items-stretch gap-1 px-2 sm:gap-2 sm:px-4">
        <Link
          href="/prayer-times"
          className="hidden shrink-0 items-center border-r border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ist-gold sm:flex"
        >
          Iqamah
        </Link>

        <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
          {error || !prayers ? (
            <p className="flex flex-1 items-center px-3 py-2.5 text-xs text-white/75">
              Prayer times unavailable —{' '}
              <Link href="/prayer-times" className="ml-1 underline">
                open board
              </Link>
            </p>
          ) : (
            DAILY_PRAYERS.map(({ key, short }) => {
              const iqamah = getIqamah(key, prayers, settings);
              const isNext = nextKey === key;
              return (
                <div
                  key={key}
                  className={`flex min-w-[4.5rem] flex-1 flex-col items-center justify-center px-1.5 py-2 sm:min-w-0 sm:px-2 ${
                    isNext ? 'bg-ist-teal/90' : ''
                  }`}
                >
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] ${
                      isNext ? 'text-white' : 'text-white/55'
                    }`}
                  >
                    {short}
                    {isNext && (
                      <span className="ml-1 hidden rounded bg-white/20 px-1 py-px text-[8px] tracking-wide sm:inline">
                        Next
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-0.5 font-display text-sm tabular-nums sm:text-base ${
                      isNext ? 'text-white' : 'text-white/95'
                    }`}
                  >
                    {format12(iqamah)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={close}
          className="flex shrink-0 items-center justify-center px-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Minimize prayer times bar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 3l8 8M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
