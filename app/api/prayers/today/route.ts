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
    const [today, settings] = await Promise.all([
      fetchJson(`${base}/api/prayers/today`) as Promise<TodayPrayersResponse>,
      fetchJson(`${base}/api/settings`).catch(() => null) as Promise<PrayerSettings | null>,
    ]);

    return NextResponse.json(
      {
        ...today,
        settings: settings || undefined,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: 'Prayer Clock unavailable', date: '', prayers: null },
      { status: 503 },
    );
  }
}
