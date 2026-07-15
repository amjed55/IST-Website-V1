/** Prayer Clock API helpers + display formatting */

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerRow = {
  date?: string;
  fajr_begins?: string | null;
  fajr_iqama?: string | null;
  sunrise?: string | null;
  dhuhr_begins?: string | null;
  dhuhr_iqama?: string | null;
  asr_begins?: string | null;
  asr_iqama?: string | null;
  maghrib?: string | null;
  isha_begins?: string | null;
  isha_iqama?: string | null;
  jummah1_iqama?: string | null;
  jummah2_iqama?: string | null;
  jummah3_iqama?: string | null;
};

export type PrayerSettings = {
  maghrib_iqama_offset?: number;
  fajr_adhan_offset?: number;
  dhuhr_adhan_offset?: number;
  asr_adhan_offset?: number;
  isha_adhan_offset?: number;
  jummah_adhan_offset?: number;
  jummah1_adhan_offset?: number;
  jummah2_adhan_offset?: number;
  jummah3_adhan_offset?: number;
  jummah1_match_dhuhr_adhan?: boolean;
  show_jummah?: boolean;
  jummah_visibility?: string;
};

export type TodayPrayersResponse = {
  date: string;
  prayers: PrayerRow | null;
  current_prayer?: string | null;
  next_prayer?: string | null;
  settings?: PrayerSettings;
};

export const DAILY_PRAYERS: { key: PrayerKey; label: string; short: string }[] = [
  { key: 'fajr', label: 'Fajr', short: 'Fajr' },
  { key: 'dhuhr', label: 'Zuhr', short: 'Zuhr' },
  { key: 'asr', label: 'Asr', short: 'Asr' },
  { key: 'maghrib', label: 'Maghrib', short: 'Maghrib' },
  { key: 'isha', label: 'Isha', short: 'Isha' },
];

export const JUMMAH_SLOTS = [
  { key: 'jummah1' as const, label: 'Jummah 1', field: 'jummah1_iqama' as const },
  { key: 'jummah2' as const, label: 'Jummah 2', field: 'jummah2_iqama' as const },
  { key: 'jummah3' as const, label: 'Jummah 3', field: 'jummah3_iqama' as const },
];

function intOr(value: unknown, fallback: number) {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** "HH:MM" → minutes from midnight, or -1 */
export function hm2min(hm?: string | null) {
  if (!hm || !/^\d{1,2}:\d{2}/.test(hm)) return -1;
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

export function addMinutes(hm: string | null | undefined, delta: number): string | null {
  const base = hm2min(hm);
  if (base < 0) return null;
  let total = base + delta;
  if (total < 0) total += 24 * 60;
  total %= 24 * 60;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function format12(hm?: string | null) {
  if (!hm) return '—';
  const mins = hm2min(hm);
  if (mins < 0) return '—';
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function maghribIqama(prayers: PrayerRow, settings?: PrayerSettings) {
  return addMinutes(prayers.maghrib, intOr(settings?.maghrib_iqama_offset, 3));
}

export function getIqamah(key: PrayerKey, prayers: PrayerRow, settings?: PrayerSettings) {
  if (key === 'maghrib') return maghribIqama(prayers, settings);
  const map: Record<Exclude<PrayerKey, 'maghrib'>, keyof PrayerRow> = {
    fajr: 'fajr_iqama',
    dhuhr: 'dhuhr_iqama',
    asr: 'asr_iqama',
    isha: 'isha_iqama',
  };
  return prayers[map[key]] || null;
}

function adhanOffset(key: PrayerKey, settings?: PrayerSettings) {
  const defaults: Record<PrayerKey, number> = { fajr: 15, dhuhr: 15, asr: 10, maghrib: 0, isha: 15 };
  if (key === 'maghrib') return 0;
  return intOr(settings?.[`${key}_adhan_offset` as keyof PrayerSettings], defaults[key]);
}

export function getDailyAdhan(key: PrayerKey, prayers: PrayerRow, settings?: PrayerSettings) {
  if (key === 'maghrib') return prayers.maghrib || null;
  const iq = getIqamah(key, prayers, settings);
  return addMinutes(iq, -adhanOffset(key, settings));
}

function jummahAdhanOffset(n: 1 | 2 | 3, settings?: PrayerSettings) {
  const key = `jummah${n}_adhan_offset` as keyof PrayerSettings;
  if (settings?.[key] !== undefined && settings?.[key] !== null && settings?.[key] !== '') {
    return intOr(settings[key], 0);
  }
  return intOr(settings?.jummah_adhan_offset, 0);
}

/** Khutba time is stored as jummah*_iqama in Prayer Clock */
export function getJummahKhutba(slot: 1 | 2 | 3, prayers: PrayerRow) {
  return prayers[`jummah${slot}_iqama` as keyof PrayerRow] as string | null | undefined;
}

export function getJummahAdhan(slot: 1 | 2 | 3, prayers: PrayerRow, settings?: PrayerSettings) {
  if (slot === 1 && settings?.jummah1_match_dhuhr_adhan !== false) {
    return addMinutes(prayers.dhuhr_iqama, -adhanOffset('dhuhr', settings));
  }
  const khutba = getJummahKhutba(slot, prayers);
  return addMinutes(khutba, -jummahAdhanOffset(slot, settings));
}

/** Start = listed Jummah time (khutba begins). Adhan is before that. */
export function getJummahTimes(slot: 1 | 2 | 3, prayers: PrayerRow, settings?: PrayerSettings) {
  const adhan = getJummahAdhan(slot, prayers, settings);
  const khutba = getJummahKhutba(slot, prayers) || null;
  return {
    start: khutba,
    adhan,
    khutba,
  };
}

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/** Next prayer by iqamah; wraps to fajr tomorrow if all passed */
export function getNextIqamahKey(
  prayers: PrayerRow,
  settings?: PrayerSettings,
  now = new Date(),
): PrayerKey | null {
  const nowMin = nowMinutes(now);
  for (const { key } of DAILY_PRAYERS) {
    const iq = hm2min(getIqamah(key, prayers, settings));
    if (iq >= 0 && iq > nowMin) return key;
  }
  return 'fajr';
}

export function isFriday(date = new Date()) {
  return date.getDay() === 5;
}

export function shouldShowJummah(
  settings: PrayerSettings | undefined,
  prayers: PrayerRow | null,
  friday = isFriday(),
) {
  let mode = settings?.jummah_visibility;
  if (!mode || mode === 'true' || mode === 'false') {
    mode = settings?.show_jummah === false ? 'off' : 'fridays_only';
  }
  if (mode === 'off') return false;
  if (mode === 'always') return true;
  if (mode === 'when_times_exist') {
    return JUMMAH_SLOTS.some((j) => Boolean(prayers?.[j.field]));
  }
  return friday;
}

export function prayerClockOrigin() {
  const embed =
    process.env.NEXT_PUBLIC_PRAYER_CLOCK_API_URL ||
    process.env.NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL ||
    'http://localhost:5000/classic';
  try {
    const u = new URL(embed);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'http://localhost:5000';
  }
}
