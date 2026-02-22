# Staycation Journal (V1) — Next.js + Supabase + Cloudflare R2

Private, shared “highlight reel” website for events → days → curated photos, with lightweight notes + locations.

## What’s included
- Next.js App Router + Tailwind UI (Astrolus-inspired spacing/card styling)
- Supabase Auth (email/password) + Postgres schema + RLS policies
- Events home (event cards w/ hero thumbnail)
- Event detail (day cards; each day shows all thumbnails)
- Lightbox viewer + download original
- Admin panel behind auth:
  - Create event (auto-creates days from date range)
  - Edit day metadata (title/locations/notes)
  - Upload photos for a day (creates thumb/web/original in R2)
  - Reorder photos (drag/drop is TODO; simple up/down included)
- Image serving is authenticated:
  - `/api/img/[imageId]?size=thumb|web|orig` streams from R2 only if logged in

> Note: A Cloudflare Worker alternative is included in `/cloudflare-worker/` if you prefer serving images from Workers instead of Next API routes.

---

## 1) Prereqs
- Node.js 18+ (or 20+)
- Supabase project
- Cloudflare R2 bucket + access keys

---

## 2) Supabase setup (schema + RLS)
1. Open Supabase → SQL Editor.
2. Run the SQL file:
   - `supabase/schema.sql`

This creates:
- `events`, `days`, `images`
- RLS policies to allow access only to authenticated users

---

## 3) Cloudflare R2 setup
Create a bucket (example: `staycation-journal`).

Create an API token / access keys with permissions to read/write that bucket.

You’ll store:
- `original/<uuid>.jpg`
- `web/<uuid>.jpg`
- `thumb/<uuid>.jpg`

---

## 4) Configure environment variables
Copy:
- `.env.example` → `.env.local`

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; do not expose)
- R2 vars:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET`
  - `R2_REGION` (use `auto`)
  - `R2_ENDPOINT` (like `https://<accountid>.r2.cloudflarestorage.com`)

---

## 5) Install & run
```bash
npm install
npm run dev
```

Open:
- http://localhost:3000

---

## 6) Create your two accounts
This V1 uses Supabase email/password.

- Go to `/login`, click **Sign up**, create accounts for you + your spouse.
- (Optional) In Supabase Auth settings, disable email confirmation for faster onboarding.

---

## 7) Use the app
- `/events` — Events home (cards with hero image)
- `/events/[id]` — Event detail with Day cards and thumbnails
- `/admin` — Admin panel (create event, edit, upload)

---

## 8) Recommended deployment
- Deploy the Next.js app on Vercel or Cloudflare Pages.
- Use environment variables in the deployment platform.

Security:
- Keep R2 bucket private
- All image access routes require auth

---

## Implementation notes / TODOs
- Drag/drop reordering (currently “Move up/down”)
- Bulk upload progress UI + better mobile ergonomics
- Optional per-event sharing link (still private, tokenized)
- Optional Cloudflare Access in front of the whole site

---

## Folder structure
- `app/` Next.js routes (events, admin, login)
- `lib/` Supabase + R2 utilities
- `supabase/` SQL schema
- `cloudflare-worker/` optional authenticated image gateway for R2

