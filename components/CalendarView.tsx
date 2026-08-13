'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CalendarOccurrence, CalendarSource } from '@/lib/calendar';

const TZ = 'America/Toronto';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Filter = 'all' | CalendarSource;
type View = 'month' | 'agenda';

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, count: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function gridStart(month: Date) {
  const start = monthStart(month);
  return new Date(start.getTime() - start.getUTCDay() * 24 * 60 * 60 * 1000);
}

function addDays(date: Date, count: number) {
  return new Date(date.getTime() + count * 24 * 60 * 60 * 1000);
}

function dateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function gridDayKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}

function timeLabel(start: string, end: string) {
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${format.format(new Date(start))}–${format.format(new Date(end))}`;
}

function longDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function currentTorontoMonth() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, 1));
}

function CalendarItem({
  item,
  compact = false,
  admin = false,
}: {
  item: CalendarOccurrence;
  compact?: boolean;
  admin?: boolean;
}) {
  const detailHref = admin
    ? `/admin/${item.sourceType === 'event' ? 'events' : 'programs'}?edit=${encodeURIComponent(item.id)}`
    : item.href;
  const icsHref = `/api/calendar.ics?type=${item.sourceType}&id=${encodeURIComponent(
    item.id,
  )}&start=${encodeURIComponent(item.startsAt)}`;

  return (
    <article
      className={`group border-l-2 ${
        item.sourceType === 'event' ? 'border-ist-gold' : 'border-ist-teal'
      } bg-white/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft ${
        compact ? 'px-2 py-1.5' : 'p-4'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ist-muted">
        {item.sourceType} · {timeLabel(item.startsAt, item.endsAt)}
      </p>
      <h3 className={`${compact ? 'text-xs' : 'mt-1 font-display text-xl'} text-ist-green`}>
        <Link href={detailHref} className="hover:underline">
          {item.title}
        </Link>
      </h3>
      {!compact && (
        <>
          <p className="mt-1 text-xs text-ist-ink/60">{item.venue || 'Masjid Darus Salaam'}</p>
          <p className="mt-2 line-clamp-2 text-sm text-ist-ink/70">{item.summary}</p>
          <a
            href={icsHref}
            className="mt-3 inline-flex text-xs font-semibold text-ist-teal hover:underline"
          >
            Add to calendar
          </a>
        </>
      )}
    </article>
  );
}

export function CalendarView({ admin = false }: { admin?: boolean }) {
  const [month, setMonth] = useState(currentTorontoMonth);
  const [view, setView] = useState<View>('month');
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<CalendarOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rangeStart = useMemo(() => gridStart(month), [month]);
  const rangeEnd = useMemo(() => addDays(rangeStart, 42), [rangeStart]);
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, index) => addDays(rangeStart, index)),
    [rangeStart],
  );

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          from: rangeStart.toISOString(),
          to: rangeEnd.toISOString(),
        });
        if (filter !== 'all') params.set('source', filter);
        const response = await fetch(`/api/content/calendar?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Calendar unavailable');
        setItems(data.occurrences || []);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Calendar unavailable');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [filter, rangeEnd, rangeStart]);

  const byDay = useMemo(() => {
    const grouped = new Map<string, CalendarOccurrence[]>();
    for (const item of items) {
      const key = dateKey(item.startsAt);
      grouped.set(key, [...(grouped.get(key) || []), item]);
    }
    return grouped;
  }, [items]);

  const monthLabel = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(month);

  return (
    <section aria-labelledby="community-calendar-title">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Community schedule</span>
          <h2
            id="community-calendar-title"
            className="mt-3 font-display text-4xl text-ist-green sm:text-5xl"
          >
            Events &amp; programs calendar
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ist-ink/60">
            Times are shown in Toronto. Subscribe once to keep your calendar updated.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/calendar.ics"
            className="rounded-full border border-ist-green/20 px-4 py-2 text-sm font-semibold text-ist-green transition hover:-translate-y-0.5 hover:border-ist-teal"
          >
            Subscribe / download
          </a>
          {admin && (
            <>
              <Link
                href="/admin/events"
                className="rounded-full bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep"
              >
                Add event
              </Link>
              <Link
                href="/admin/programs"
                className="rounded-full bg-ist-teal px-4 py-2 text-sm font-semibold text-white"
              >
                Add program
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 border border-ist-green/10 bg-ist-cream/60 shadow-soft">
        <div className="flex flex-col gap-3 border-b border-ist-green/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, -1))}
              className="calendar-control"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setMonth(currentTorontoMonth())}
              className="calendar-control px-4"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="calendar-control"
              aria-label="Next month"
            >
              →
            </button>
            <h3 className="ml-2 font-display text-2xl text-ist-green">{monthLabel}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'event', 'program'] as Filter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === value
                    ? 'bg-ist-green text-white'
                    : 'border border-ist-green/15 text-ist-green hover:border-ist-teal'
                }`}
              >
                {value === 'all' ? 'All' : `${value}s`}
              </button>
            ))}
            {(['month', 'agenda'] as View[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  view === value ? 'bg-ist-teal text-white' : 'text-ist-muted hover:bg-white'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-80 place-items-center" aria-busy="true">
            <div className="text-center">
              <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-ist-teal/20 border-t-ist-teal" />
              <p className="mt-3 text-sm text-ist-muted">Loading calendar…</p>
            </div>
          </div>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : view === 'month' ? (
          <div className="hidden sm:block">
            <div className="grid grid-cols-7 border-b border-ist-green/10 bg-white/70">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-ist-muted"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = gridDayKey(day);
                const dayItems = byDay.get(key) || [];
                const currentMonth = day.getUTCMonth() === month.getUTCMonth();
                const today = key === dateKey(new Date());
                return (
                  <div
                    key={key}
                    className={`min-h-32 border-b border-r border-ist-green/10 p-1.5 ${
                      currentMonth ? 'bg-white/40' : 'bg-ist-cream-dark/35 text-ist-muted'
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        today ? 'bg-ist-gold font-bold text-ist-green-deep' : ''
                      }`}
                    >
                      {day.getUTCDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <CalendarItem key={item.occurrenceId} item={item} compact admin={admin} />
                      ))}
                      {dayItems.length > 3 && (
                        <p className="px-1 text-[10px] font-semibold text-ist-teal">
                          +{dayItems.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {(view === 'agenda' || view === 'month') && (
          <div className={`${view === 'month' ? 'sm:hidden' : ''} divide-y divide-ist-green/10`}>
            {items.length ? (
              Array.from(byDay.entries()).map(([day, dayItems]) => (
                <div key={day} className="grid gap-3 p-4 sm:grid-cols-[12rem_1fr]">
                  <h3 className="font-display text-xl text-ist-green">
                    {longDate(dayItems[0].startsAt)}
                  </h3>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {dayItems.map((item) => (
                      <CalendarItem key={item.occurrenceId} item={item} admin={admin} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-10 text-center text-sm text-ist-muted">
                No scheduled events or programs in this range.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
