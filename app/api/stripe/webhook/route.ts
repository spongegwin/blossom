// app/api/stripe/webhook/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers.get('stripe-signature')

  if (!secret || !sig) {
    return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 })
  }

  const payload = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature verification failed'
    console.error('webhook verify error:', message)
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'account.updated': {
        const acct = event.data.object as Stripe.Account
        const currentlyDue = (acct.requirements?.currently_due as string[]) ?? []
        const disabledReason = acct.requirements?.disabled_reason ?? null
        const onboarded =
          !!acct.charges_enabled && !!acct.details_submitted && currentlyDue.length === 0 && !disabledReason

        if (acct.id) {
          await supabase
            .from('users')
            .update({ stripe_onboarded: onboarded })
            .eq('stripe_account_id', acct.id)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const amount = session.amount_total ?? 0
        const currency = session.currency ?? 'usd'
        const status = session.payment_status ?? 'paid'
        const coachId = (session.metadata?.coach_id as string | undefined) ?? null
        const clientId = (session.metadata?.client_id as string | undefined) ?? null

        await supabase.from('payments').insert({
          stripe_session_id: session.id,
          amount,
          currency,
          status,
          coach_id: coachId,
          client_id: clientId,
        })
        break
      }

      default:
        // No-op for unhandled events
        break
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook handler error'
    console.error('webhook handler error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
