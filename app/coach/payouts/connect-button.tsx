'use client'

import { useState } from 'react'

export default function ConnectButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)

  async function connect() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const json = await res.json()
      if (!res.ok || !json?.url) {
        alert(json?.error ?? `Connect error (HTTP ${res.status})`)
        setLoading(false)
        return
      }
      // return_url in your API should be /coach/payouts?return=1
      window.location.href = json.url
    } catch (e: any) {
      alert(e?.message ?? 'Network error')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="rounded bg-indigo-600 px-4 py-2 text-white shadow-sm ring-1 ring-indigo-500/20 hover:bg-indigo-700 active:translate-y-px disabled:opacity-60"
    >
      {loading ? 'Opening Stripe…' : 'Connect Stripe'}
    </button>
  )
}
