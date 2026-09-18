import { NextRequest, NextResponse } from 'next/server';
import { listCalendarOccurrences } from '@/lib/calendar-data';
import type { CalendarSource } from '@/lib/calendar';

const MAX_RANGE_MS = 400 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 7));
  const from = new Date(request.nextUrl.searchParams.get('from') || defaultFrom.toISOString());
  const to = new Date(request.nextUrl.searchParams.get('to') || defaultTo.toISOString());
  const sourceParam = request.nextUrl.searchParams.get('source');
  const source: CalendarSource | undefined =
    sourceParam === 'event' || sourceParam === 'program' ? sourceParam : undefined;

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    to <= from ||
    to.getTime() - from.getTime() > MAX_RANGE_MS
  ) {
    return NextResponse.json(
      { error: 'Use a valid date range no longer than 400 days.' },
      { status: 400 },
    );
  }

  const occurrences = await listCalendarOccurrences(from, to, source);
  return NextResponse.json(
    {
      occurrences,
      range: { from: from.toISOString(), to: to.toISOString() },
      timeZone: 'America/Toronto',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
