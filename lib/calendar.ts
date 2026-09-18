import { RRule, rrulestr, type Weekday } from 'rrule';

export const TORONTO_TIME_ZONE = 'America/Toronto';
export const CALENDAR_WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;

export type CalendarSource = 'event' | 'program';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly';

export type CalendarRecord = {
  id: string;
  sourceType: CalendarSource;
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  recurrenceRule?: string | null;
  recurrenceUntil?: string | null;
  venue?: string | null;
  imageSrc?: string | null;
  href: string;
};

export type CalendarOccurrence = Omit<
  CalendarRecord,
  'startsAt' | 'endsAt' | 'recurrenceRule' | 'recurrenceUntil'
> & {
  occurrenceId: string;
  startsAt: string;
  endsAt: string;
  recurring: boolean;
};

type RecurrenceInput = {
  frequency: RecurrenceFrequency;
  startsAt: string;
  interval?: number;
  weekdays?: string[];
  until?: string | null;
};

function partsInTimeZone(date: Date, timeZone = TORONTO_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
}

function timeZoneOffset(date: Date, timeZone = TORONTO_TIME_ZONE) {
  const parts = partsInTimeZone(date, timeZone);
  const represented = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return represented - date.getTime();
}

export function torontoLocalToUtc(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const absolute = new Date(trimmed);
    return Number.isNaN(absolute.getTime()) ? null : absolute.toISOString();
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '0'] = match;
  const floating = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  let instant = floating - timeZoneOffset(new Date(floating));
  instant = floating - timeZoneOffset(new Date(instant));
  const result = new Date(instant);
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

export function toTorontoLocalInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = partsInTimeZone(date);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(
    2,
    '0',
  )}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function floatingTorontoDate(instant: Date) {
  const parts = partsInTimeZone(instant);
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );
}

export function buildRecurrenceRule(input: RecurrenceInput) {
  if (input.frequency === 'none') return null;
  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) return null;

  const weekdayMap: Record<string, Weekday> = {
    MO: RRule.MO,
    TU: RRule.TU,
    WE: RRule.WE,
    TH: RRule.TH,
    FR: RRule.FR,
    SA: RRule.SA,
    SU: RRule.SU,
  };
  const byweekday = (input.weekdays || [])
    .filter((day) => day in weekdayMap)
    .map((day) => weekdayMap[day]);

  let until: Date | undefined;
  if (input.until && /^\d{4}-\d{2}-\d{2}$/.test(input.until)) {
    const [year, month, day] = input.until.split('-').map(Number);
    until = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  }

  return new RRule({
    freq: input.frequency === 'daily' ? RRule.DAILY : RRule.WEEKLY,
    interval: Math.max(1, Math.min(12, Number(input.interval) || 1)),
    dtstart: floatingTorontoDate(start),
    byweekday: input.frequency === 'weekly' && byweekday.length ? byweekday : undefined,
    until,
    tzid: TORONTO_TIME_ZONE,
  }).toString();
}

export function expandCalendarRecord(
  record: CalendarRecord,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const startsAt = new Date(record.startsAt);
  const endsAt = new Date(record.endsAt);
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    endsAt <= startsAt
  ) {
    return [] as CalendarOccurrence[];
  }

  const duration = endsAt.getTime() - startsAt.getTime();
  const starts = record.recurrenceRule
    ? rrulestr(record.recurrenceRule).between(rangeStart, rangeEnd, true)
    : startsAt >= rangeStart && startsAt <= rangeEnd
      ? [startsAt]
      : [];

  return starts.map((start) => ({
    id: record.id,
    sourceType: record.sourceType,
    title: record.title,
    summary: record.summary,
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + duration).toISOString(),
    venue: record.venue,
    imageSrc: record.imageSrc,
    href: record.href,
    recurring: Boolean(record.recurrenceRule),
    occurrenceId: `${record.sourceType}-${record.id}-${start.toISOString()}`,
  }));
}

export function validateCalendarWindow(startsAt: string | null, endsAt: string | null) {
  if (!startsAt || !endsAt) return 'Calendar start and end are required.';
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Calendar start and end must be valid dates.';
  }
  if (end <= start) return 'Calendar end must be after its start.';
  return null;
}
