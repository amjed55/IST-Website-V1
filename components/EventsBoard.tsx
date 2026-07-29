'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { events, type EventItem } from '@/lib/content';
import { images } from '@/lib/images';
import { addMinutes, format12, type TodayPrayersResponse } from '@/lib/prayer';
import { Badge } from './ui';
import { ease } from './motion';

type Tab = 'upcoming' | 'past';

function ZuhrWindowNote() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/prayers/today');
        if (!res.ok) return;
        const data = (await res.json()) as TodayPrayersResponse;
        const iqamah = data.prayers?.dhuhr_iqama;
        if (!iqamah || cancelled) return;
        const end = addMinutes(iqamah, 180);
        const close = addMinutes(iqamah, 30);
        setLabel(
          `Today’s window: ${format12(iqamah)} – ${format12(end)} · Gym entry closes ${format12(close)}`,
        );
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) {
    return (
      <p className="mt-2 text-sm text-ist-teal">
        Saturdays from Zuhr iqamah to iqamah + 3 hours (entry closes 30 min after iqamah)
      </p>
    );
  }
  return <p className="mt-2 text-sm font-medium text-ist-teal">{label}</p>;
}

function eventImage(item: EventItem) {
  if (item.imageSrc && item.imageSrc.trim()) {
    return { src: item.imageSrc, alt: item.title };
  }
  return images.eventsById[item.id] || images.events;
}

function EventSlide({ item, muted }: { item: EventItem; muted?: boolean }) {
  const thumb = eventImage(item);
  return (
    <div
      className={`grid gap-6 md:grid-cols-[240px_1fr] ${muted ? 'opacity-55 grayscale' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[220px]">
        <Image src={thumb.src} alt={thumb.alt} fill sizes="240px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ist-green-deep/95 to-transparent px-4 pb-4 pt-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Date</p>
          <p className="mt-0.5 font-display text-xl leading-tight">{item.dateLabel}</p>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          {item.badge && <Badge>{item.badge}</Badge>}
          {item.recurring && <Badge className="bg-ist-gold/20 text-ist-green">Recurring</Badge>}
          {muted && <Badge className="bg-ist-green/10 text-ist-muted">Past</Badge>}
        </div>
        <h3 className="mt-3 font-display text-2xl text-ist-green sm:text-3xl">{item.title}</h3>
        <p className="mt-3 max-w-xl leading-relaxed text-ist-ink/65">{item.summary}</p>
        {item.scheduleKind === 'zuhr-window' && !muted && <ZuhrWindowNote />}
        {item.details && item.details.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ist-ink/60">
            {item.details.slice(0, 3).map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ist-gold" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
        {item.location && (
          <p className="mt-3 text-sm text-ist-teal">{item.location}</p>
        )}
        <Link
          href={`/events#${item.id}`}
          className="mt-5 inline-flex text-sm font-semibold text-ist-teal underline-offset-4 hover:underline"
        >
          Learn more →
        </Link>
      </div>
    </div>
  );
}

export function EventsBoard({ showHeader = true }: { showHeader?: boolean }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [dbEvents, setDbEvents] = useState<EventItem[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/content/events');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.events)) setDbEvents(data.events);
      } catch {
        /* static fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const all = dbEvents || events;
  const upcoming = useMemo(() => all.filter((e) => e.status === 'upcoming'), [all]);
  const past = useMemo(() => all.filter((e) => e.status === 'past'), [all]);
  const list = tab === 'upcoming' ? upcoming : past;

  useEffect(() => {
    setIndex(0);
  }, [tab, list.length]);

  useEffect(() => {
    if (list.length < 2 || tab === 'past') return;
    const t = setInterval(() => setIndex((i) => (i + 1) % list.length), 7000);
    return () => clearInterval(t);
  }, [list, tab]);

  const item = list[index] || list[0];

  function prev() {
    setIndex((i) => (i - 1 + list.length) % list.length);
  }
  function next() {
    setIndex((i) => (i + 1) % list.length);
  }

  const tabs = (
    <div
      className="inline-flex rounded-full border border-ist-green/12 bg-white p-1"
      role="tablist"
      aria-label="Event timeframe"
    >
      {(
        [
          ['upcoming', 'Upcoming'],
          ['past', 'Past'],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => setTab(id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === id ? 'bg-ist-green text-white' : 'text-ist-muted hover:text-ist-green'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div id="sports">
      {showHeader ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Calendar</span>
            <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">
              Upcoming events
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ist-ink/60">
              Swipe through programmes — past events are greyed in a separate tab.
            </p>
          </div>
          {tabs}
        </div>
      ) : (
        <div className="mb-6">{tabs}</div>
      )}

      <div className="mt-6">
        {list.length === 0 || !item ? (
          <p className="py-10 text-sm text-ist-muted">No {tab} events right now.</p>
        ) : tab === 'upcoming' ? (
          <div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ist-green/15 text-ist-green/60 transition hover:border-ist-teal hover:text-ist-teal"
                aria-label="Previous event"
              >
                ‹
              </button>
              <span className="min-w-[2.5rem] text-center text-sm text-ist-muted tabular-nums">
                {index + 1}/{list.length}
              </span>
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ist-green/15 text-ist-green/60 transition hover:border-ist-teal hover:text-ist-teal"
                aria-label="Next event"
              >
                ›
              </button>
            </div>

            <div className="relative mt-4 min-h-[220px]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <EventSlide item={item} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center gap-2" role="tablist" aria-label="Event slides">
              {list.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  aria-label={`Show ${e.title}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-ist-teal' : 'w-2 bg-ist-green/20 hover:bg-ist-green/40'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-ist-green/8">
            {list.map((e) => (
              <div key={e.id} className="py-6">
                <EventSlide item={e} muted />
              </div>
            ))}
          </div>
        )}
      </div>

      {showHeader && (
        <div className="mt-6 text-right">
          <Link href="/events" className="text-sm font-semibold text-ist-teal hover:underline">
            View all events →
          </Link>
        </div>
      )}
    </div>
  );
}
