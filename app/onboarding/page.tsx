'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useLanguage } from '@/lib/i18n'
import { useMyWebsiteInquiry, useSubmitOnboardingInquiry } from '@/lib/queries/website-inquiries'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61588723170626'
const INSTAGRAM_URL = 'https://www.instagram.com/nipnip.ge/'

function SuccessGraphic() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-2">
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
      <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-400/30 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="20" r="18" stroke="url(#successGrad)" strokeWidth="2" />
          <path d="M12 20.5l5.5 5.5L28.5 14" stroke="url(#successGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="successGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function SuccessScreen({ storeName }: { storeName?: string }) {
  const { t } = useLanguage()

  return (
    <div className="w-full max-w-md text-center">
      <SuccessGraphic />

      <h1 className="font-display text-3xl font-black tracking-tight mb-3">
        {t.onboarding.successTitle}
      </h1>
      <p className="text-white/50 text-base leading-relaxed mb-1">
        {t.onboarding.successBody}
      </p>
      {storeName && (
        <p className="text-white/30 text-sm mb-8">{storeName}</p>
      )}
      {!storeName && <div className="mb-8" />}

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
          {t.onboarding.meanwhileTitle}
        </p>
        <p className="text-white/40 text-sm leading-relaxed mb-5">
          {t.onboarding.meanwhileBody}
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm gap-2 bg-white/4 border-white/8 text-white/70 hover:text-white hover:bg-white/8"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10.5 5.5H9a1 1 0 0 0-1 1V8h2.4l-.3 2H8v5H6V10H4.5V8H6V6.2C6 4.4 7.1 3 9 3h1.5v2.5Z" fill="currentColor" />
            </svg>
            Facebook
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm gap-2 bg-white/4 border-white/8 text-white/70 hover:text-white hover:bg-white/8"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="2" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8" cy="8" r="2.7" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="11.3" cy="4.7" r="0.8" fill="currentColor" />
            </svg>
            Instagram
          </a>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const role = useCurrentRole()
  const { t } = useLanguage()

  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [storeName, setStoreName] = useState('')
  const [validationError, setValidationError] = useState('')

  const isNew = isLoaded && isSignedIn && role === 'new'
  const { data: myInquiry, isLoading: myInquiryLoading } = useMyWebsiteInquiry(isNew)
  const { mutate: submit, isPending, isSuccess, error: submitError, data: submitted } = useSubmitOnboardingInquiry()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { router.replace('/'); return }
    if (role === 'creator') router.replace('/dashboard/creator')
    else if (role === 'merchant') router.replace('/dashboard/merchant')
  }, [isLoaded, isSignedIn, role, router])

  function validateStep1(): boolean {
    if (!name.trim()) {
      setValidationError(t.onboarding.errorName)
      return false
    }
    if (!email.trim() && !phone.trim()) {
      setValidationError(t.onboarding.errorContact)
      return false
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      setValidationError(t.onboarding.errorEmail)
      return false
    }
    return true
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (validateStep1()) setStep(2)
  }

  function handleBack() {
    setValidationError('')
    setStep(1)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (!validateStep1()) { setStep(1); return }

    submit({
      name: name.trim(),
      storeName: storeName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    })
  }

  const showLoading = !isLoaded || !isSignedIn || (role && role !== 'new') || (isNew && myInquiryLoading)
  const alreadySubmitted = isNew && !!myInquiry
  const showSuccess = isSuccess || alreadySubmitted

  if (showLoading) {
    return (
      <div className="bg-[#08080d] min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">

      <header className="border-b border-white/6 px-6 lg:px-16 h-15 flex items-center">
        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 select-none">
          NipNip
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pt-10 pb-10">

        <div className="pointer-events-none fixed inset-0 flex items-start justify-center -z-10">
          <div className="mt-16 h-100 w-150 rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        {showSuccess ? (
          <SuccessScreen storeName={submitted?.storeName ?? myInquiry?.storeName ?? undefined} />
        ) : (
          <div className="w-full max-w-lg flex flex-col items-center">

            {/* Hero — pushy, benefit-led */}
            <div className="text-center mb-6">
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-[1.15] mb-3">
                {t.onboarding.heroHeadline}
              </h1>
              <p className="text-white/50 text-base leading-relaxed max-w-md mx-auto mb-3">
                {t.onboarding.heroSubheadline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  {t.onboarding.benefit1}
                </span>
                <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  {t.onboarding.benefit3}
                </span>
              </div>
            </div>

            {/* Form card */}
            <div className="w-full rounded-2xl border border-white/7 bg-white/2 p-5 sm:p-6">

              <div className="flex items-center justify-between mb-4">
                <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest">
                  {step === 1 ? t.onboarding.step1Label : t.onboarding.step2Label}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/15'}`} />
                  <span className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/15'}`} />
                </div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleNext} noValidate className="flex flex-col gap-4">

                  <div className="fieldset gap-1.5">
                    <label htmlFor="name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                      {t.onboarding.nameLabel} <span className="text-error">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
                      placeholder={t.onboarding.namePlaceholder}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="fieldset gap-1.5">
                      <label htmlFor="email" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        {t.onboarding.emailLabel}
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
                        placeholder={t.onboarding.emailPlaceholder}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <div className="fieldset gap-1.5">
                      <label htmlFor="phone" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        {t.onboarding.phoneLabel}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
                        placeholder={t.onboarding.phonePlaceholder}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  <p className="fieldset-label text-white/30 -mt-2">{t.onboarding.contactHint}</p>

                  {validationError && (
                    <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                      {validationError}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-full mt-1 gap-2">
                    {t.onboarding.next}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                </form>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                  <div className="fieldset gap-1.5">
                    <label htmlFor="store-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                      {t.onboarding.storeNameLabel}
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
                      placeholder={t.onboarding.storeNamePlaceholder}
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      autoComplete="organization"
                      autoFocus
                    />
                    <p className="fieldset-label text-white/30">{t.onboarding.storeNameHint}</p>
                  </div>

                  {(validationError || submitError) && (
                    <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                      {validationError || t.onboarding.error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn gap-2 bg-white/4 border-white/8 text-white/60 hover:text-white"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t.onboarding.back}
                    </button>
                    <button type="submit" disabled={isPending} className="btn btn-primary flex-1 gap-2">
                      {isPending ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          {t.onboarding.submit}
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
