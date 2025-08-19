// app/api/checkout/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type CheckoutBody = {
  coachId: string
  slug: string
  amount: number // cents OR dollars depending on your UI; this assumes cents already
  clientId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody

    if (!body?.coachId || !body?.slug || !Number.isFinite(body.amount)) {
      return NextResponse.json({ error: 'Missing coachId, slug, or amount' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: coach, error } = await supabase
      .from('users')
      .select('id, slug, stripe_account_id, stripe_onboarded')
      .eq('id', body.coachId)
      .single()

    if (error || !coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }
    if (!coach.stripe_account_id || !coach.stripe_onboarded) {
      return NextResponse.json({ error: 'Coach is not ready to receive payments' }, { status: 400 })
    }

    // Optional platform fee via ENV (basis points)
    const feeBps = Number(process.env.PLATFORM_FEE_BPS ?? 0) // e.g., 100 = 1%
    const applicationFee = Math.floor((body.amount * feeBps) / 10_000)

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        coach_id: coach.id,
        client_id: body.clientId ?? '',
        slug: body.slug,
      },
      // IMPORTANT: use cents for amount; if your UI posts dollars, multiply by 100
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Contribution to ${body.slug}` },
            unit_amount: body.amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: { destination: coach.stripe_account_id },
        application_fee_amount: applicationFee,
      },
      success_url: `${site}/coaches/${body.slug}?paid=1`,
      cancel_url: `${site}/coaches/${body.slug}?canceled=1`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout error'
    console.error('checkout error:', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
