'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

// ✅ Include slug in the props type (make it optional if you want a URL fallback)
type ContributionProps = {
  coachId: string
  slug?: string
}

export default function Contribution({ coachId, slug }: ContributionProps) {
  // Optional safety net: read slug from the /coaches/[slug] route if not passed
  const params = useParams<{ slug: string }>()
  const effectiveSlug = slug ?? params?.slug

  const [amount, setAmount] = useState('40')
  const [busy, setBusy] = useState(false)

  const toCents = (val: string) => {
    const n = Number(val)
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
  }

  async function startCheckout() {
    const cents = toCents(amount)
    if (!coachId || !effectiveSlug) { toast.error('Missing coach identifier'); return }
    if (cents == null) { toast.error('Enter a valid amount'); return }

    const payload = { coachId, slug: String(effectiveSlug), amount: cents }

    setBusy(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Stripe error'); setBusy(false); return }
      window.location.href = json.url
    } catch {
      toast.error('Network error'); setBusy(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-white/70 p-4 ring-1 ring-slate-200 shadow">
      <div className="flex flex-wrap items-center gap-2">
        {['20', '40', '60'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className={`rounded-full border px-3 py-1 text-sm ${
              amount === v ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'
            }`}
          >
            ${v}
          </button>
        ))}
        <span className="ml-1 text-sm text-slate-600">or</span>
        <label className="relative">
          <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 rounded-lg border border-slate-300 bg-white pl-5 pr-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Amount"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {busy ? 'Starting…' : 'Contribute via Stripe'}
      </button>
    </div>
  )
}
