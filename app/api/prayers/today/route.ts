import { NextResponse } from 'next/server';
import { prayerClockOrigin, type PrayerSettings, type TodayPrayersResponse } from '@/lib/prayer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchJson(url: string) {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

export async function GET() {
  const base = prayerClockOrigin();
  try {
    const [today, settings, announcements] = await Promise.all([
      fetchJson(`${base}/api/prayers/today`) as Promise<TodayPrayersResponse>,
      fetchJson(`${base}/api/settings`).catch(() => null) as Promise<PrayerSettings | null>,
      fetchJson(`${base}/api/announcements`).catch(() => []) as Promise<
        { id: number; message: string; is_active?: boolean; is_urgent?: boolean }[]
      >,
    ]);

    const activeAnnouncements = (Array.isArray(announcements) ? announcements : [])
      .filter((a) => a.is_active !== false)
      .map((a) => ({
        id: a.id,
        message: a.message,
        urgent: Boolean(a.is_urgent),
      }));

    return NextResponse.json(
      {
        ...today,
        settings: settings || undefined,
        announcements: activeAnnouncements,
        source: base,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error: 'Prayer Clock unavailable',
        date: '',
        prayers: null,
        announcements: [],
        source: base,
      },
      { status: 503 },
    );
  }
}
