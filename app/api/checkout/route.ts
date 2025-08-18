import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { coachId, amount } = await req.json()
    const dollars = Number(amount)
    if (!coachId || Number.isNaN(dollars) || dollars <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const amountInCents = Math.round(dollars * 100)

    const supabase = createAdminClient()
    const { data: coach } = await supabase
      .from('users')
      .select('name, slug, stripe_account_id, stripe_onboarded')
      .eq('id', coachId)
      .single()

    if (!coach?.stripe_account_id) {
      return NextResponse.json({ error: 'Coach is not ready to receive payments yet.' }, { status: 400 })
    }

    const bps = Number(process.env.PLATFORM_FEE_BPS ?? '100')        // 1% default
    const applicationFee = Math.floor((amountInCents * bps) / 10_000)

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const success = `${site}/coaches/${coach.slug}?paid=1`
    const cancel  = `${site}/coaches/${coach.slug}?canceled=1`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: success,
      cancel_url: cancel,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Contribution to ${coach.name ?? 'coach'}` },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: applicationFee,                  // Blossom’s cut
        transfer_data: { destination: coach.stripe_account_id }, // pays coach
      },
      metadata: { coachId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('checkout error', err)
    return NextResponse.json({ error: 'Checkout error' }, { status: 500 })
  }
}
