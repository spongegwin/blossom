// app/api/stripe/connect-link/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type ConnectBody = { slug: string }

export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as ConnectBody
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const supabase = createAdminClient()
    const { data: coach, error } = await supabase
      .from('users')
      .select('id, email, stripe_account_id')
      .eq('slug', slug)
      .single()

    if (error || !coach) return NextResponse.json({ error: 'Coach not found' }, { status: 404 })

    let accountId = coach.stripe_account_id
    if (!accountId) {
      const acct = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        business_type: 'individual',
        email: coach.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = acct.id
      await supabase.from('users').update({ stripe_account_id: accountId }).eq('id', coach.id)
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const link = await stripe.accountLinks.create({
      account: accountId!,
      type: 'account_onboarding',
      return_url: `${site}/coach/payouts?return=1`,
      refresh_url: `${site}/coach/payouts?refresh=1`,
    })

    return NextResponse.json({ url: link.url }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connect link error'
    console.error('connect-link error:', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
