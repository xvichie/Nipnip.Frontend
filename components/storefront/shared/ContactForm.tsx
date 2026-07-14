'use client'

import { useState } from 'react'
import { useSubmitContactMessage } from '@/lib/queries/storefront'
import type { ThemeConfig } from '@/lib/types/storefront'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactForm({
  slug,
  tokens,
  variant = 'light',
  radiusClass = '',
  heading,
}: {
  slug: string
  tokens: Required<ThemeConfig>
  variant?: 'light' | 'dark'
  radiusClass?: string
  heading?: string
}) {
  const { mutate: submit, isPending, isSuccess, error, reset } = useSubmitContactMessage(slug)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  const dark = variant === 'dark'
  const textClass = dark ? 'text-white' : 'text-gray-900'
  const mutedClass = dark ? 'text-white/40' : 'text-gray-400'
  const inputClass = dark
    ? 'bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-white/30'
    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')

    if (!name.trim()) {
      setValidationError('სახელი სავალდებულოა.')
      return
    }
    if (!message.trim()) {
      setValidationError('შეტყობინება სავალდებულოა.')
      return
    }
    if (!email.trim() && !phone.trim()) {
      setValidationError('მიუთითეთ ელფოსტა ან ტელეფონის ნომერი.')
      return
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      setValidationError('ელფოსტის ფორმატი არასწორია.')
      return
    }

    submit(
      { name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, message: message.trim() },
      { onSuccess: () => { setName(''); setEmail(''); setPhone(''); setMessage('') } }
    )
  }

  if (isSuccess) {
    return (
      <div className={`${radiusClass} border ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} px-6 py-8 text-center`}>
        <p className={`text-sm font-medium ${textClass}`}>მადლობთ! თქვენი შეტყობინება გაიგზავნა.</p>
        <button
          type="button"
          onClick={() => reset()}
          className={`mt-3 text-xs underline underline-offset-2 ${mutedClass} hover:opacity-80`}
        >
          ახალი შეტყობინების გაგზავნა
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {heading && <h2 className={`font-bold text-lg ${textClass}`}>{heading}</h2>}

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="სახელი"
          className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="ტელეფონის ნომერი"
          className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="ელფოსტა"
        className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
      />
      <p className={`text-xs -mt-2 ${mutedClass}`}>მიუთითეთ ელფოსტა ან ტელეფონის ნომერი</p>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="შეტყობინება"
        rows={4}
        className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
      />

      {validationError && <p className="text-red-400 text-xs">{validationError}</p>}
      {error && <p className="text-red-400 text-xs">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>}

      <button
        type="submit"
        disabled={isPending}
        className={`${radiusClass} self-start px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40`}
        style={{ backgroundColor: tokens.accentColor }}
      >
        {isPending ? 'იგზავნება...' : 'გაგზავნა'}
      </button>
    </form>
  )
}
