'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useLanguage } from '@/lib/i18n'
import type { RegisterCreatorRequest } from '@/lib/types'

const SLUG_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function OnboardingPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  const role = useCurrentRole()
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDerived, setSlugDerived] = useState(true)
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { router.replace('/'); return }
    if (role === 'creator') router.replace('/dashboard/creator')
    else if (role === 'merchant') router.replace('/dashboard/merchant')
  }, [isLoaded, isSignedIn, role, router])

  function handleNameChange(value: string) {
    setName(value)
    if (slugDerived) setSlug(toSlug(value))
  }

  function handleSlugChange(value: string) {
    setSlugDerived(false)
    setSlug(value.toLowerCase())
  }

  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return }
    if (!SLUG_RE.test(slug)) { setSlugStatus('invalid'); return }

    setSlugStatus('checking')
    const id = setTimeout(async () => {
      try {
        const token = await getToken()
        await apiFetch(`/api/creators/${slug}`, token)
        setSlugStatus('taken')
      } catch (e) {
        if (e instanceof ApiError) {
          setSlugStatus(e.status === 404 ? 'available' : 'idle')
        } else {
          setSlugStatus('available')
        }
      }
    }, 500)
    return () => clearTimeout(id)
  }, [slug, getToken])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugStatus !== 'available' || !name.trim() || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const token = await getToken()
      const body: RegisterCreatorRequest = {
        name: name.trim(),
        slug,
        instagramHandle: instagram.trim() || null,
        tiktokHandle: tiktok.trim() || null,
      }
      await apiFetch('/api/creators', token, { method: 'POST', body: JSON.stringify(body) })
      await queryClient.invalidateQueries({ queryKey: ['current-role'] })
      router.push('/dashboard/creator')
    } catch {
      setSubmitError(t.onboarding.error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoaded || !isSignedIn || (role && role !== 'new')) {
    return (
      <div className="bg-[#08080d] min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const slugHint =
    slugStatus === 'available' ? '✓' :
    slugStatus === 'taken'     ? t.onboarding.slugHint :
    slugStatus === 'invalid'   ? t.onboarding.slugHint :
    slugStatus === 'checking'  ? t.common.loading :
    t.onboarding.slugHint

  const canSubmit = name.trim().length > 0 && slugStatus === 'available' && !submitting

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">

      <header className="border-b border-white/6 px-6 lg:px-16 h-15 flex items-center">
        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 select-none">
          NipNip
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">

        <div className="pointer-events-none fixed inset-0 flex items-start justify-center -z-10">
          <div className="mt-16 h-100 w-150 rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-lg">

          <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">
            ✦ {t.onboarding.title}
          </p>

          <h1 className="font-display text-4xl font-black tracking-tight mb-2 leading-tight">
            {t.onboarding.title}
          </h1>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            {t.onboarding.subtitle}
          </p>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 lg:p-8">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

              <div className="fieldset gap-2">
                <label htmlFor="name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.onboarding.nameLabel} <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
                  placeholder={t.onboarding.namePlaceholder}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="slug" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.onboarding.slugLabel} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    id="slug"
                    type="text"
                    className={[
                      'input w-full bg-white/4 pr-10',
                      slugStatus === 'available' ? 'input-success' :
                      slugStatus === 'taken' || slugStatus === 'invalid' ? 'input-error' :
                      'border-white/10',
                    ].join(' ')}
                    placeholder={t.onboarding.slugPlaceholder}
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm leading-none">
                    {slugStatus === 'checking'  && <span className="loading loading-spinner loading-xs text-white/40" />}
                    {slugStatus === 'available' && <span className="text-success">✓</span>}
                    {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="text-error">✗</span>}
                  </span>
                </div>
                <p className={[
                  'fieldset-label',
                  slugStatus === 'available' ? 'text-success' :
                  slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-error' :
                  'text-white/30',
                ].join(' ')}>
                  {slugHint}
                </p>
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="instagram" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.onboarding.instagramLabel}
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                    @
                  </span>
                  <input
                    id="instagram"
                    type="text"
                    className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                    placeholder={t.onboarding.instagramPlaceholder.replace('@', '')}
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="tiktok" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.onboarding.tiktokLabel}
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                    @
                  </span>
                  <input
                    id="tiktok"
                    type="text"
                    className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                    placeholder={t.onboarding.tiktokPlaceholder.replace('@', '')}
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              {submitError && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={!canSubmit} className="btn btn-primary w-full mt-1 gap-2">
                {submitting ? (
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

            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
