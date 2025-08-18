'use client'
import { useState } from 'react'
import { toast } from 'sonner'

// Tiny form that POSTs to /api/checkout and then redirects to Stripe Checkout.
export default function Contribution({ coachId }: { coachId: string }) {
  const [amount, setAmount] = useState('40') // default suggestion

  async function startCheckout() {
    const n = Number(amount)
    if (Number.isNaN(n) || n <= 0) return toast.error('Please enter an amount greater than $0.')

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId, amount: n }),
    })
    const json = await res.json()
    if (!res.ok) return toast.error(json.error ?? 'Checkout error')

    if (json.url) window.location.href = json.url
  }

  return (
    <div className="mt-4 flex w-full max-w-md items-center gap-3 rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
      <div className="flex items-center rounded-lg ring-1 ring-black/5 bg-white px-2">
        <span className="px-2 text-slate-500">$</span>
        <input
          type="number" inputMode="decimal" min={1} step="1"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-24 bg-transparent py-2 outline-none" aria-label="Contribution amount in dollars"
        />
      </div>
      <button
        onClick={startCheckout}
        className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-4 py-2 text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        Contribute
      </button>
    </div>
  )
}
