'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  format12,
  getJummahTimes,
  hm2min,
  isFriday,
  JUMMAH_SLOTS,
  nowMinutes,
  shouldShowJummah,
  type PrayerRow,
  type PrayerSettings,
  type TodayPrayersResponse,
} from '@/lib/prayer';
import { FadeIn, Stagger, StaggerItem } from './motion';

function nextJummahSlot(prayers: PrayerRow, settings?: PrayerSettings) {
  const now = nowMinutes();
  for (const slot of [1, 2, 3] as const) {
    const { start, khutba } = getJummahTimes(slot, prayers, settings);
    const t = hm2min(start || khutba);
    if (t >= 0 && t > now) return slot;
  }
  return null;
}

export function JummahSchedule() {
  const [prayers, setPrayers] = useState<PrayerRow | null>(null);
  const [settings, setSettings] = useState<PrayerSettings | undefined>();
  const [error, setError] = useState(false);
  const [nextSlot, setNextSlot] = useState<1 | 2 | 3 | null>(null);
  const prayersRef = useRef<PrayerRow | null>(null);
  const settingsRef = useRef<PrayerSettings | undefined>(undefined);
  const friday = isFriday();

  useEffect(() => {
    prayersRef.current = prayers;
    settingsRef.current = settings;
  }, [prayers, settings]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/prayers/today');
        const data = (await res.json()) as TodayPrayersResponse;
        if (cancelled) return;
        if (!res.ok || !data.prayers) {
          setError(true);
          return;
        }
        setPrayers(data.prayers);
        setSettings(data.settings);
        setNextSlot(nextJummahSlot(data.prayers, data.settings));
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    const poll = setInterval(load, 5 * 60 * 1000);
    const tick = setInterval(() => {
      const row = prayersRef.current;
      if (row) setNextSlot(nextJummahSlot(row, settingsRef.current));
    }, 30 * 1000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const hasAny = prayers && JUMMAH_SLOTS.some((s) => Boolean(prayers[s.field]));
  const showSection =
    hasAny || shouldShowJummah(settings, prayers, friday) || error || !prayers;

  if (!showSection) return null;

  return (
    <FadeIn>
      <div id="jummah" className="scroll-mt-28">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-teal">
              Friday congregation
            </p>
            <h2 className="mt-2 font-display text-3xl text-ist-green sm:text-4xl">Jummah prayers</h2>
            <p className="mt-2 max-w-2xl text-sm text-ist-muted">
              Jummah 1–3 at Masjid Darussalam — start (khutba begins), adhan, and khutba times from
              the live Prayer Clock.
            </p>
          </div>
          {friday && (
            <span className="inline-flex w-fit rounded-full bg-ist-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ist-green">
              Today is Friday
            </span>
          )}
        </div>

        {error && (
          <p className="mt-6 text-sm text-ist-muted">
            Could not load Jummah times. Ensure the Prayer Clock is running, then refresh.
          </p>
        )}

        {!error && !hasAny && (
          <p className="mt-6 text-sm text-ist-muted">
            Jummah times will appear when set on the Prayer Clock
            {!friday ? ' (usually listed for Fridays).' : '.'}
          </p>
        )}

        {hasAny && prayers && (
          <Stagger staggerDelay={0.1} className="mt-8 grid gap-4 md:grid-cols-3">
            {JUMMAH_SLOTS.map((slot, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const times = getJummahTimes(n, prayers, settings);
              if (!times.khutba && !times.adhan) return null;
              const isNext = friday && nextSlot === n;
              return (
                <StaggerItem key={slot.key}>
                  <div
                    className={`relative h-full border-l-4 bg-white py-5 pl-5 pr-4 shadow-soft ${
                      isNext ? 'border-ist-teal ring-1 ring-ist-teal/25' : 'border-ist-green/20'
                    }`}
                  >
                    {isNext && (
                      <span className="absolute right-3 top-3 rounded-full bg-ist-teal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Next
                      </span>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ist-teal">
                      {slot.label}
                    </p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-ist-muted">Start</dt>
                        <dd className="font-display text-lg text-ist-green tabular-nums">
                          {format12(times.start)}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3 border-t border-ist-green/8 pt-3">
                        <dt className="text-ist-muted">Adhan</dt>
                        <dd className="font-semibold text-ist-ink tabular-nums">
                          {format12(times.adhan)}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3 border-t border-ist-green/8 pt-3">
                        <dt className="text-ist-muted">Khutba</dt>
                        <dd className="font-semibold text-ist-ink tabular-nums">
                          {format12(times.khutba)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        <p className="mt-6 text-xs text-ist-muted">
          Prefer the full TV board?{' '}
          <Link href="/prayer-times" className="font-semibold text-ist-teal hover:underline">
            Open prayer times
          </Link>
        </p>
      </div>
    </FadeIn>
  );
}
