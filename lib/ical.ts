import type { CalendarOccurrence } from './calendar';

function escapeIcal(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function utcStamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function foldLine(line: string) {
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = rest.slice(73);
  }
  chunks.push(rest);
  return chunks.join('\r\n ');
}

export function buildCalendarFile(
  occurrences: CalendarOccurrence[],
  options: { name?: string; siteUrl?: string } = {},
) {
  const siteUrl = (options.siteUrl || 'https://islamicsocietyoftoronto.com').replace(
    /\/+$/,
    '',
  );
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Islamic Society of Toronto//Community Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcal(options.name || 'IST Events & Programs')}`,
    'X-WR-TIMEZONE:America/Toronto',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ];

  for (const occurrence of occurrences) {
    const url = `${siteUrl}${occurrence.href}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcal(`${occurrence.occurrenceId}@islamicsocietyoftoronto.com`)}`,
      `DTSTAMP:${utcStamp(new Date())}`,
      `DTSTART:${utcStamp(occurrence.startsAt)}`,
      `DTEND:${utcStamp(occurrence.endsAt)}`,
      `SUMMARY:${escapeIcal(occurrence.title)}`,
      `DESCRIPTION:${escapeIcal(occurrence.summary)}`,
      `LOCATION:${escapeIcal(occurrence.venue || 'Masjid Darus Salaam')}`,
      `URL:${url}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
