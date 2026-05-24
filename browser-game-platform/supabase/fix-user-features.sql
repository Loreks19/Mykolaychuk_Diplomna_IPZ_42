-- Run this file once in Supabase SQL Editor.
-- It fixes comments, ratings and favorites permissions for GamletLand.

alter table public.comments
add column if not exists author_name text not null default 'Користувач';

alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.games enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.genres to anon, authenticated;
grant select on public.games to anon, authenticated;
grant select on public.comments to anon, authenticated;
grant select on public.ratings to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.comments to authenticated;
grant select, insert, update, delete on public.ratings to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;

grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Anyone can read genres" on public.genres;
drop policy if exists "Anyone can read games" on public.games;
drop policy if exists "Authenticated users can read comments" on public.comments;
drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Users can create comments" on public.comments;
drop policy if exists "Users can delete own comments" on public.comments;
drop policy if exists "Users can read favorites" on public.favorites;
drop policy if exists "Users can manage favorites" on public.favorites;
drop policy if exists "Users can read ratings" on public.ratings;
drop policy if exists "Anyone can read ratings" on public.ratings;
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

create policy "Anyone can read comments"
on public.comments for select
to anon, authenticated
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

create policy "Anyone can read ratings"
on public.ratings for select
to anon, authenticated
using (true);

create policy "Users can manage own ratings"
on public.ratings for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.refresh_game_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_game_id bigint;
begin
  if tg_op = 'DELETE' then
    current_game_id := old.game_id;
  else
    current_game_id := new.game_id;
  end if;

  update public.games
  set rating = coalesce(
    (
      select round(avg(value)::numeric, 1)
      from public.ratings
      where game_id = current_game_id
    ),
    0
  )
  where id = current_game_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke execute on function public.refresh_game_rating() from public;
revoke execute on function public.refresh_game_rating() from anon;
revoke execute on function public.refresh_game_rating() from authenticated;

drop trigger if exists refresh_game_rating_after_change on public.ratings;

create trigger refresh_game_rating_after_change
after insert or update or delete on public.ratings
for each row execute function public.refresh_game_rating();

insert into public.genres (name)
values ('Екшн'), ('Аркада'), ('Головоломка'), ('Стратегія')
on conflict (name) do nothing;

insert into public.games (
  id,
  title,
  slug,
  genre_id,
  description,
  players,
  difficulty,
  cover_image,
  play_url,
  rating
)
overriding system value
values
  (
    1,
    'Shooter',
    'shooter',
    (select id from public.genres where name = 'Екшн'),
    'Браузерна гра, у якій гравець керує персонажем і бореться з ворогами.',
    '1 гравець',
    'Середня',
    '/games_images/shooter.png',
    '/games/shooter/index.html',
    4.6
  ),
  (
    2,
    'Space Runner',
    'space-runner',
    (select id from public.genres where name = 'Аркада'),
    'Швидка аркадна гра, де потрібно ухилятися від перешкод у космосі.',
    '1 гравець',
    'Легка',
    '/games_images/space.jpg',
    null,
    4.2
  ),
  (
    3,
    'Puzzle Blocks',
    'puzzle-blocks',
    (select id from public.genres where name = 'Головоломка'),
    'Логічна гра з блоками для тренування уважності та планування.',
    '1 гравець',
    'Легка',
    '/games_images/drive.png',
    null,
    4.0
  ),
  (
    4,
    'City Builder',
    'city-builder',
    (select id from public.genres where name = 'Стратегія'),
    'Спокійна стратегія, у якій потрібно розвивати власне місто.',
    '1 гравець',
    'Середня',
    '/games_images/build.png',
    null,
    4.4
  )
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  genre_id = excluded.genre_id,
  description = excluded.description,
  players = excluded.players,
  difficulty = excluded.difficulty,
  cover_image = excluded.cover_image,
  play_url = excluded.play_url,
  rating = excluded.rating;

select setval(
  pg_get_serial_sequence('public.games', 'id'),
  greatest((select coalesce(max(id), 1) from public.games), 1)
);

notify pgrst, 'reload schema';
