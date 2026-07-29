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
        /* Prayer clock optional */
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

function EventCard({ item, muted }: { item: EventItem; muted?: boolean }) {
  const thumb = images.eventsById[item.id] || images.events;

  return (
    <article
      id={item.id}
      className={`grid gap-6 border-b border-ist-green/8 py-8 last:border-0 md:grid-cols-[180px_1fr] ${
        muted ? 'opacity-55 grayscale' : ''
      }`}
    >
      <div className="relative hidden aspect-square overflow-hidden md:block">
        <Image src={thumb.src} alt={thumb.alt} fill className="object-cover" sizes="180px" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ist-green-deep/95 to-transparent px-3 pb-3 pt-6">
          <p className="font-display text-lg leading-tight text-white">{item.dateLabel}</p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {item.badge && <Badge>{item.badge}</Badge>}
          {item.recurring && <Badge className="bg-ist-gold/20 text-ist-green">Recurring</Badge>}
          {muted && <Badge className="bg-ist-green/10 text-ist-muted">Past</Badge>}
        </div>
        <h3 className="mt-3 font-display text-2xl text-ist-green sm:text-3xl">{item.title}</h3>
        <p className="mt-1 text-sm font-medium text-ist-teal md:hidden">{item.dateLabel}</p>
        <p className="mt-3 leading-relaxed text-ist-ink/65">{item.summary}</p>
        {item.scheduleKind === 'zuhr-window' && !muted && <ZuhrWindowNote />}
        {item.details && item.details.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ist-ink/60">
            {item.details.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ist-gold" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
        {item.location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ist-teal">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M7 1a4 4 0 0 1 4 4c0 3-4 8-4 8S3 8 3 5a4 4 0 0 1 4-4z"
                stroke="currentColor"
                strokeWidth="1.25"
              />
              <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.25" />
            </svg>
            {item.location}
          </p>
        )}
      </div>
    </article>
  );
}

export function EventsBoard({ showHeader = true }: { showHeader?: boolean }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [dbEvents, setDbEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/content/events');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.events)) setDbEvents(data.events);
      } catch {
        /* fall back to static */
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

  return (
    <div id="sports">
      {showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Calendar</span>
            <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">
              Upcoming events
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ist-ink/60">
              Recurring programmes and one-off gatherings — past events live in a separate tab.
            </p>
          </div>
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
                  tab === id
                    ? 'bg-ist-green text-white'
                    : 'text-ist-muted hover:text-ist-green'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showHeader && (
        <div
          className="mb-6 inline-flex rounded-full border border-ist-green/12 bg-white p-1"
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
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease }}
          className="mt-6"
          role="tabpanel"
        >
          {list.length === 0 ? (
            <p className="py-10 text-sm text-ist-muted">No {tab} events right now.</p>
          ) : (
            list.map((item) => <EventCard key={item.id} item={item} muted={tab === 'past'} />)
          )}
        </motion.div>
      </AnimatePresence>

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
