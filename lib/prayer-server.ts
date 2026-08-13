import 'server-only';

const DEFAULT_PRAYER_CLOCK_ORIGIN = 'http://142.93.61.217';

export function prayerClockOrigin() {
  const configured = process.env.PRAYER_CLOCK_API_URL || DEFAULT_PRAYER_CLOCK_ORIGIN;
  const url = new URL(configured);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('PRAYER_CLOCK_API_URL must use http or https.');
  }
  return url.origin;
}

export function prayerClockAssetUrl(input: string) {
  const origin = prayerClockOrigin();
  const resolved = new URL(input, `${origin}/`);
  if (resolved.origin !== origin) {
    throw new Error('Prayer Clock asset must use the configured upstream origin.');
  }
  return resolved;
}
