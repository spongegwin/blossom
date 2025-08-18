// app/coach/payouts/page.tsx
export const dynamic = 'force-dynamic' // avoid caching while testing

import { createClient } from '@/lib/supabase/server'
import ConnectButton from './connect-button'

type Status = 'ready' | 'not-ready' | 'not-connected'

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams?: { return?: string }
}) {
  const supabase = createClient()

  // TEMP: target your test coach; later use the logged-in coach’s id/slug.
  const slug = 'stella'

  // RLS: you already added policies that let anon read approved coaches.
  const { data: coach, error } = await supabase
    .from('users')
    .select('id, name, slug, stripe_account_id, stripe_onboarded')
    .eq('slug', slug)
    .single()

  if (error || !coach) {
    return (
      <Shell>
        <Card>
          <CardHeader title="Get paid with Stripe" />
          <div className="p-6">
            <p className="text-rose-700">Coach not found for slug “{slug}”.</p>
          </div>
        </Card>
      </Shell>
    )
  }

  const status: Status = coach.stripe_onboarded
    ? 'ready'
    : coach.stripe_account_id
    ? 'not-ready'
    : 'not-connected'

  const showSuccess = Boolean(searchParams?.return) && status === 'ready'

  return (
    <Shell>
      <Card>
        <CardHeader
          title="Get paid with Stripe"
          subtitle="Connect your Stripe Express account to accept contributions on your profile."
        />

        {showSuccess && (
          <SuccessBanner message="Stripe connected — you can now accept contributions on your coach page." />
        )}

        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <StatusBadge status={status} />
            </div>
            <div className="flex gap-3">
              <ConnectButton slug={coach.slug} />
              <a
                href="/coach/payouts"
                className="rounded border px-4 py-2 text-slate-800 hover:bg-slate-50 active:translate-y-px"
              >
                Refresh
              </a>
            </div>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Click <b>Connect Stripe</b> to complete onboarding (test mode).</li>
            <li>When finished, you’ll return here. Click <b>Refresh</b> to re-check status.</li>
            <li>Your public page shows the contribution box once status is <b>Connected</b>.</li>
          </ul>

          {/* Debug block — remove anytime */}
          <div className="rounded-lg border border-slate-200 bg-white/60 p-3 text-xs text-slate-500">
            <p className="font-medium">Debug</p>
            <pre className="mt-2 whitespace-pre-wrap">
{JSON.stringify(
  { stripe_account_id: coach.stripe_account_id, stripe_onboarded: coach.stripe_onboarded },
  null,
  2
)}
            </pre>
          </div>
        </div>
      </Card>
    </Shell>
  )
}

/* ---------- presentational helpers (same “dusk” vibe as landing) ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-indigo-50 to-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16">{children}</div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-slate-200 backdrop-blur">
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-rose-500/10 to-amber-500/10 px-6 py-5">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    'ready':        { text: 'Connected',              cls: 'bg-green-100 text-green-800 ring-green-200' },
    'not-ready':    { text: 'Incomplete onboarding',  cls: 'bg-amber-100 text-amber-800 ring-amber-200' },
    'not-connected':{ text: 'Not connected',          cls: 'bg-slate-100 text-slate-800 ring-slate-200' },
  }[status]

  return (
    <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${map.cls}`}>
      {status === 'ready' ? (
        <svg className="-ml-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0L3.296 9.52a1 1 0 011.414-1.414l3.03 3.03 6.543-6.543a1 1 0 011.42 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="-ml-0.5 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
      )}
      {map.text}
    </span>
  )
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mx-6 mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-5 w-5 flex-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414L9 13l4.707-4.707Z" clipRule="evenodd" />
        </svg>
        <div className="text-sm">
          <p className="font-medium">Connected</p>
          <p className="text-green-700/90">{message}</p>
        </div>
      </div>
    </div>
  )
}
