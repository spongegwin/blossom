export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

/** Zod schema for strong typing + runtime validation
 *  We accept strings from the browser and transform what we need.
 */
const ApplySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  timezone: z.string().min(1, 'Timezone is required'),
  bio: z.string().min(30, 'Tell us a bit more (≥30 chars)'),
  focus_areas: z.array(z.string()).min(1, 'Pick at least one area'),
  calendly_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  linkedin_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  agree: z.literal(true, { message: 'Please agree to proceed' }),
})

type ApplyInput = z.input<typeof ApplySchema>   // raw from browser
type ApplyData  = z.output<typeof ApplySchema>  // parsed/validated

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown
    const data = ApplySchema.parse(body) as ApplyData

    const supabase = createAdminClient()

    // 1) Upsert user by email (idempotent)
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .upsert(
        { email: data.email, name: data.name, timezone: data.timezone, bio: data.bio },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    if (userErr || !userRow) {
      return NextResponse.json({ error: 'Unable to upsert user' }, { status: 500 })
    }

    // 2) Upsert coach_application by user_id (status defaults to 'pending')
    const { error: appErr } = await supabase
      .from('coach_application')
      .upsert(
        {
          user_id: userRow.id,
          focus_areas: data.focus_areas,
          calendly_url: data.calendly_url ?? null,
          status: 'pending',
        },
        { onConflict: 'user_id' }
      )

    if (appErr) {
      return NextResponse.json({ error: 'Unable to save application' }, { status: 500 })
    }

    // Optional: store linkedin_url on users if you want it there
    if (data.linkedin_url) {
      await supabase.from('users').update({ linkedin_url: data.linkedin_url }).eq('id', userRow.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
