-- Create the dive-photos storage bucket
insert into storage.buckets (id, name, public)
values ('dive-photos', 'dive-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload dive photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'dive-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Photos are publicly readable (needed for displaying images)
create policy "Dive photos are publicly viewable"
on storage.objects for select
using (bucket_id = 'dive-photos');

-- Users can delete their own photos
create policy "Users can delete their own dive photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'dive-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
