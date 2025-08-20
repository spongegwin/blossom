'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Same schema as server but shaped for form inputs (strings, arrays)
const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  timezone: z.string().min(1, 'Timezone is required'),
  bio: z.string().min(30, 'Tell us a bit more (≥30 chars)'),
  focus_areas: z.array(z.string()).min(1, 'Pick at least one area'),
  calendly_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).transform(v => v || undefined),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).transform(v => v || undefined),
  agree: z.boolean().refine(v => v === true, { message: 'Please agree to proceed' }),
})

// Tie RHF to the schema’s input/output precisely
type FormInput  = z.input<typeof Schema>
type FormOutput = z.output<typeof Schema>

const AREAS = ['Career', 'Life', 'Leadership', 'Confidence', 'Wellbeing'] as const
const TIMEZONES = ['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Singapore'] as const

export default function CoachApplyPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(Schema),
    defaultValues: { focus_areas: [], agree: false },
  })

  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(values: FormOutput) {
    setErrorMsg('')
    const res = await fetch('/api/coach-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
      setErrorMsg(error ?? `HTTP ${res.status}`)
      return
    }

    toast.success('Application received! We’ll review and get back to you soon.')
    reset()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-indigo-50 to-slate-50">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-slate-200 backdrop-blur"
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-rose-500/10 to-amber-500/10 px-6 py-5">
          <h1 className="text-2xl font-semibold text-slate-900">Coach Application</h1>
          <p className="mt-1 text-sm text-slate-600">Tell us about you and your coaching focus.</p>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Name & Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Name *</label>
              <input {...register('name')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">Email *</label>
              <input type="email" {...register('email')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-slate-800">Timezone *</label>
            <select {...register('timezone')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500">
              <option value="">Select…</option>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
            {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-800">Short bio *</label>
            <textarea rows={5} {...register('bio')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500" />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
          </div>

          {/* Focus areas */}
          <div>
            <span className="block text-sm font-medium text-slate-800">Focus areas *</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AREAS.map(area => (
                <label key={area} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" value={area} {...register('focus_areas')} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  {area}
                </label>
              ))}
            </div>
            {errors.focus_areas && <p className="mt-1 text-sm text-red-600">{errors.focus_areas.message as string}</p>}
          </div>

          {/* Optional links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Calendly link (optional)</label>
              <input placeholder="https://calendly.com/you/intro" {...register('calendly_url')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500" />
              {errors.calendly_url && <p className="mt-1 text-sm text-red-600">{errors.calendly_url.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">LinkedIn/Website (optional)</label>
              <input placeholder="https://www.linkedin.com/in/you" {...register('linkedin_url')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 focus:ring-2 focus:ring-indigo-500" />
              {errors.linkedin_url && <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>}
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('agree')} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span>I agree that my application will be reviewed and I may be contacted for next steps.</span>
          </label>
          {errors.agree && <p className="text-sm text-red-600">{errors.agree.message}</p>}

          {/* Global error */}
          {errorMsg && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700 ring-1 ring-red-200">{errorMsg}</p>}

          {/* Submit */}
          <div className="pt-2">
            <button
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-indigo-500/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
