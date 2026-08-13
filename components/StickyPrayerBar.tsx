'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { links } from '@/lib/content';
import { IconDonate, IconPrayer } from './icons';

const DISMISS_KEY = 'ist-prayer-bar-dismissed';
const CACHE_KEY = 'ist-prayer-times-cache-v1';
const TZ = 'America/Toronto';

type Announcement = { id: number; message: string; urgent?: boolean };
type PrayerPayload = TodayPrayersResponse & { announcements?: Announcement[] };

function torontoDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatGregorian(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatClock(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

function formatHijri(d: Date) {
  try {
    return new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      timeZone: TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      timeZone: TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }
}

export function StickyPrayerBar() {
  const [dismissed, setDismissed] = useState(true);
  const [prayers, setPrayers] = useState<PrayerRow | null>(null);
  const [settings, setSettings] = useState<PrayerSettings | undefined>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextKey, setNextKey] = useState<PrayerKey | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [annIndex, setAnnIndex] = useState(0);
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
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (announcements.length < 2) return;
    const t = setInterval(() => setAnnIndex((i) => (i + 1) % announcements.length), 6000);
    return () => clearInterval(t);
  }, [announcements.length]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      function useSameDayCache() {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as
            | { dateKey: string; savedAt: string; data: PrayerPayload }
            | null;
          if (
            cached?.dateKey !== torontoDateKey(new Date()) ||
            !cached.data?.prayers
          ) {
            return false;
          }
          setPrayers(cached.data.prayers);
          setSettings(cached.data.settings);
          setAnnouncements(cached.data.announcements || []);
          setNextKey(getNextIqamahKey(cached.data.prayers, cached.data.settings));
          setCachedAt(cached.savedAt);
          return true;
        } catch {
          return false;
        }
      }

      try {
        const res = await fetch('/api/prayers/today');
        const data = (await res.json()) as PrayerPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok || !data.prayers) {
          setError(true);
          if (!useSameDayCache()) {
            setPrayers(null);
            setNextKey(null);
            setAnnouncements(data.announcements || []);
          }
          return;
        }
        setError(false);
        setCachedAt(null);
        setPrayers(data.prayers);
        setSettings(data.settings);
        setAnnouncements(data.announcements || []);
        setNextKey(getNextIqamahKey(data.prayers, data.settings));
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              dateKey: torontoDateKey(new Date()),
              savedAt: new Date().toISOString(),
              data,
            }),
          );
        } catch {
          /* storage is optional */
        }
      } catch {
        if (!cancelled) {
          setError(true);
          if (!useSameDayCache()) {
            setPrayers(null);
            setNextKey(null);
          }
        }
      }
    }

    load();
    const poll = setInterval(load, 60 * 1000);
    const tick = setInterval(() => {
      const row = prayersRef.current;
      if (row) setNextKey(getNextIqamahKey(row, settingsRef.current));
    }, 15 * 1000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!ready || dismissed) {
      document.documentElement.style.removeProperty('--prayer-bar-h');
      return;
    }
    document.documentElement.style.setProperty('--prayer-bar-h', '5.75rem');
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

  const currentAnn = announcements[annIndex];

  if (dismissed) {
    const nextLabel = nextKey ? DAILY_PRAYERS.find((p) => p.key === nextKey)?.short : null;
    const nextTime =
      nextKey && prayers ? format12(getIqamah(nextKey, prayers, settings)) : null;

    return (
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] right-3 z-[45] inline-flex items-center gap-2 rounded-full border border-ist-gold/30 bg-ist-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-ist-green-deep lg:bottom-5 lg:right-5"
        aria-label="Show iqamah prayer times banner"
      >
        <IconPrayer className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Iqamah</span>
        {nextLabel && nextTime && nextTime !== '—' ? (
          <span className="rounded-full bg-ist-teal/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
            Next {nextLabel} {nextTime}
          </span>
        ) : (
          <span className="text-xs font-medium text-white/80">Show board</span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-ist-gold/25 bg-gradient-to-r from-ist-green-deep via-ist-green to-ist-green-deep text-white shadow-[0_-12px_40px_rgba(7,42,37,0.35)]"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Masjid iqamah times and announcements"
    >
      {/* Meta row: date, clock, hijri, announcements */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-[11px] sm:px-4 sm:text-xs">
          <span className="font-medium text-ist-gold tabular-nums">{formatGregorian(now)}</span>
          <span className="hidden text-white/30 sm:inline" aria-hidden>
            ·
          </span>
          <span className="font-semibold tabular-nums tracking-wide text-white">
            {formatClock(now)}
          </span>
          <span className="hidden text-white/30 sm:inline" aria-hidden>
            ·
          </span>
          <span className="text-ist-teal-light">{formatHijri(now)}</span>
          {error && cachedAt && (
            <span className="rounded-full bg-ist-gold/20 px-2 py-0.5 text-[10px] font-semibold text-ist-gold">
              Offline copy · saved{' '}
              {new Intl.DateTimeFormat('en-CA', {
                timeZone: TZ,
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(cachedAt))}
            </span>
          )}
          {currentAnn && (
            <>
              <span className="hidden text-white/30 md:inline" aria-hidden>
                ·
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentAnn.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`truncate ${currentAnn.urgent ? 'text-ist-gold' : 'text-white/75'}`}
                  >
                    {currentAnn.message}
                  </motion.p>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Iqamah row */}
      <div className="mx-auto flex max-w-7xl items-stretch gap-1 px-2 sm:gap-2 sm:px-4">
        <Link
          href="/prayer-times"
          className="hidden shrink-0 items-center gap-2 border-r border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ist-gold sm:flex"
        >
          <IconPrayer className="h-3.5 w-3.5" />
          Iqamah
        </Link>

        <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
          {!prayers ? (
            <p className="flex flex-1 items-center px-3 py-2.5 text-xs text-white/75">
              Live prayer times are unavailable.
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="ml-2 font-semibold text-ist-gold underline"
              >
                Retry
              </button>
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
                  className={`relative flex min-w-[4.5rem] flex-1 flex-col items-center justify-center px-1.5 py-2 transition sm:min-w-0 sm:px-2 ${
                    isNext ? 'bg-ist-teal text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]' : ''
                  }`}
                >
                  {isNext && (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-ist-gold" aria-hidden />
                  )}
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

        <a
          href={links.donate}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center justify-center gap-1.5 border-l border-white/15 px-3 text-ist-gold transition hover:bg-white/10 hover:text-white"
          aria-label="Donate to IST"
        >
          <IconDonate className="h-4 w-4" />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] md:inline">
            Donate
          </span>
        </a>

        <button
          type="button"
          onClick={close}
          className="flex shrink-0 items-center justify-center px-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close prayer times banner"
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
    </motion.div>
  );
}
