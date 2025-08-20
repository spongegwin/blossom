 export const dynamic = 'force-dynamic'
export const revalidate = 0

import Image from 'next/image'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Contribution from './pay'

export default async function CoachProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  // allow any query key: string | string[] | undefined
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  
  const p  = await params
  const sp = (await searchParams) ?? {}

  // helper to coerce query params to a single string
  const qp = (key: string) => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : (v ?? '')
  }

  const preName  = qp('name')
  const preEmail = qp('email')
  const paid     = qp('paid') === '1'
  const canceled = qp('canceled') === '1'

  // Build the Calendly URL with safe params
  function withParams(base: string) {
    const url = new URL(base)
    if (preName)  url.searchParams.set('name', preName)
    if (preEmail) url.searchParams.set('email', preEmail)
    // optional polish:
    url.searchParams.set('hide_gdpr_banner', '1') // hides footer consent banner in embed
    return url.toString()
  }
    // Build a Calendly embed URL with optional prefill + small UI tweaks
  const buildCalendlyUrl = (base: string, name?: string, email?: string) => {
    const url = new URL(base) // Calendly links are absolute, so this is safe
    if (name)  url.searchParams.set('name', name)
    if (email) url.searchParams.set('email', email)
    // optional polish:
    url.searchParams.set('hide_gdpr_banner', '1')
    url.searchParams.set('hide_event_type_details', '1')
    return url.toString()
  }
  
  const supabase = createClient()

  // 1) Core profile by slug
  const { data: coach, error: coachErr } = await supabase
    .from('users')
    .select('id, name, bio, avatar_url, timezone, slug, stripe_onboarded')
    .eq('slug', p.slug)
    .single()

  if (coachErr || !coach) return notFound()

  // 2) Approved application for focus areas + Calendly link
  const { data: app } = await supabase
    .from('coach_application')
    .select('focus_areas, calendly_url, status')
    .eq('user_id', coach.id)
    .eq('status', 'approved')
    .maybeSingle() // returns null if none

  const calendlyEmbedUrl =
    app?.calendly_url ? buildCalendlyUrl(app.calendly_url, preName, preEmail) : null
  
    
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

        {/* Booking & Contribution — two columns on md+, full width on mobile */}
        {app?.calendly_url ? (
          <section className="mt-10 md:mt-12 grid gap-6 md:grid-cols-2 items-start">
            {/* LEFT: details + contribution */}
            <div className="space-y-6">
              {/* Details card */}
              <div className="rounded-xl bg-white/70 p-6 shadow ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Book a session</h2>
                <p className="mt-2 text-slate-600">
                  Pick a time that works for you. We’ll send a confirmation and calendar invite.
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  {coach.timezone && (
                    <div className="flex">
                      <dt className="w-28 text-slate-500">Timezone</dt>
                      <dd className="text-slate-800">{coach.timezone}</dd>
                    </div>
                  )}
                  {app?.focus_areas?.length ? (
                    <div className="flex">
                      <dt className="w-28 text-slate-500">Focus</dt>
                      <dd className="text-slate-800">{app.focus_areas.join(', ')}</dd>
                    </div>
                  ) : null}
                </dl>

                <ul className="mt-4 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>You’ll get a confirmation email after booking.</li>
                  <li>Need to reschedule? Use the link in your confirmation.</li>
                  <li>Contributions are handled securely via Stripe.</li>
                </ul>
              </div>

              {/* Contribution card */}
              <div className="rounded-xl bg-white/70 p-6 shadow ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold">Contribute what feels right</h3>
                <p className="mt-1 text-slate-600">
                  Contributions support training and future sessions.
                </p>

                {coach.stripe_onboarded ? (
                  <div className="mt-4">
                    <Contribution coachId={coach.id} />
                  </div>
                ) : (
                  <p className="mt-3 text-amber-700">
                    Payments will be available once this coach connects Stripe.
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT: Calendly (sticky on desktop) */}
            <div className="md:sticky md:top-8">
              <div
                className="calendly-inline-widget mt-0 h-[720px] w-full rounded-xl bg-white/70 p-1 shadow ring-1 ring-black/5"
                data-url={calendlyEmbedUrl! /* built earlier from app.calendly_url + optional prefill */}
              />
              <Script
                src="https://assets.calendly.com/assets/external/widget.js"
                strategy="lazyOnload"
              />
            </div>
          </section>
        ) : (
          <p className="mt-10 text-slate-600">Calendar coming soon.</p>
        )}
      </section>
    </main>
  )
}
