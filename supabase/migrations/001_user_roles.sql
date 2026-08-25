-- ============================================================
-- Migration: 001_user_roles
--
-- Creates the user_roles table used for server-side admin
-- authorization. isAdmin is NEVER derived from frontend state;
-- it is always resolved by querying this table using the
-- authenticated Supabase session.
--
-- HOW TO APPLY
-- ─────────────
-- Option A (Supabase Dashboard):
--   Dashboard → SQL Editor → paste this file → Run
--
-- Option B (Supabase CLI):
--   supabase db push   (if using supabase link + migrations)
--
-- ============================================================

-- ── 1. Table ─────────────────────────────────────────────────
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now(),
  unique (user_id)            -- one role row per user
);

-- ── 2. Row Level Security ────────────────────────────────────
alter table public.user_roles enable row level security;

-- Users can read their OWN role only.
-- This is what the frontend anon-key client uses.
create policy "users_read_own_role"
  on public.user_roles
  for select
  using ( auth.uid() = user_id );

-- Only the Supabase service role (server / admin API) can
-- insert, update, or delete role rows — never the anon key.
-- This prevents any frontend code from elevating its own role.
create policy "service_role_manage_roles"
  on public.user_roles
  for all
  using     ( auth.role() = 'service_role' )
  with check ( auth.role() = 'service_role' );

-- ── 3. Index ─────────────────────────────────────────────────
create index if not exists user_roles_user_id_idx
  on public.user_roles (user_id);

-- ── 4. Seed admin user ───────────────────────────────────────
--
-- IMPORTANT: Replace the UUID below with the actual auth.users.id
-- for razi61293697@gmail.com AFTER that account has signed in via
-- Google OAuth at least once (Supabase creates the auth.users row
-- on first login).
--
-- Steps:
--   1. Have razi61293697@gmail.com sign in via Google on the app.
--   2. In Supabase Dashboard → Authentication → Users, find the
--      user and copy their UUID.
--   3. Run the INSERT below with that UUID, or update the
--      placeholder and re-run this migration.
--
-- Until step 3 is done the admin account behaves as a normal user.
--
-- Example (replace 'REPLACE_WITH_ACTUAL_UUID'):
--
--   insert into public.user_roles (user_id, role)
--   values ('REPLACE_WITH_ACTUAL_UUID', 'admin')
--   on conflict (user_id) do update set role = 'admin';
--

-- ── 5. Helper: auto-create user role row on first login ──────
--
-- This trigger inserts a 'user' role row automatically when a new
-- auth user is created (i.e., first Google login). The admin row
-- is then manually upgraded to 'admin' via step 4 above.
--
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger first to make this idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
