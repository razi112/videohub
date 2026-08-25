/**
 * auth.ts — server-side role resolution
 *
 * Admin role is NEVER derived from frontend state (email string, localStorage,
 * or JWT claims alone). It is always fetched from the `user_roles` table using
 * the currently authenticated Supabase session.
 *
 * Table schema (see supabase/migrations/001_user_roles.sql):
 *   user_roles (
 *     id          uuid primary key default gen_random_uuid(),
 *     user_id     uuid not null references auth.users(id) on delete cascade,
 *     role        text not null check (role in ('admin','user')),
 *     created_at  timestamptz default now()
 *   )
 *
 * RLS ensures only the Supabase service role (or the user themselves) can
 * read their own row. The anon key SELECT is intentionally restricted so that
 * a user cannot read another user's role.
 */

import { supabase } from './supabase'

export type AppRole = 'admin' | 'user'

export interface RoleResult {
  role: AppRole
  /** true when the role row was found in the database */
  verified: boolean
}

/**
 * Fetch the role for the currently authenticated user from `user_roles`.
 * Falls back to 'user' if the row does not exist or on any error — this means
 * an attacker who somehow bypasses the DB never gets admin by default.
 */
export async function fetchCurrentUserRole(): Promise<RoleResult> {
  // 1. Get the live session — do NOT trust any locally stored value
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return { role: 'user', verified: false }
  }

  const userId = session.user.id

  // 2. Query the user_roles table using the authenticated client.
  //    RLS policy: "Users can only read their own row."
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    // Table may not exist yet in dev — treat as regular user, never admin
    console.warn('[auth] user_roles query failed:', error.message)
    return { role: 'user', verified: false }
  }

  if (!data) {
    // No row → regular user
    return { role: 'user', verified: true }
  }

  const role = data.role === 'admin' ? 'admin' : 'user'
  return { role, verified: true }
}

/**
 * Verify the current session has admin role.
 * Used by AdminLayout as a server-side guard before rendering protected UI.
 */
export async function verifyAdminAccess(): Promise<boolean> {
  const { role, verified } = await fetchCurrentUserRole()
  return verified && role === 'admin'
}
