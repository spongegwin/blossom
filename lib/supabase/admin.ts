// lib/supabase/admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY  // ← keep your name

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!secret) throw new Error('Missing SUPABASE_SECRET_KEY (server secret)')

  // Admin client: no user session handling, runs only on the server
  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
