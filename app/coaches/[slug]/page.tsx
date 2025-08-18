export const dynamic = 'force-dynamic'  // ensure fresh data during dev
export const revalidate = 0             // (optional) no ISR caching

import Image from 'next/image'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Contribution from './pay'

type PageProps = {
  params: { slug: string }
  searchParams?: { paid?: string; canceled?: string }
}

export default async function CoachProfilePage({ params, searchParams }: PageProps) {
  const supabase = createClient()

  // 1) Core profile by slug
  const { data: coach, error: coachErr } = await supabase
    .from('users')
    .select('id, name, bio, avatar_url, timezone, slug, stripe_onboarded')
    .eq('slug', params.slug)
    .single()

  if (coachErr || !coach) return notFound()

  // 2) Approved application for focus areas + Calendly link
  const { data: app } = await supabase
    .from('coach_application')
    .select('focus_areas, calendly_url, status')
    .eq('user_id', coach.id)
    .eq('status', 'approved')
    .maybeSingle() // safer: returns null if not found instead of error

  // 3) Post-Checkout flags from the URL query string
  const paid = searchParams?.paid === '1'
  const canceled = searchParams?.canceled === '1'

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-indigo-50">
      <section className="mx-auto max-w-5xl px-6 py-10 md:py-16">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/70 shadow">
            <Image
              src={coach.avatar_url || '/avatar-placeholder.png'}
              alt={coach.name || 'Coach'}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{coach.name}</h1>
            <p className="mt-2 text-slate-700">{coach.bio || 'Coach at Blossom'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {coach.timezone ? `Timezone: ${coach.timezone}` : null}
              {app?.focus_areas?.length ? <> · Focus: {app.focus_areas.join(', ')}</> : null}
            </p>
          </div>
        </header>

        {/* Post-checkout banners */}
        {paid && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-green-700 ring-1 ring-green-200">
            Thank you for your contribution! 🌿
          </p>
        )}
        {canceled && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-amber-700 ring-1 ring-amber-200">
            Payment canceled. You can try again below.
          </p>
        )}

        {/* Calendly embed (only if application approved & link present) */}
        {app?.calendly_url ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Book a session</h2>
            <div
              className="calendly-inline-widget mt-4 h-[720px] w-full rounded-xl bg-white/70 p-1 shadow ring-1 ring-black/5"
              data-url={`${app.calendly_url}?cal_ref=${coach.id}`} // pass coach id through
            />
            <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
          </section>
        ) : (
          <p className="mt-10 text-slate-600">Calendar coming soon.</p>
        )}

        {/* Contribution widget (Stripe) */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Contribute what feels right</h2>
          <p className="mt-1 text-slate-600">Contributions support training and future sessions.</p>

          {coach.stripe_onboarded ? (
            <Contribution coachId={coach.id} />
          ) : (
            <p className="mt-3 text-amber-700">
              Payments will be available once this coach connects Stripe.
            </p>
          )}
        </section>
      </section>
    </main>
  )
}
