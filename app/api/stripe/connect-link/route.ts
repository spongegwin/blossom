import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // TODO: replace this lookup with the *logged-in coach* when Auth is added.
    const { data: coach, error } = await supabase
      .from('users')
      .select('id, email, stripe_account_id')
      .eq('role', 'coach')
      .limit(1)
      .single()

    if (error || !coach) {
      return NextResponse.json({ error: 'Coach not found (placeholder lookup)' }, { status: 400 })
    }

    // 1) Create (or reuse existing) Connect Express account
    let accountId = coach.stripe_account_id
    if (!accountId) {
      const acct = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        business_type: 'individual',
        email: coach.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = acct.id
      await supabase.from('users').update({ stripe_account_id: accountId }).eq('id', coach.id)
    }

    // 2) Create onboarding link (single-use URL)
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const link = await stripe.accountLinks.create({
      account: accountId!,
      type: 'account_onboarding',
      return_url:  `${site}/coach/payouts?return=1`,
      refresh_url: `${site}/coach/payouts?refresh=1`,
    })

    return NextResponse.json({ url: link.url })
  } catch (e: any) {
    console.error('connect-link error', e)
    return NextResponse.json({ error: e.message ?? 'Connect link error' }, { status: 400 })
  }
}
