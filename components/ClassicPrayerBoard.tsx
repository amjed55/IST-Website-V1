'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addMinutes,
  format12,
  getDailyAdhan,
  getIqamah,
  getJummahAdhan,
  hm2min,
  isFriday,
  shouldShowJummah,
  type PrayerKey,
  type PrayerRow,
  type PrayerSettings,
  type TodayPrayersResponse,
} from '@/lib/prayer';
import { links } from '@/lib/content';
import { Button } from './ui';

type Announcement = { id: number; message: string; urgent?: boolean };

type QrCode = {
  id: string;
  label: string;
  url: string;
  color: string;
  color_end?: string;
  icon: string;
  style?: string;
  enabled?: boolean;
};

type BoardSettings = PrayerSettings & {
  org_name?: string;
  org_name_ar?: string;
  masjid_name?: string;
  logo_url?: string;
  clock_label?: string;
  color_theme?: string;
  next_animation?: string;
  show_sunrise?: boolean;
  show_weather?: boolean;
  show_qr?: boolean;
  weather_label?: string;
  weather_lat?: number;
  weather_lon?: number;
  last_updated_timezone?: string;
  qr_codes?: QrCode[];
  maghrib_iqama_offset?: number;
};

type WeatherCurrent = {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
  wind_speed_10m?: number;
  relative_humidity_2m?: number;
  is_day?: number;
};

const TZ = 'America/Toronto';
const DESIGN_W = 1920;
const DESIGN_H = 1080;

const PRAYER_META: {
  key: PrayerKey;
  en: string;
  ar: string;
  icon: string;
  cls: string;
}[] = [
  { key: 'fajr', en: 'Fajr', ar: 'الفجر', icon: 'fa-cloud-moon', cls: 'ch-fajr' },
  { key: 'dhuhr', en: 'Dhuhr', ar: 'الظهر', icon: 'fa-sun', cls: 'ch-dhuhr' },
  { key: 'asr', en: 'Asr', ar: 'العصر', icon: 'fa-cloud-sun', cls: 'ch-asr' },
  { key: 'maghrib', en: 'Maghrib', ar: 'المغرب', icon: 'fa-sun', cls: 'ch-maghrib' },
  { key: 'isha', en: 'Isha', ar: 'العشاء', icon: 'fa-moon', cls: 'ch-isha' },
];

const JUMMAH_META = [
  { key: 'jummah1' as const, field: 'jummah1_iqama' as const, title: 'First Jummah', ar: 'الجمعة الأولى' },
  { key: 'jummah2' as const, field: 'jummah2_iqama' as const, title: 'Second Jummah', ar: 'الجمعة الثانية' },
  { key: 'jummah3' as const, field: 'jummah3_iqama' as const, title: 'Third Jummah', ar: 'الجمعة الثالثة' },
];

const WEATHER_ICON: Record<number, string> = {
  0: 'fa-sun',
  1: 'fa-sun',
  2: 'fa-cloud-sun',
  3: 'fa-cloud',
  45: 'fa-smog',
  48: 'fa-smog',
  51: 'fa-cloud-rain',
  53: 'fa-cloud-rain',
  55: 'fa-cloud-rain',
  61: 'fa-cloud-rain',
  63: 'fa-cloud-rain',
  65: 'fa-cloud-showers-heavy',
  71: 'fa-snowflake',
  73: 'fa-snowflake',
  75: 'fa-snowflake',
  80: 'fa-cloud-rain',
  81: 'fa-cloud-showers-heavy',
  82: 'fa-cloud-showers-heavy',
  95: 'fa-bolt',
  96: 'fa-bolt',
};

const WEATHER_LABEL: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
};

function weatherClass(code?: number) {
  const t = Number(code);
  if (t === 0 || t === 1) return 'wx-sunny';
  if (t === 2) return 'wx-partly';
  if (t === 3) return 'wx-cloudy';
  if (t === 45 || t === 48) return 'wx-fog';
  if (t >= 71 && t <= 77) return 'wx-snow';
  if (t >= 95) return 'wx-storm';
  return 'wx-rain';
}

function ensureAbsoluteUrl(url?: string | null) {
  if (!url) return '';
  return `/api/prayers/asset?src=${encodeURIComponent(url)}`;
}

function normalizeQrUrl(url: string) {
  const t = url.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.includes('chat.whatsapp.com') || t.includes('wa.me')) return `https://${t.replace(/^\/+/, '')}`;
  if (t.includes('.')) return `https://${t.replace(/^\/+/, '')}`;
  return t;
}

function qrImageSrc(url: string, color: string) {
  const hex = color.replace('#', '');
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(normalizeQrUrl(url))}&size=180x180&color=${hex}&bgcolor=ffffff&margin=4&ecc=M`;
}

function torontoParts(d: Date) {
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, ...options }).format(d);
  return {
    weekday: fmt({ weekday: 'long' }),
    gregorian: fmt({ month: 'long', day: 'numeric', year: 'numeric' }),
    clock: fmt({ hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }),
  };
}

function hijriParts(d: Date) {
  try {
    const en = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
      timeZone: TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    const ar = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      timeZone: TZ,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    return { en: `${en} AH`, ar };
  } catch {
    return { en: '', ar: '' };
  }
}

function beginsOf(key: PrayerKey, prayers: PrayerRow) {
  if (key === 'maghrib') return prayers.maghrib || null;
  const map: Record<Exclude<PrayerKey, 'maghrib'>, keyof PrayerRow> = {
    fajr: 'fajr_begins',
    dhuhr: 'dhuhr_begins',
    asr: 'asr_begins',
    isha: 'isha_begins',
  };
  return prayers[map[key]] || null;
}

type ScheduleItem = {
  key: string;
  label: string;
  icon: string;
  beginMin: number;
  iqMin: number;
};

function buildSchedule(prayers: PrayerRow, settings: BoardSettings | undefined, friday: boolean): ScheduleItem[] {
  const iqOf = (key: PrayerKey) => hm2min(getIqamah(key, prayers, settings));

  if (friday && shouldShowJummah(settings, prayers, true)) {
    return [
      {
        key: 'fajr',
        label: 'Fajr',
        icon: 'fa-cloud-moon',
        beginMin: hm2min(prayers.fajr_begins),
        iqMin: iqOf('fajr'),
      },
      ...JUMMAH_META.map((j) => {
        const iq = hm2min(prayers[j.field]);
        return {
          key: j.key,
          label: j.title,
          icon: 'fa-mosque',
          beginMin: iq,
          iqMin: iq,
        };
      }).filter((j) => j.iqMin >= 0),
      {
        key: 'asr',
        label: 'Asr',
        icon: 'fa-cloud-sun',
        beginMin: hm2min(prayers.asr_begins),
        iqMin: iqOf('asr'),
      },
      {
        key: 'maghrib',
        label: 'Maghrib',
        icon: 'fa-sun',
        beginMin: hm2min(prayers.maghrib),
        iqMin: iqOf('maghrib'),
      },
      {
        key: 'isha',
        label: 'Isha',
        icon: 'fa-moon',
        beginMin: hm2min(prayers.isha_begins),
        iqMin: iqOf('isha'),
      },
    ].filter((x) => x.beginMin >= 0);
  }

  return PRAYER_META.map((p) => ({
    key: p.key,
    label: p.en,
    icon: p.icon,
    beginMin: hm2min(beginsOf(p.key, prayers)),
    iqMin: iqOf(p.key),
  })).filter((x) => x.beginMin >= 0);
}

function computeNextState(prayers: PrayerRow | null, settings: BoardSettings | undefined, now: Date) {
  const empty = {
    current: null as string | null,
    next: null as string | null,
    iqamaTarget: null as string | null,
    countdown: '--:--:--',
    nextLabel: '',
    nextIcon: 'fa-star-and-crescent',
  };
  if (!prayers) return empty;

  const schedule = buildSchedule(prayers, settings, now.getDay() === 5);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  let current: ScheduleItem | null = null;
  let next: ScheduleItem | null = null;
  for (const item of schedule) {
    if (item.beginMin >= 0 && nowMin >= item.beginMin) current = item;
    else if (!next && item.beginMin >= 0) next = item;
  }

  let target: ScheduleItem | null = null;
  let deadline: number | null = null;
  if (current && current.iqMin >= 0 && nowMin < current.iqMin) {
    target = current;
    deadline = current.iqMin;
  } else {
    target = next;
    deadline = next ? next.iqMin : null;
    if (!next && schedule.length) {
      target = schedule[0];
      next = schedule[0];
      deadline = next.iqMin >= 0 ? next.iqMin + 1440 : null;
    }
  }

  let countdown = '--:--:--';
  if (deadline !== null) {
    let secs = Math.max(0, Math.round((deadline - nowMin) * 60));
    const h = Math.floor(secs / 3600);
    secs %= 3600;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    countdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return {
    current: current?.key ?? null,
    next: target?.key ?? null,
    iqamaTarget: target?.key ?? null,
    countdown,
    nextLabel: target?.label ?? '',
    nextIcon: target?.icon ?? 'fa-star-and-crescent',
  };
}

function loadFaCss() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-ist-fa]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  link.dataset.istFa = '1';
  document.head.appendChild(link);
}

function loadBoardCss() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-ist-classic-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/prayer-clock-classic.css';
  link.dataset.istClassicCss = '1';
  document.head.appendChild(link);
}

export function ClassicPrayerBoard() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [now, setNow] = useState(() => new Date());
  const [prayers, setPrayers] = useState<PrayerRow | null>(null);
  const [settings, setSettings] = useState<BoardSettings | undefined>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const fit = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w < 40 || h < 40) return;
    setScale(Math.min(w / DESIGN_W, h / DESIGN_H));
  }, []);

  useEffect(() => {
    loadFaCss();
    loadBoardCss();
  }, []);

  useEffect(() => {
    fit();
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [fit]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/prayers/today');
        const data = (await res.json()) as TodayPrayersResponse & {
          announcements?: Announcement[];
          settings?: BoardSettings;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.prayers) {
          setError(true);
          setPrayers(null);
          setReady(true);
          return;
        }
        setError(false);
        setPrayers(data.prayers);
        setSettings(data.settings as BoardSettings | undefined);
        setAnnouncements(data.announcements || []);
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(true);
          setReady(true);
        }
      }
    }
    load();
    const poll = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!settings?.show_weather && settings?.show_weather !== undefined) return;
    let cancelled = false;
    async function loadWeather() {
      const lat = settings?.weather_lat ?? 43.6532;
      const lon = settings?.weather_lon ?? -79.3832;
      const tz = encodeURIComponent(settings?.last_updated_timezone || TZ);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day&timezone=${tz}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setWeather(data.current || null);
      } catch {
        /* optional */
      }
    }
    loadWeather();
    const poll = window.setInterval(loadWeather, 15 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [settings?.show_weather, settings?.weather_lat, settings?.weather_lon, settings?.last_updated_timezone]);

  const nextState = useMemo(() => computeNextState(prayers, settings, now), [prayers, settings, now]);
  const dateParts = useMemo(() => torontoParts(now), [now]);
  const hijri = useMemo(() => hijriParts(now), [now]);
  const friday = isFriday(now);
  const showJummah = shouldShowJummah(settings, prayers, friday);
  const showSunrise = settings?.show_sunrise !== false;
  const showWeather = settings?.show_weather !== false;
  const showQr = settings?.show_qr !== false;
  const colorTheme = settings?.color_theme === 'ocean' ? 'ocean' : 'green';
  const zawalWindow = useMemo(() => {
    if (!prayers?.dhuhr_begins) return '—';
    const start = addMinutes(prayers.dhuhr_begins, -5);
    return `${format12(start)} – ${format12(prayers.dhuhr_begins)}`;
  }, [prayers]);

  const qrCodes = useMemo(() => {
    const list = Array.isArray(settings?.qr_codes) ? settings!.qr_codes! : [];
    return list.filter((q) => q.enabled !== false && q.url);
  }, [settings]);

  const tickerText = announcements.map((a) => a.message).filter(Boolean).join('   ·   ');

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ist-green/15 bg-[#061a17] shadow-lift">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ist-teal-light">
            Live Classic board
          </p>
          <p className="text-sm text-white/70">Native Prayer Clock · same layout as masjid TVs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={links.prayerClock} variant="teal" className="!px-4 !py-2 text-xs">
            Prayer details
          </Button>
          <Button href="/visit" variant="ghost" className="!px-4 !py-2 text-xs text-white">
            Visit & parking
          </Button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="relative w-full overflow-hidden bg-black"
        style={{ height: 'min(72vh, 720px)', minHeight: 360 }}
      >
        {error && !prayers ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <h2 className="font-display text-3xl">Prayer Clock not reachable</h2>
            <p className="max-w-md text-sm text-white/75">
              Live times come from the central Prayer Clock API. Check connectivity, then refresh.
            </p>
            <Button
              type="button"
              variant="teal"
              onClick={() => {
                setReady(false);
                setError(false);
                setReloadKey((value) => value + 1);
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="ist-classic-board max-w-none shrink-0"
              data-theme="classic"
              data-color={colorTheme}
              data-next-anim={settings?.next_animation || 'bold'}
              style={{
                width: DESIGN_W,
                height: DESIGN_H,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <div className={`outer-container${ready ? ' display-ready' : ''}`}>
                <header className="ist-header">
                  <div className="header-center">
                    {settings?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        id="orgLogo"
                        src={ensureAbsoluteUrl(settings.logo_url)}
                        alt="Logo"
                        className="org-logo"
                      />
                    )}
                    <div className="header-titles">
                      <div className="header-org-name">
                        {settings?.org_name || 'Islamic Society of Toronto'}
                      </div>
                      {settings?.org_name_ar ? (
                        <div className="header-org-name-ar" dir="rtl" lang="ar">
                          {settings.org_name_ar}
                        </div>
                      ) : null}
                      <div className="header-prayer-title">Prayer Timings</div>
                      <div className="header-subtitle">
                        {settings?.masjid_name?.trim() || 'Masjid Darus Salaam'}
                      </div>
                    </div>
                  </div>
                  {showQr && qrCodes.length > 0 && (
                    <div className="header-qr-row">
                      {qrCodes.map((q) => {
                        const bg =
                          q.style === 'gradient' && q.color_end
                            ? `linear-gradient(135deg, ${q.color} 0%, ${q.color_end} 100%)`
                            : q.color;
                        return (
                          <a
                            key={q.id}
                            href={normalizeQrUrl(q.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`qr-block qr-custom qr-${q.id}`}
                            style={{ background: bg, boxShadow: `0 4px 14px ${q.color}55` }}
                          >
                            <div className="qr-img-wrap">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={qrImageSrc(q.url, q.color)}
                                alt={q.label}
                                className="qr-generated"
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  width: '100%',
                                  height: '100%',
                                  display: 'block',
                                  objectFit: 'cover',
                                }}
                              />
                              <div className="qr-center-icon" style={{ background: q.color }}>
                                <i className={q.icon} />
                              </div>
                            </div>
                            <span className="qr-label">{q.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </header>

                <section className="info-bar">
                  <div className="info-card ic-date">
                    <div className="info-icon-badge">
                      <i className="fa-solid fa-calendar-day" />
                    </div>
                    <div className="info-content date-content-classic">
                      <div className="info-label">Today&apos;s Date</div>
                      <div className="date-classic-grid">
                        <div className="date-classic-col date-classic-greg">
                          <span className="date-classic-weekday">{dateParts.weekday}</span>
                          <span className="date-classic-gregorian">{dateParts.gregorian}</span>
                        </div>
                        {(hijri.en || hijri.ar) && (
                          <div className="date-classic-col date-classic-hijri">
                            {hijri.en && <div className="date-classic-hijri-en">{hijri.en}</div>}
                            {hijri.ar && (
                              <div className="date-classic-hijri-ar-text" dir="rtl" lang="ar">
                                {hijri.ar}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card ic-time">
                    <div className="info-icon-badge">
                      <i className="fa-solid fa-clock" />
                    </div>
                    <div className="info-content">
                      <div className="info-label">{settings?.clock_label || 'Local Time'}</div>
                      <div className="live-time-wrap">
                        <div id="liveTime" className="info-value large-time">
                          {dateParts.clock}
                        </div>
                      </div>
                    </div>
                  </div>

                  {showSunrise && (
                    <div className="info-card ic-sunrise">
                      <div className="info-icon-badge sunrise-badge">
                        <i className="fa-solid fa-sun" />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Sunrise</div>
                        <div className="info-value">{format12(prayers?.sunrise)}</div>
                        <div className="info-sub">Today&apos;s Dawn</div>
                      </div>
                    </div>
                  )}

                  <div className="info-card ic-next">
                    <div className="info-icon-badge next-prayer-badge">
                      <i className="fa-solid fa-hourglass-half" />
                    </div>
                    <div className="info-content next-prayer-content">
                      <div className="next-prayer-split">
                        <div className="next-prayer-left">
                          <div className="info-label next-prayer-heading">Next Prayer Is</div>
                          <div className="next-prayer-row">
                            <div className="next-prayer-icon" aria-hidden>
                              <i className={`fa-solid ${nextState.nextIcon}`} />
                            </div>
                            <div className="next-prayer-name" id="nextPrayerName">
                              {nextState.nextLabel || '—'}
                            </div>
                          </div>
                        </div>
                        <div className="next-prayer-right">
                          <div className="next-prayer-countdown-label">Iqamah in</div>
                          <span id="countdown" className="info-value next-countdown">
                            {nextState.countdown}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showWeather && (
                    <div
                      className={[
                        'info-card',
                        'ic-weather',
                        weather ? `${weatherClass(weather.weather_code)}${weather.is_day === 0 ? ' wx-night' : ''}` : 'wx-loading',
                      ].join(' ')}
                    >
                      <div className="info-icon-badge weather-badge">
                        <i
                          className={`fa-solid ${WEATHER_ICON[weather?.weather_code ?? 2] || 'fa-cloud'}`}
                        />
                      </div>
                      <div className="info-content">
                        <div className="info-label">{settings?.weather_label || 'Toronto, ON'}</div>
                        <div className="info-value">
                          {weather?.temperature_2m != null
                            ? `${Math.round(weather.temperature_2m)}°C`
                            : '—'}
                        </div>
                        <div className="info-sub">
                          {WEATHER_LABEL[weather?.weather_code ?? -1] || 'Loading weather…'}
                        </div>
                        {weather && (
                          <div className="weather-stats">
                            <span>
                              <i className="fa-solid fa-wind" /> {Math.round(weather.wind_speed_10m || 0)} km/h
                            </span>
                            <span>
                              <i className="fa-solid fa-droplet" /> {weather.relative_humidity_2m ?? '—'}%
                            </span>
                            <span>
                              Feels {weather.apparent_temperature != null ? `${Math.round(weather.apparent_temperature)}°` : '—'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                <section className="prayer-grid" id="prayerGrid">
                  {PRAYER_META.slice(0, 2).map((p) => (
                    <PrayerCard
                      key={p.key}
                      meta={p}
                      prayers={prayers}
                      settings={settings}
                      now={now}
                      isCurrent={nextState.current === p.key}
                      isNext={nextState.next === p.key && nextState.current !== p.key}
                    />
                  ))}

                  <div className="prayer-card zawal-card zawal-card-bc" id="card-zawal">
                    <div className="bc-card-head ch-zawal">
                      <i className="fa-solid fa-ban" aria-hidden />
                      <span className="bc-card-name">Zawal</span>
                    </div>
                    <div className="bc-zawal-body">
                      <span className="bc-zawal-label">No Prayer</span>
                      <span className="bc-zawal-window">{zawalWindow}</span>
                    </div>
                  </div>

                  {PRAYER_META.slice(2).map((p) => (
                    <PrayerCard
                      key={p.key}
                      meta={p}
                      prayers={prayers}
                      settings={settings}
                      now={now}
                      isCurrent={nextState.current === p.key}
                      isNext={nextState.next === p.key && nextState.current !== p.key}
                    />
                  ))}
                </section>

                {showJummah && prayers && (
                  <section className="jummah-section" id="jummahSection">
                    <div className="jummah-grid">
                      {JUMMAH_META.map((j) => {
                        if (!prayers[j.field]) return null;
                        const isCurrent = friday && nextState.current === j.key;
                        const isNext = friday && nextState.next === j.key && !isCurrent;
                        const adhan = getJummahAdhan(
                          Number(j.key.replace('jummah', '')) as 1 | 2 | 3,
                          prayers,
                          settings,
                        );
                        return (
                          <div
                            key={j.key}
                            className={[
                              'jummah-card',
                              isCurrent ? 'active prayer-now' : '',
                              isNext ? 'next-prayer' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            id={`card-${j.key}`}
                          >
                            {isCurrent && <span className="card-badge badge-now">NOW</span>}
                            {isNext && <span className="card-badge badge-next">NEXT</span>}
                            <div className="jummah-header">
                              <div className="j-title">{j.title}</div>
                              <div className="j-arabic">{j.ar}</div>
                              <div className="j-icon">
                                <i className="fa-solid fa-mosque" />
                              </div>
                            </div>
                            <div className="jummah-body">
                              <div className="j-col">
                                <div className="j-col-label">Adhan</div>
                                <div className="j-col-time">{format12(adhan)}</div>
                              </div>
                              <div className="j-divider" />
                              <div className="j-col j-col-khutba">
                                <div className="j-col-label">Khutba</div>
                                <div className="j-col-time">{format12(prayers[j.field])}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <div className="bottom-bar">
                  <div id="tickerBar" className="ticker-wrap">
                    <div className="ticker-icon">
                      <i className="fa-solid fa-bullhorn" />
                    </div>
                    <div className="ticker-track">
                      <span>
                        {tickerText ||
                          'Welcome to Masjid Darus Salaam · Prayer times subject to change · Please silence phones'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-2.5 text-xs text-white/50 sm:px-5">
        Native Classic board · synced from Prayer Clock API · Times subject to change
      </div>
    </div>
  );
}

function PrayerCard({
  meta,
  prayers,
  settings,
  now,
  isCurrent,
  isNext,
}: {
  meta: (typeof PRAYER_META)[number];
  prayers: PrayerRow | null;
  settings?: BoardSettings;
  now: Date;
  isCurrent: boolean;
  isNext: boolean;
}) {
  const begins = prayers ? beginsOf(meta.key, prayers) : null;
  const adhan = prayers ? getDailyAdhan(meta.key, prayers, settings) : null;
  const iqama = prayers ? getIqamah(meta.key, prayers, settings) : null;
  const iqMin = hm2min(iqama);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const showTomorrowHint = iqMin >= 0 && nowMin > iqMin;

  const classes = [
    'prayer-card',
    'prayer-card-bc',
    isCurrent ? 'active prayer-now' : '',
    isNext ? 'bc-is-next' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} id={`card-${meta.key}`} data-prayer={meta.key}>
      {isCurrent && <span className="card-badge badge-now">NOW</span>}
      {isNext && !isCurrent && <span className="card-badge badge-next">NEXT</span>}
      <div className={`bc-card-head ${meta.cls}`}>
        <i className={`fa-solid ${meta.icon}`} aria-hidden />
        <span className="bc-card-name">{meta.en}</span>
      </div>
      <div className="bc-times bc-times-stacked">
        <div className="bc-time-row">
          <span className="bc-time-lbl">Begins</span>
          <span className="bc-time-val">{format12(begins)}</span>
        </div>
        <div className="bc-time-row">
          <span className="bc-time-lbl">Adhan</span>
          <span className="bc-time-val">{format12(adhan)}</span>
        </div>
        <div className="bc-time-row bc-iqama-row">
          <span className="bc-time-lbl">
            Iqamah
            {showTomorrowHint && (
              <span className="iqama-tomorrow-hint" title="Past today's iqamah">
                <i className="fa-solid fa-forward" />
              </span>
            )}
          </span>
          <span className="bc-time-val bc-iqama-val">{format12(iqama)}</span>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Prefer ClassicPrayerBoard — kept as alias for existing imports */
export function PrayerEmbed() {
  return <ClassicPrayerBoard />;
}
