# IST Website V1

Marketing site for **Islamic Society of Toronto (Masjid Darus Salaam)**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Forms → `POST /api/forms` → email `mamjed@myist.org` (Resend when configured)
- Prayer times embed: `http://142.93.61.217/classic`

## Setup

```bash
cd "C:\Users\Moham\Desktop\Tech Projects\IST-Website-V1"
npm install
copy .env.example .env.local
npm run dev
```

Open **http://localhost:3000**

### Prayer Clock (local widget)

The `/prayer-times` page embeds the Classic board from your Prayer Clock app:

```bash
cd "C:\Users\Moham\Desktop\Tech Projects\Prayer-Clock\Widget\backend"
.\.venv\Scripts\activate
python run.py
```

Board URL: `http://localhost:5000/classic`  
Set `NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL` in `.env.local` if your clock runs elsewhere.

### Email (production)

Set in `.env.local`:

```
FORM_TO_EMAIL=mamjed@myist.org
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=IST Website <your-verified-sender>
```

Without `RESEND_API_KEY`, forms still succeed locally and log to the server console.

## Key routes

`/`, `/prayer-times`, `/about`, `/education`, `/community`, `/services`, `/events`, `/careers`, `/get-involved`, `/contact`, `/visit`, `/privacy`
