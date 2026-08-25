/**
 * LoginPage.tsx
 *
 * The old PIN-based admin login is retired. Admin access is now granted
 * exclusively through Google OAuth + Supabase user_roles DB verification.
 *
 * This file simply redirects any direct visits to /login → /account so
 * existing links / bookmarks land somewhere useful.
 */
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  return <Navigate to="/account" replace />
}
