import 'server-only';

import { dbAll } from './database';
import type { DbEvent, DbProgram } from './db';
import {
  expandCalendarRecord,
  type CalendarOccurrence,
  type CalendarRecord,
  type CalendarSource,
} from './calendar';

function eventRecord(event: DbEvent): CalendarRecord | null {
  if (!event.starts_at || !event.ends_at) return null;
  return {
    id: event.id,
    sourceType: 'event',
    title: event.title,
    summary: event.summary,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    recurrenceRule: event.recurrence_rule,
    recurrenceUntil: event.recurrence_until,
    venue: event.venue || event.location,
    imageSrc: event.image_src,
    href: `/events#${event.id}`,
  };
}

function programRecord(program: DbProgram): CalendarRecord | null {
  if (!program.starts_at || !program.ends_at) return null;
  return {
    id: program.id,
    sourceType: 'program',
    title: program.title,
    summary: program.summary,
    startsAt: program.starts_at,
    endsAt: program.ends_at,
    recurrenceRule: program.recurrence_rule,
    recurrenceUntil: program.recurrence_until,
    venue: program.venue,
    imageSrc: program.image_src,
    href:
      program.category === 'service'
        ? '/services'
        : program.category === 'community'
          ? '/community'
          : '/education',
  };
}

export async function listCalendarRecords(source?: CalendarSource) {
  const [events, programs] = await Promise.all([
    source === 'program'
      ? Promise.resolve([])
      : dbAll<DbEvent>(
          `SELECT * FROM events
           WHERE calendar_enabled = 1 AND published = 1 AND starts_at IS NOT NULL AND ends_at IS NOT NULL`,
        ),
    source === 'event'
      ? Promise.resolve([])
      : dbAll<DbProgram>(
          `SELECT * FROM programs
           WHERE calendar_enabled = 1 AND published = 1 AND starts_at IS NOT NULL AND ends_at IS NOT NULL`,
        ),
  ]);

  return [
    ...events.map(eventRecord).filter((record): record is CalendarRecord => Boolean(record)),
    ...programs.map(programRecord).filter((record): record is CalendarRecord => Boolean(record)),
  ];
}

export async function getCalendarRecord(source: CalendarSource, id: string) {
  const records = await listCalendarRecords(source);
  return records.find((record) => record.id === id);
}

export async function listCalendarOccurrences(
  rangeStart: Date,
  rangeEnd: Date,
  source?: CalendarSource,
) {
  const records = await listCalendarRecords(source);
  return records
    .flatMap((record) => expandCalendarRecord(record, rangeStart, rangeEnd))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)) as CalendarOccurrence[];
}
