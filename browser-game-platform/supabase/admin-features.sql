-- Run this file in Supabase SQL Editor after schema.sql.
-- It enables real admin actions from the frontend.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

grant insert, update, delete on public.genres to authenticated;
grant insert, update, delete on public.games to authenticated;
grant delete on public.comments to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-covers',
  'game-covers',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-files',
  'game-files',
  true,
  52428800,
  null
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can create genres" on public.genres;
drop policy if exists "Admins can delete genres" on public.genres;
drop policy if exists "Admins can create games" on public.games;
drop policy if exists "Admins can update games" on public.games;
drop policy if exists "Admins can delete games" on public.games;
drop policy if exists "Admins can delete any comment" on public.comments;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Anyone can read game covers" on storage.objects;
drop policy if exists "Admins can upload game covers" on storage.objects;
drop policy if exists "Admins can update game covers" on storage.objects;
drop policy if exists "Admins can delete game covers" on storage.objects;
drop policy if exists "Anyone can read game files" on storage.objects;
drop policy if exists "Admins can upload game files" on storage.objects;
drop policy if exists "Admins can update game files" on storage.objects;
drop policy if exists "Admins can delete game files" on storage.objects;

create policy "Admins can create genres"
on public.genres for insert
to authenticated
with check (public.is_admin());

create policy "Admins can delete genres"
on public.genres for delete
to authenticated
using (public.is_admin());

create policy "Admins can create games"
on public.games for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "Admins can update games"
on public.games for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "Admins can delete games"
on public.games for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "Admins can delete any comment"
on public.comments for delete
to authenticated
using (public.is_admin());

create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Anyone can read game covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'game-covers');

create policy "Admins can upload game covers"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'game-covers'
  and public.is_admin()
);

create policy "Admins can update game covers"
on storage.objects for update
to authenticated
using (
  bucket_id = 'game-covers'
  and public.is_admin()
)
with check (
  bucket_id = 'game-covers'
  and public.is_admin()
);

create policy "Admins can delete game covers"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'game-covers'
  and public.is_admin()
);

create policy "Anyone can read game files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'game-files');

create policy "Admins can upload game files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'game-files'
  and public.is_admin()
);

create policy "Admins can update game files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'game-files'
  and public.is_admin()
)
with check (
  bucket_id = 'game-files'
  and public.is_admin()
);

create policy "Admins can delete game files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'game-files'
  and public.is_admin()
);

notify pgrst, 'reload schema';

-- Make an existing user an admin:
-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id
--   from auth.users
--   where email = 'your-admin-email@example.com'
-- );
