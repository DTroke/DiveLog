-- Grant schema usage
grant usage on schema public to anon, authenticated;

-- creatures: anon and authenticated can read pre-built creatures
grant select on public.creatures to anon, authenticated;
grant insert, update, delete on public.creatures to authenticated;

-- dives: authenticated users only (RLS restricts to own rows)
grant select, insert, update, delete on public.dives to authenticated;

-- dive_photos: authenticated users only
grant select, insert, update, delete on public.dive_photos to authenticated;

-- dive_creatures: authenticated users only
grant select, insert, update, delete on public.dive_creatures to authenticated;

-- profiles: authenticated users only
grant select, insert, update, delete on public.profiles to authenticated;
