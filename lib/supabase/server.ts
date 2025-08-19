// lib/supabase/server.ts
import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client that uses the publishable (anon) key.
 * - No cookies/session handling (RLS still enforced).
 * - Perfect for Server Components & simple reads/writes under your RLS policies.
 * - Works on Next.js 15 (no async cookies needed).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createSupabaseClient(url, anon, {
    auth: {
      // Server Components don’t need to persist/refresh browser sessions
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
