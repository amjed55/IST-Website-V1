/** Cloudflare Turnstile — falls back to always-pass test keys for local/dev */
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
export const TURNSTILE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export function getTurnstileSiteKey() {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    (process.env.NODE_ENV === 'production' ? null : TURNSTILE_TEST_SITE_KEY)
  );
}

export function getTurnstileSecretKey() {
  return (
    process.env.TURNSTILE_SECRET_KEY ||
    (process.env.NODE_ENV === 'production' ? null : TURNSTILE_TEST_SECRET_KEY)
  );
}
