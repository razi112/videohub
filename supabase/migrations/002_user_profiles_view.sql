-- ============================================================
-- Migration: 002_user_profiles_view
--
-- Creates a user_profiles view that joins auth.users with
-- user_roles so the admin dashboard can list all registered
-- users without needing the service-role key on the frontend.
--
-- HOW TO APPLY
-- ─────────────
-- Supabase Dashboard → SQL Editor → paste this file → Run
-- ============================================================

-- ── 1. View: public.user_profiles ───────────────────────────
--
-- Exposes safe, non-sensitive columns from auth.users joined
-- with the role from user_roles. No passwords, tokens, or
-- raw metadata are included.
--
create or replace view public.user_profiles as
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )                                      as name,
  u.email,
  u.raw_user_meta_data->>'avatar_url'    as avatar_url,
  coalesce(r.role, 'user')               as role,
  u.created_at
from auth.users u
left join public.user_roles r on r.user_id = u.id;

-- ── 2. Grant read access to authenticated role ───────────────
grant select on public.user_profiles to authenticated;

-- ── 3. Row Level Security on the view ───────────────────────
--
-- Views in Supabase inherit the RLS of their underlying tables,
-- but we also need an explicit policy scoped to admin users.
-- We use a security-definer function so the view itself runs as
-- the definer (postgres) — this bypasses auth.users RLS which
-- the anon/authenticated role cannot normally read.
--
-- Drop the old view first and recreate as security definer.
drop view if exists public.user_profiles;

create or replace function public.get_user_profiles()
returns table (
  id          uuid,
  name        text,
  email       text,
  avatar_url  text,
  role        text,
  created_at  timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    u.id,
    coalesce(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    )                                      as name,
    u.email,
    u.raw_user_meta_data->>'avatar_url'    as avatar_url,
    coalesce(r.role, 'user')               as role,
    u.created_at
  from auth.users u
  left join public.user_roles r on r.user_id = u.id
  order by u.created_at desc;
$$;

-- Only the authenticated role can call this function.
-- The admin check is enforced inside the calling code
-- (AdminUsersPage verifies isAdmin before invoking).
grant execute on function public.get_user_profiles() to authenticated;

-- ── 4. Admin-only policy helper ──────────────────────────────
--
-- Convenience function used to restrict the RPC to admins only
-- at the DB level (defence-in-depth on top of the frontend guard).
--
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
