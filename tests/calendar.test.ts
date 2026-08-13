import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecurrenceRule,
  expandCalendarRecord,
  torontoLocalToUtc,
  type CalendarRecord,
} from '../lib/calendar';
import { buildCalendarFile } from '../lib/ical';

test('Toronto local values normalize across daylight saving time', () => {
  assert.equal(torontoLocalToUtc('2026-01-15T10:00'), '2026-01-15T15:00:00.000Z');
  assert.equal(torontoLocalToUtc('2026-07-15T10:00'), '2026-07-15T14:00:00.000Z');
});

test('weekly recurrences preserve Toronto wall time across DST', () => {
  const startsAt = torontoLocalToUtc('2026-03-01T10:00')!;
  const endsAt = torontoLocalToUtc('2026-03-01T11:00')!;
  const recurrenceRule = buildRecurrenceRule({
    frequency: 'weekly',
    startsAt,
    weekdays: ['SU'],
    until: '2026-03-15',
  });
  assert.ok(recurrenceRule);

  const record: CalendarRecord = {
    id: 'sunday-class',
    sourceType: 'program',
    title: 'Sunday class',
    summary: 'Weekly class',
    startsAt,
    endsAt,
    recurrenceRule,
    href: '/education',
  };
  const occurrences = expandCalendarRecord(
    record,
    new Date('2026-02-28T00:00:00.000Z'),
    new Date('2026-03-16T23:59:59.000Z'),
  );

  assert.deepEqual(
    occurrences.map((occurrence) => occurrence.startsAt),
    [
      '2026-03-01T15:00:00.000Z',
      '2026-03-08T14:00:00.000Z',
      '2026-03-15T14:00:00.000Z',
    ],
  );
});

test('iCalendar output escapes text and uses stable event fields', () => {
  const body = buildCalendarFile([
    {
      id: 'community-night',
      occurrenceId: 'event-community-night-2026-08-15',
      sourceType: 'event',
      title: 'Community, Night',
      summary: 'Talk; dinner\nFamilies welcome',
      startsAt: '2026-08-15T22:00:00.000Z',
      endsAt: '2026-08-16T00:00:00.000Z',
      venue: 'Main Hall',
      href: '/events#community-night',
      recurring: false,
    },
  ]);

  assert.match(body, /BEGIN:VCALENDAR/);
  assert.match(body, /SUMMARY:Community\\, Night/);
  assert.match(body, /DESCRIPTION:Talk\\; dinner\\nFamilies welcome/);
  assert.match(body, /DTSTART:20260815T220000Z/);
  assert.match(body, /UID:event-community-night-2026-08-15@islamicsocietyoftoronto.com/);
});
