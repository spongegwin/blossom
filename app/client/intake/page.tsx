'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
   

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  goals: z.string().min(10),
  preferred_topics: z.string().array().optional(),
  budget_hint: z.coerce.number().optional(),
})

type FormData = z.infer<typeof Schema>

export default function ClientIntakePage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, } = useForm<FormData>({
    resolver: zodResolver(Schema)
  })

  const [errorMsg, setErrorMsg] = useState('')

 
  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },   // good practice
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const { error } = await res.json()
        setErrorMsg(error ?? `HTTP ${res.status}`)
        return
      }

      toast.success(
        'Thank you for your interest in Blossom Coaching! We will follow up shortly.'
      )
      reset()
      setErrorMsg('') // clear any previous error

  //    Option to redirect to coaches when it's live
  //    window.location.href = '/coaches'
    } catch (err) {
      console.error(err)
      setErrorMsg('Network error - please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl p-6 space-y-4">
      <input placeholder="Name" {...register('name')} className="w-full border p-2" />
      <input placeholder="Email" {...register('email')} className="w-full border p-2" />
      <textarea placeholder="What do you want help with?" {...register('goals')} className="w-full border p-2" />
      <input placeholder="Budget (optional)" {...register('budget_hint')} className="w-full border p-2" />
     
      {errorMsg && (
        <p className="text-red-600">{errorMsg}</p> 
      )}

      <button disabled={isSubmitting} className="border px-4 py-2">
        {isSubmitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  )
}

