-- DiveLog Initial Schema

-- profiles: one row per user, linked to Supabase auth
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  name text not null,
  description text,
  photo_url text,
  certifications jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- dives: each logged dive
create table dives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  location_name text not null,
  latitude float8,
  longitude float8,
  comments text,
  created_at timestamptz default now()
);

-- dive_photos: up to 3 photos per dive
create table dive_photos (
  id uuid primary key default gen_random_uuid(),
  dive_id uuid not null references dives on delete cascade,
  photo_url text not null
);

-- creatures: 60 pre-built species + user custom entries
create table creatures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  is_custom boolean default false,
  user_id uuid references auth.users on delete cascade
);

-- dive_creatures: which creatures were spotted on which dive
create table dive_creatures (
  id uuid primary key default gen_random_uuid(),
  dive_id uuid not null references dives on delete cascade,
  creature_id uuid not null references creatures on delete cascade,
  creature_photo_url text
);

-- Row Level Security
alter table profiles enable row level security;
alter table dives enable row level security;
alter table dive_photos enable row level security;
alter table creatures enable row level security;
alter table dive_creatures enable row level security;

-- profiles: users can only read/write their own row
create policy "profiles: own row only" on profiles
  for all using (auth.uid() = user_id);

-- dives: users can only access their own dives
create policy "dives: own rows only" on dives
  for all using (auth.uid() = user_id);

-- dive_photos: accessible via dive ownership
create policy "dive_photos: via dive owner" on dive_photos
  for all using (
    exists (select 1 from dives where dives.id = dive_photos.dive_id and dives.user_id = auth.uid())
  );

-- creatures: pre-built creatures readable by all authenticated users; custom creatures only by owner
create policy "creatures: pre-built readable by all" on creatures
  for select using (is_custom = false or user_id = auth.uid());

create policy "creatures: insert own custom" on creatures
  for insert with check (is_custom = true and user_id = auth.uid());

create policy "creatures: update own custom" on creatures
  for update using (is_custom = true and user_id = auth.uid());

create policy "creatures: delete own custom" on creatures
  for delete using (is_custom = true and user_id = auth.uid());

-- dive_creatures: accessible via dive ownership
create policy "dive_creatures: via dive owner" on dive_creatures
  for all using (
    exists (select 1 from dives where dives.id = dive_creatures.dive_id and dives.user_id = auth.uid())
  );
