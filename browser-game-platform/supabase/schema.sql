-- Run this file in Supabase SQL Editor.
-- It creates the first database structure for GamletLand.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.genres (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  genre_id bigint references public.genres(id) on delete set null,
  description text not null,
  players text not null default '1 гравець',
  difficulty text not null default 'Легка',
  cover_image text not null,
  play_url text,
  rating numeric(2, 1) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value int not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
begin
  selected_role := coalesce(new.raw_user_meta_data->>'role', 'user');

  if selected_role not in ('user', 'admin') then
    selected_role := 'user';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Користувач'),
    selected_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

revoke execute on function public.create_profile_for_new_user() from public;
revoke execute on function public.create_profile_for_new_user() from anon;
revoke execute on function public.create_profile_for_new_user() from authenticated;

drop trigger if exists create_profile_after_signup on auth.users;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.games enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Anyone can read genres" on public.genres;
drop policy if exists "Anyone can read games" on public.games;
drop policy if exists "Authenticated users can read comments" on public.comments;
drop policy if exists "Users can create comments" on public.comments;
drop policy if exists "Users can delete own comments" on public.comments;
drop policy if exists "Users can read favorites" on public.favorites;
drop policy if exists "Users can manage favorites" on public.favorites;
drop policy if exists "Users can read ratings" on public.ratings;
drop policy if exists "Users can manage own ratings" on public.ratings;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can read genres"
on public.genres for select
to anon, authenticated
using (true);

create policy "Anyone can read games"
on public.games for select
to anon, authenticated
using (true);

create policy "Authenticated users can read comments"
on public.comments for select
to authenticated
using (true);

create policy "Users can create comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete own comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read favorites"
on public.favorites for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can manage favorites"
on public.favorites for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read ratings"
on public.ratings for select
to authenticated
using (true);

create policy "Users can manage own ratings"
on public.ratings for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.genres (name)
values ('Екшн'), ('Аркада'), ('Головоломка'), ('Стратегія')
on conflict (name) do nothing;

-- If your current test account was created with the wrong role, run this once:
-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id
--   from auth.users
--   where email = 'your-admin-email@example.com'
-- );
