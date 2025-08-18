import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-amber-50 to-indigo-100 text-slate-800">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        {/* soft dusk blobs */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28 md:py-36 text-center">
          <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-black/5">
            Pay-what-feels-right
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Blossom Coaching
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-700">
            At Blossom Coaching, we are building a community where aspiring life and
            career coaches-in-training grow by helping you grow. Contribute only what
            feels right.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            {/* this is to be changed back /coach */}
            <Link
              href="/client/intake"
              className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-5 py-3 text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Find a coach-in-training
            </Link>
            <Link
              href="/coach/apply"
              className="inline-flex items-center justify-center rounded-lg bg-white/80 px-5 py-3 text-slate-800 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
            >
              Become a coach-partner
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <Card
            title="Contribute what feels right"
            body="Pay what resonates with your heart and budget for each session. Your contribution supports coaches-in-training."
            emoji="💗"
          />
          <Card
            title="Grow together"
            body="Connect with passionate coaches-in-training who are dedicated to helping you flourish while they learn."
            emoji="🧭"
          />
          <Card
            title="Simple scheduling"
            body="Book directly on each coach’s calendar. Reminders keep you on track."
            emoji="🗓️"
          />
        </div>
      </section>

      {/* CALLOUT / CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/60 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-200/60 blur-2xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ready to start?</h2>
              <p className="mt-1 text-slate-700">
                Start your coaching journey today.
              </p>
            </div>
            <Link
              href="/client/intake"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Share your goals
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/60 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-slate-600">
          <span>© {new Date().getFullYear()} Blossom Coaching</span>
          <nav className="flex gap-5">
            <Link className="hover:underline" href="/coaches">
              Coaches
            </Link>
            <Link className="hover:underline" href="/client/intake">
              Get started
            </Link>
            <Link className="hover:underline" href="/coach/apply">
              For coaches
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}

function Card({
  title,
  body,
  emoji,
}: {
  title: string
  body: string
  emoji: string
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-700">{body}</p>
    </div>
  )
}
