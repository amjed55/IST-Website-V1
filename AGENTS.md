# AGENTS.md

## Cursor Cloud specific instructions

Single service: a Next.js (App Router) marketing site for the Islamic Society of Toronto. Node 22 / npm (uses `package-lock.json`).

- Run dev server: `npm run dev` (Next.js + Turbopack on `http://localhost:3000`). Standard scripts are in `package.json` (`dev`, `build`, `start`).
- `.env.local` is optional for local dev. Missing env vars fall back to safe defaults in code — notably Cloudflare Turnstile falls back to always-pass test keys (`lib/turnstile.ts`), so all forms can be submitted without real captcha keys. Copy `.env.example` to `.env.local` only if you need to override defaults (e.g. Resend email, prayer clock URL).
- Core "does it work" check: submit any form (e.g. `POST /api/forms`). Without `RESEND_API_KEY`, submissions succeed and are logged to the dev-server console instead of emailing; the UI shows "Thank you — your message was sent."
- `GET /api/prayers/today` returns HTTP 503 unless a separate external Prayer Clock service is reachable (default `http://localhost:5000/classic`, configurable via `NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL`). That service is NOT part of this repo, so 503 here is expected and not a bug.
- `npm run lint` (`next lint`) is not preconfigured — it prompts interactively to set up ESLint because the repo has no ESLint config. There is no committed lint setup to run non-interactively.
