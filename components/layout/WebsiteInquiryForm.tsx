'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { useSubmitWebsiteInquiry } from '@/lib/queries/website-inquiries'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function WebsiteInquiryForm() {
  const { t } = useLanguage()
  const { mutate: submit, isPending, isSuccess, error, reset } = useSubmitWebsiteInquiry()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')

    if (!name.trim()) {
      setValidationError(t.websiteInquiry.errorName)
      return
    }
    if (!message.trim()) {
      setValidationError(t.websiteInquiry.errorMessage)
      return
    }
    if (!email.trim() && !phone.trim()) {
      setValidationError(t.websiteInquiry.errorContact)
      return
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      setValidationError(t.websiteInquiry.errorEmail)
      return
    }

    submit(
      { name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, message: message.trim() },
      { onSuccess: () => { setName(''); setEmail(''); setPhone(''); setMessage('') } }
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2">
        {t.websiteInquiry.heading}
      </h2>
      <p className="text-white/40 text-sm mb-5 max-w-md">{t.websiteInquiry.subheading}</p>

      {isSuccess ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4 max-w-md w-full">
          <p className="text-emerald-400 text-sm font-medium">{t.websiteInquiry.success}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-2 text-xs text-white/30 hover:text-white/60 underline underline-offset-2 transition-colors"
          >
            {t.websiteInquiry.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 max-w-md w-full text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.websiteInquiry.namePlaceholder}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={t.websiteInquiry.phonePlaceholder}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t.websiteInquiry.emailPlaceholder}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
          />
          <p className="text-white/20 text-xs -mt-1">{t.websiteInquiry.contactHint}</p>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t.websiteInquiry.messagePlaceholder}
            rows={3}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors resize-none"
          />

          {validationError && <p className="text-red-400 text-xs">{validationError}</p>}
          {error && <p className="text-red-400 text-xs">{t.websiteInquiry.errorGeneric}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="self-start rounded-lg px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            {isPending ? t.websiteInquiry.submitting : t.websiteInquiry.submit}
          </button>
        </form>
      )}
    </div>
  )
}
