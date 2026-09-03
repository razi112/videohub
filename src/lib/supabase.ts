import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log configuration at startup so it is visible in Android logcat.
// Helps confirm the build actually received the env vars.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] MISSING env vars — VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is undefined. ' +
    'Make sure .env is present and `npm run build` was run before `npx cap sync android`.'
  )
} else {
  console.info('[Supabase] Initialising client →', supabaseUrl)
}

export const supabase = createClient(
  supabaseUrl ?? 'https://missing-url.supabase.co',
  supabaseAnonKey ?? 'missing-key',
  {
    global: {
      // Log every fetch error so the exact URL and status are visible in logcat.
      fetch: async (url, options) => {
        try {
          const res = await fetch(url, options)
          return res
        } catch (err) {
          console.error(
            '[Supabase] fetch() failed — URL:', url,
            '| Error:', err instanceof Error ? err.message : String(err),
            '| Platform:', navigator.userAgent
          )
          throw err
        }
      },
    },
  }
)
