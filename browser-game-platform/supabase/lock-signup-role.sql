-- Run this once in Supabase SQL Editor.
-- It prevents new users from making themselves admins through auth metadata.

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Користувач'),
    'user'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name;

  return new;
end;
$$;

revoke execute on function public.create_profile_for_new_user() from public;
revoke execute on function public.create_profile_for_new_user() from anon;
revoke execute on function public.create_profile_for_new_user() from authenticated;

notify pgrst, 'reload schema';
