# IST Website V1

Marketing site for **Islamic Society of Toronto (Masjid Darus Salaam)**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- PostgreSQL in production with a zero-config SQLite fallback (`data/ist.db`) for local development
- S3-compatible media storage in production with `public/uploads` fallback locally
- Admin CMS at `/admin` (events, programmes, pictures, careers/jobs, Instagram)
- Forms → `POST /api/forms` → email `mamjed@myist.org` (Resend when configured)
- Prayer times + Classic widget from the server-side central Prayer Clock proxy
- Embedded live audio from `https://masjid-darus-salaam.mixlr.com/`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**

### Optional local PostgreSQL + S3-compatible storage

The application needs no external services for normal local development. To test
the production adapters, start PostgreSQL and MinIO:

```bash
docker compose up -d
```

Then add these values to `.env.local`:

```dotenv
DATABASE_URL=postgres://ist:ist-local@localhost:5432/ist
S3_BUCKET=ist-media
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_URL=http://localhost:9000/ist-media
S3_ACCESS_KEY_ID=ist
S3_SECRET_ACCESS_KEY=ist-local-secret
S3_FORCE_PATH_STYLE=true
```

`DATABASE_URL` switches all CMS reads and writes to PostgreSQL. `S3_BUCKET`
switches uploads to S3/MinIO; `S3_PUBLIC_URL` must be a browser-readable base URL.
The included credentials are local-only and must never be reused in production.

### Admin

- URL: `/admin/login`
- Local fallback credentials when env values are omitted: `admin` / `ist-admin-local`
- Production startup requires `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a 32+ character `ADMIN_JWT_SECRET`
- Manage events, programmes, **careers/jobs**, pictures, announcements, Instagram, users, and site settings

### Prayer Clock

The sticky iqamah banner and `/prayer-times` native Classic board read from the central Prayer Clock API (no iframe):

```
PRAYER_CLOCK_API_URL=http://142.93.61.217
```

`/prayer-times` renders the Classic TV layout natively. Browsers call the same-origin
`/api/prayers` routes, so the upstream HTTP host is never embedded into HTTPS pages.

Repo reference: https://github.com/amjed55/prayer-clock

### Mixlr live audio

The homepage embeds Masjid Darus Salaam’s Mixlr live player and links to available
recordings. The default official player URL is built in. If Mixlr issues a new
Live Player URL from Creator Settings, override it with:

```dotenv
NEXT_PUBLIC_MIXLR_EMBED_URL=https://mixlr.com/masjid-darus-salaam/embed?autoplay=false
```

Playback begins only after the visitor presses play; browsers do not permit
reliable forced autoplay.

### Email (production)

```
FORM_TO_EMAIL=mamjed@myist.org
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=IST Website <your-verified-sender>
```

Production forms fail closed with a temporary-unavailable response when Resend or
real Cloudflare Turnstile credentials are missing. Development uses Turnstile test
keys and logs form payloads only when Resend is omitted.

## Key routes

`/`, `/prayer-times`, `/about`, `/education`, `/community`, `/services`, `/events`, `/careers`, `/get-involved`, `/contact`, `/visit`, `/privacy`, `/admin`
