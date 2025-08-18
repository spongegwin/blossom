import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const raw = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return new NextResponse('Bad signature', { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'account.updated': {
      // Coach completed more KYC steps; mark onboarded when charges are enabled
      const acct = event.data.object as Stripe.Account
      const onboarded = !!(acct.charges_enabled && acct.details_submitted)
      if (acct.id) {
        await supabase
          .from('users')
          .update({ stripe_onboarded: onboarded })
          .eq('stripe_account_id', acct.id)
      }
      break
    }

    case 'checkout.session.completed': {
      // Payment succeeded — store a record
      const session = event.data.object as Stripe.Checkout.Session
      const pi =
        typeof session.payment_intent === 'string'
          ? await stripe.paymentIntents.retrieve(session.payment_intent)
          : (session.payment_intent as Stripe.PaymentIntent)

      const amount = (pi.amount_received ?? pi.amount ?? 0) / 100
      // const appFee = (pi.application_fee_amount ?? 0) / 100
      const coachAcct = pi.transfer_data?.destination ?? null

      // Optional: resolve coach_id by acct
      // const { data: coach } = coachAcct
      //  ? await supabase.from('users').select('id').eq('stripe_account_id', coachAcct).single()
      //  : { data: null }

      await supabase.from('payments').insert({
        stripe_payment_intent_id: pi.id,
        amount,
        status: 'succeeded',
        // coach_id: coach?.id,        // add this column later if you want
        // application_fee: appFee,    // add this column later if you want
      })
      break
    }

    default:
      // Ignore the rest for MVP
      break
  }

  return NextResponse.json({ received: true })
}
