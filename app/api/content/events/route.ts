import { NextResponse } from 'next/server';
import { listEvents, listEventsByHub } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as 'upcoming' | 'past' | null;
  const hub = searchParams.get('hub');
  const rows = hub ? listEventsByHub(hub) : listEvents(status || undefined);
  const events = rows
    .filter((e) => !status || e.status === status)
    .map((e) => ({
      id: e.id,
      title: e.title,
      dateLabel: e.date_label,
      summary: e.summary,
      badge: e.badge || undefined,
      location: e.location || undefined,
      status: e.status,
      recurring: Boolean(e.recurring),
      details: e.details_json ? (JSON.parse(e.details_json) as string[]) : undefined,
      scheduleKind: e.schedule_kind || undefined,
      imageSrc: e.image_src || undefined,
      startsAt: e.starts_at || undefined,
      endsAt: e.ends_at || undefined,
      hub: e.hub || undefined,
    }));
  return NextResponse.json({ events });
}
