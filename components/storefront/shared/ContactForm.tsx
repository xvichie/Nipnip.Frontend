'use client'

import { useState } from 'react'
import { useSubmitContactMessage } from '@/lib/queries/storefront'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'
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
  const { t } = useStorefrontLanguage()
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
      setValidationError(t.contactForm.errorName)
      return
    }
    if (!message.trim()) {
      setValidationError(t.contactForm.errorMessage)
      return
    }
    if (!email.trim() && !phone.trim()) {
      setValidationError(t.contactForm.errorContact)
      return
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      setValidationError(t.contactForm.errorEmail)
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
        <p className={`text-sm font-medium ${textClass}`}>{t.contactForm.success}</p>
        <button
          type="button"
          onClick={() => reset()}
          className={`mt-3 text-xs underline underline-offset-2 ${mutedClass} hover:opacity-80`}
        >
          {t.contactForm.sendAnother}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {heading && <h2 className={`font-bold text-lg ${textClass}`}>{heading}</h2>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t.contactForm.namePlaceholder}
          className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder={t.contactForm.phonePlaceholder}
          className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t.contactForm.emailPlaceholder}
        className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
      />
      <p className={`text-xs -mt-2 ${mutedClass}`}>{t.contactForm.emailHelper}</p>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={t.contactForm.messagePlaceholder}
        rows={4}
        className={`${radiusClass} border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
      />

      {validationError && <p className="text-red-400 text-xs">{validationError}</p>}
      {error && <p className="text-red-400 text-xs">{t.contactForm.submitError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className={`${radiusClass} self-start px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40`}
        style={{ backgroundColor: tokens.accentColor }}
      >
        {isPending ? t.contactForm.submitPending : t.contactForm.submitIdle}
      </button>
    </form>
  )
}
