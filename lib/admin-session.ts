export const ADMIN_COOKIE = 'ist_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const DEVELOPMENT_SECRET = 'ist-development-secret-not-for-production';

export function adminJwtSecret() {
  const configured = process.env.ADMIN_JWT_SECRET?.trim();

  if (process.env.NODE_ENV === 'production') {
    if (!configured || configured.length < 32) {
      throw new Error('ADMIN_JWT_SECRET must be set to at least 32 characters in production.');
    }
    return new TextEncoder().encode(configured);
  }

  return new TextEncoder().encode(configured || DEVELOPMENT_SECRET);
}
