import { NextResponse } from 'next/server';
import { listEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const status = new URL(req.url).searchParams.get('status') as 'upcoming' | 'past' | null;
  const rows = listEvents(status || undefined);
  const events = rows.map((e) => ({
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
  }));
  return NextResponse.json({ events });
}
