-- Run this in Supabase Dashboard > SQL Editor > New query

create table if not exists noise_readings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  latitude double precision not null,
  longitude double precision not null,
  loudness_index numeric not null check (loudness_index >= 0 and loudness_index <= 100),
  category text not null default 'general',
  is_silence_zone boolean not null default false,
  note text
);

-- Open read/insert for a contest demo — no login required.
-- Before any real-world use, replace the insert policy with rate limiting
-- or anonymous auth so one person can't spam fake readings.
alter table noise_readings enable row level security;

create policy "Public can read readings"
  on noise_readings for select
  using (true);

create policy "Public can insert readings"
  on noise_readings for insert
  with check (true);

-- Required so the live map updates instantly for everyone via Realtime.
alter publication supabase_realtime add table noise_readings;