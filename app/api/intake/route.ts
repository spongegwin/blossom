import { NextResponse } from 'next/server'
import { createAdminClient as createSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = createSupabaseAdmin()
  const body = await req.json()

  // ensure user row exists (anon users okay for now)
  // you can integrate Supabase Auth later; for MVP we upsert by email
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .upsert({ email: body.email, name: body.name }, { onConflict: 'email' })
    .select()
    .single()

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 400 })

  const { error } = await supabase.from('client_intake').insert({
    user_id: userRow.id,
    goals: body.goals,
    preferred_topics: body.preferred_topics ?? [],
    budget_hint: body.budget_hint ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

