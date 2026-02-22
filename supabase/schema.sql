-- Staycation Journal V1 schema (events → days → images)
-- Assumes extensions available:
--   - pgcrypto (for gen_random_uuid) OR use uuid-ossp
-- This script uses gen_random_uuid() from pgcrypto.

create extension if not exists pgcrypto;

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date not null,
  end_date date not null,
  summary text,
  tags text[],
  hero_image_id uuid,
  created_at timestamptz not null default now()
);

-- DAYS
create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  date date not null,
  title text,
  locations_text text,
  notes text,
  sort_index int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists days_event_id_idx on public.days(event_id);
create index if not exists days_event_sort_idx on public.days(event_id, sort_index);

-- IMAGES
-- Note: day_id nullable to support event hero images as standalone
create table if not exists public.images (
  id uuid primary key,
  day_id uuid references public.days(id) on delete cascade,
  caption text,
  sort_index int not null default 1,
  storage_key_original text not null,
  storage_key_web text not null,
  storage_key_thumb text not null,
  created_at timestamptz not null default now()
);

create index if not exists images_day_id_idx on public.images(day_id);
create index if not exists images_day_sort_idx on public.images(day_id, sort_index);

-- =========================
-- Row Level Security (RLS)
-- =========================
alter table public.events enable row level security;
alter table public.days enable row level security;
alter table public.images enable row level security;

-- Policy: only authenticated users can read/write.
-- For a 2-user private app, this is simplest.
create policy "events_select_auth"
on public.events
for select
to authenticated
using (true);

create policy "events_write_auth"
on public.events
for insert
to authenticated
with check (true);

create policy "events_update_auth"
on public.events
for update
to authenticated
using (true)
with check (true);

create policy "events_delete_auth"
on public.events
for delete
to authenticated
using (true);

create policy "days_select_auth"
on public.days
for select
to authenticated
using (true);

create policy "days_write_auth"
on public.days
for insert
to authenticated
with check (true);

create policy "days_update_auth"
on public.days
for update
to authenticated
using (true)
with check (true);

create policy "days_delete_auth"
on public.days
for delete
to authenticated
using (true);

create policy "images_select_auth"
on public.images
for select
to authenticated
using (true);

create policy "images_write_auth"
on public.images
for insert
to authenticated
with check (true);

create policy "images_update_auth"
on public.images
for update
to authenticated
using (true)
with check (true);

create policy "images_delete_auth"
on public.images
for delete
to authenticated
using (true);

