# IST Website V1

Marketing site for **Islamic Society of Toronto (Masjid Darus Salaam)**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- SQLite database (`data/ist.db`) for events, programmes, media, announcements
- Admin CMS at `/admin` (events, programmes, pictures)
- Forms → `POST /api/forms` → email `mamjed@myist.org` (Resend when configured)
- Prayer times + Classic widget from central Prayer Clock: `http://142.93.61.217`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**

### Admin

- URL: `/admin/login`
- Default credentials (change in `.env.local`): `admin` / `ist-admin-2026`

### Prayer Clock

The sticky iqamah banner and `/prayer-times` Classic embed read from the central Prayer Clock API:

```
NEXT_PUBLIC_PRAYER_CLOCK_API_URL=http://142.93.61.217
NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL=http://142.93.61.217/classic
```

Repo reference: https://github.com/amjed55/prayer-clock

### Email (production)

```
FORM_TO_EMAIL=mamjed@myist.org
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=IST Website <your-verified-sender>
```

## Key routes

`/`, `/prayer-times`, `/about`, `/education`, `/community`, `/services`, `/events`, `/careers`, `/get-involved`, `/contact`, `/visit`, `/privacy`, `/admin`
