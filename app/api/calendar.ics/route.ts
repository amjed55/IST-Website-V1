import { NextRequest, NextResponse } from 'next/server';
import type { CalendarSource } from '@/lib/calendar';
import { listCalendarOccurrences } from '@/lib/calendar-data';
import { buildCalendarFile } from '@/lib/ical';

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get('type');
  const id = request.nextUrl.searchParams.get('id');
  const startParam = request.nextUrl.searchParams.get('start');
  const source: CalendarSource | undefined =
    typeParam === 'event' || typeParam === 'program' ? typeParam : undefined;

  const now = new Date();
  const requestedStart = startParam ? new Date(startParam) : null;
  const from =
    requestedStart && !Number.isNaN(requestedStart.getTime())
      ? new Date(requestedStart.getTime() - 24 * 60 * 60 * 1000)
      : now;
  const to =
    requestedStart && !Number.isNaN(requestedStart.getTime())
      ? new Date(requestedStart.getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 370 * 24 * 60 * 60 * 1000);

  let occurrences = await listCalendarOccurrences(from, to, source);
  if (id) occurrences = occurrences.filter((occurrence) => occurrence.id === id);
  if (requestedStart && !Number.isNaN(requestedStart.getTime())) {
    occurrences = occurrences.filter(
      (occurrence) =>
        Math.abs(Date.parse(occurrence.startsAt) - requestedStart.getTime()) < 60_000,
    );
  }

  if ((id || startParam) && occurrences.length === 0) {
    return NextResponse.json({ error: 'Calendar item not found.' }, { status: 404 });
  }

  const single = occurrences.length === 1;
  const filename = single
    ? `${occurrences[0].sourceType}-${occurrences[0].id}.ics`
    : 'ist-events-programs.ics';
  const body = buildCalendarFile(occurrences, {
    name: single ? occurrences[0].title : 'IST Events & Programs',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });

  return new NextResponse(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Type': 'text/calendar; charset=utf-8',
    },
  });
}
