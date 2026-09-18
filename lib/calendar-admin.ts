import {
  buildRecurrenceRule,
  torontoLocalToUtc,
  validateCalendarWindow,
  type RecurrenceFrequency,
} from './calendar';

function enabled(value: unknown, fallback = false) {
  if (value === undefined) return fallback;
  return value === true || value === 1 || value === '1' || value === 'on' || value === 'true';
}

function optionalText(value: unknown) {
  const text = value === undefined || value === null ? '' : String(value).trim();
  return text || null;
}

export function readCalendarFields(body: Record<string, unknown>) {
  const calendarEnabled = enabled(body.calendar_enabled ?? body.calendarEnabled);
  const startsAt = torontoLocalToUtc(
    String(body.starts_at ?? body.startsAt ?? body.calendar_start ?? ''),
  );
  const endsAt = torontoLocalToUtc(
    String(body.ends_at ?? body.endsAt ?? body.calendar_end ?? ''),
  );
  const rawFrequency = String(
    body.recurrence_frequency ?? body.recurrenceFrequency ?? body.schedule_type ?? 'none',
  );
  const frequency: RecurrenceFrequency =
    rawFrequency === 'daily' || rawFrequency === 'weekly' ? rawFrequency : 'none';
  const weekdays = String(body.recurrence_days ?? body.recurrenceDays ?? '')
    .split(',')
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);
  const recurrenceUntil = optionalText(
    body.recurrence_until ?? body.recurrenceUntil,
  );
  const recurrenceRule =
    calendarEnabled && startsAt
      ? buildRecurrenceRule({
          frequency,
          startsAt,
          interval: Number(body.recurrence_interval ?? body.recurrenceInterval ?? 1),
          weekdays,
          until: recurrenceUntil,
        })
      : null;

  return {
    calendarEnabled: calendarEnabled ? 1 : 0,
    startsAt,
    endsAt,
    recurrenceRule,
    recurrenceUntil,
    venue: optionalText(body.venue ?? body.location),
    published: enabled(body.published, true) ? 1 : 0,
    recurring: recurrenceRule ? 1 : 0,
    error: calendarEnabled ? validateCalendarWindow(startsAt, endsAt) : null,
  };
}
