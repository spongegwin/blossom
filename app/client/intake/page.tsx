'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

/** Schema:
 *  - We accept strings from the form and transform to number | undefined.
 *  - This avoids Zod making the input type `unknown`, which caused your error.
 */
const Schema = z.object({
  name: z.string().min(1, 'Please tell us your name'),
  email: z.string().email('Please enter a valid email'),
  goals: z.string().min(10, 'Share a few sentences so we can match you well'),
  preferred_topics: z.array(z.string()).optional(),

  // Accept string from <input>, produce number | undefined
  budget_hint: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === '') return undefined
      const n = Number(v)
      return Number.isFinite(n) && n >= 0 ? n : NaN
    })
    .refine((v) => v === undefined || !Number.isNaN(v), 'Budget must be a non-negative number'),
})

// 👇 These two types keep RHF & Zod perfectly aligned
type FormInput = z.input<typeof Schema>   // what the form fields output (strings)
type FormOutput = z.output<typeof Schema> // what you want after validation (numbers, etc.)

const TOPICS = ['Career', 'Life', 'Leadership', 'Confidence', 'Wellbeing'] as const

export default function ClientIntakePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(Schema),
    defaultValues: { preferred_topics: [] },
  })

  const [errorMsg, setErrorMsg] = useState('')

  // onSubmit receives parsed values (FormOutput) → budget_hint is number | undefined
  async function onSubmit(data: FormOutput) {
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setErrorMsg(error ?? `HTTP ${res.status}`)
        return
      }
      toast.success('Thank you for your interest in Blossom Coaching! We will follow up shortly.')
      reset()
      setErrorMsg('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error — please try again.'
      setErrorMsg(message)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-indigo-50 to-slate-50">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-slate-200 backdrop-blur"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-rose-500/10 to-amber-500/10 px-6 py-5">
          <h1 className="text-2xl font-semibold text-slate-900">Client Intake</h1>
          <p className="mt-1 text-sm text-slate-600">Tell us a bit about you so we can match you well.</p>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Name<span className="text-rose-600">*</span>
              </label>
              <input
                {...register('name')}
                aria-invalid={!!errors.name}
                placeholder="Jane Doe"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Email<span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              What do you want help with?<span className="text-rose-600">*</span>
            </label>
            <textarea
              {...register('goals')}
              aria-invalid={!!errors.goals}
              placeholder="Share a few sentences about your goals or what you'd like to explore…"
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.goals && <p className="mt-1 text-sm text-red-600">{errors.goals.message}</p>}
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-800">Preferred topics (optional)</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TOPICS.map((t) => (
                <label key={t} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    value={t}
                    {...register('preferred_topics')}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t}
                </label>
              ))}
            </div>
            {errors.preferred_topics && (
              <p className="mt-1 text-sm text-red-600">{errors.preferred_topics.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">Budget (optional)</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="1"
                min="0"
                placeholder="e.g. 40"
                {...register('budget_hint')}
                aria-invalid={!!errors.budget_hint}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.budget_hint && <p className="mt-1 text-sm text-red-600">{errors.budget_hint.message}</p>}
          </div>

          {errorMsg && (
            <p className="rounded-md bg-red-50 p-2 text-sm text-red-700 ring-1 ring-red-200">{errorMsg}</p>
          )}

          <div className="pt-2">
            <button
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-indigo-500/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
