'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useAdminCreateMerchant } from '@/lib/queries/admin'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'

function genPassword() {
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `NipNip${rand}!`
}

type Step = 'form' | 'success'

interface CreatedInfo {
  merchantName: string
  email: string
  password: string
}

export default function AdminNewMerchantPage() {
  const { mutateAsync: createMerchant } = useAdminCreateMerchant()

  // account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(genPassword)

  // merchant info
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [commissionPercent, setCommissionPercent] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [description, setDescription] = useState('')

  // logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')   // local blob URL
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')           // final Cloudinary URL
  const [logoError, setLogoError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [created, setCreated] = useState<CreatedInfo | null>(null)

  function handleNameChange(v: string) {
    setName(v)
    if (!slug) {
      setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    setLogoError('')
    setLogoUrl('')

    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)

    if (!cloudinaryConfigured) {
      setLogoError('Cloudinary is not configured — fill NEXT_PUBLIC_CLOUDINARY_* in .env.local')
      return
    }

    setLogoUploading(true)
    try {
      const url = await uploadImage(file)
      setLogoUrl(url)
      setLogoPreview(url)
    } catch {
      setLogoError('Upload failed. Check Cloudinary config and try again.')
      setLogoFile(null)
      setLogoPreview('')
    } finally {
      setLogoUploading(false)
    }
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setLogoUrl('')
    setLogoError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || logoUploading) return

    const pct = parseFloat(commissionPercent)
    if (isNaN(pct)) return

    setSubmitting(true)
    setSubmitError('')

    try {
      // Step 1: create Clerk user
      const clerkRes = await fetch('/api/admin/create-clerk-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const clerkData = await clerkRes.json() as { userId?: string; error?: string }
      if (!clerkRes.ok) throw new Error(clerkData.error ?? 'Failed to create Clerk user')

      // Step 2: create merchant
      await createMerchant({
        clerkUserId: clerkData.userId!,
        name: name.trim(),
        slug: slug.trim(),
        commissionPercent: pct,
        websiteUrl: websiteUrl.trim() || null,
        instagramHandle: instagram.trim() || null,
        description: description.trim() || null,
        logoUrl: logoUrl || null,
      })

      setCreated({ merchantName: name.trim(), email: email.trim(), password })
      setStep('success')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    email.trim() &&
    password.length >= 8 &&
    name.trim() &&
    slug.trim() &&
    commissionPercent &&
    !submitting &&
    !logoUploading

  if (step === 'success' && created) {
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="flex items-center gap-3">
          <Link href="/admin/merchants" className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-black tracking-tight">Merchant Created</h1>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="text-emerald-400">
                <path d="M3.5 9.5l4 4 7-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm">{created.merchantName}</p>
              <p className="text-emerald-400/70 text-xs">Account created successfully</p>
            </div>
          </div>

          <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4 flex flex-col gap-3">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
              Share these login credentials with the merchant
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/40 text-sm">Email</span>
                <span className="text-white text-sm font-mono">{created.email}</span>
              </div>
              <div className="h-px bg-white/[0.05]" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/40 text-sm">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 text-sm font-mono font-bold">{created.password}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(created.password)}
                    className="btn btn-xs bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white"
                    title="Copy password"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M3 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-white/25 text-xs">
              The merchant can change their password after first login via their account settings.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/merchants"
            className="btn flex-1 bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white"
          >
            Back to Merchants
          </Link>
          <button
            onClick={() => {
              setStep('form')
              setName(''); setSlug(''); setEmail('')
              setCommissionPercent(''); setWebsiteUrl('')
              setInstagram(''); setDescription('')
              clearLogo()
              setPassword(genPassword())
              setCreated(null)
            }}
            className="btn flex-1 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25"
          >
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">

      <div className="flex items-center gap-3">
        <Link href="/admin/merchants" className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">New Merchant</h1>
          <p className="text-white/40 text-sm mt-0.5">Create a Clerk account and merchant profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Account */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Account</h2>

          <div className="fieldset gap-2">
            <label htmlFor="email" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Email <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
              placeholder="merchant@store.ge"
              required
              autoComplete="off"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="password" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Temp Password <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="password"
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input flex-1 bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 font-mono"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setPassword(genPassword())}
                className="btn btn-square bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white shrink-0"
                title="Regenerate"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 7A6 6 0 0 1 12.5 4M13 7A6 6 0 0 1 1.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 2l1.5 2-2 1M3 12L1.5 10l2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-white/25 text-xs">Auto-generated. Share this with the merchant — they can change it after first login.</p>
          </div>
        </section>

        {/* Merchant info */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Profile</h2>

          <div className="fieldset gap-2">
            <label htmlFor="m-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Name <span className="text-error">*</span>
            </label>
            <input
              id="m-name"
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
              placeholder="My Store"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="m-slug" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Slug <span className="text-error">*</span>
            </label>
            <input
              id="m-slug"
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 font-mono"
              placeholder="my-store"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="m-commission" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Commission % <span className="text-error">*</span>
            </label>
            <div className="flex">
              <input
                id="m-commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionPercent}
                onChange={e => setCommissionPercent(e.target.value)}
                className="input flex-1 bg-white/[0.04] border-white/[0.1] rounded-r-none focus:border-amber-500/60 tabular-nums"
                placeholder="10"
                required
              />
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/[0.03] border border-l-0 border-white/[0.1] rounded-r-[var(--radius-field)] select-none shrink-0">
                %
              </span>
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="m-website" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Website URL
            </label>
            <input
              id="m-website"
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
              placeholder="https://mystore.ge"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="m-instagram" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Instagram
            </label>
            <div className="flex">
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/[0.03] border border-r-0 border-white/[0.1] rounded-l-[var(--radius-field)] select-none shrink-0">
                @
              </span>
              <input
                id="m-instagram"
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="input flex-1 bg-white/[0.04] border-white/[0.1] rounded-l-none focus:border-amber-500/60 min-w-0"
                placeholder="mystore.ge"
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="m-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="m-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="textarea w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 resize-none"
              placeholder="Short description…"
            />
          </div>
        </section>

        {/* Logo */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Logo</h2>

          {logoPreview ? (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.1] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 min-w-0">
                {logoUploading && (
                  <p className="text-white/40 text-sm">Uploading…</p>
                )}
                {logoUrl && !logoUploading && (
                  <p className="text-emerald-400 text-xs flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6.5l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Uploaded
                  </p>
                )}
                {logoError && (
                  <p className="text-error text-xs">{logoError}</p>
                )}
                <button
                  type="button"
                  onClick={clearLogo}
                  className="btn btn-xs self-start bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.25] transition-colors cursor-pointer">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-white/25">
                <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-white/30 text-sm">Click to upload logo</span>
              <span className="text-white/20 text-xs">PNG, JPG, WEBP</span>
              {!cloudinaryConfigured && (
                <span className="text-amber-400/60 text-xs mt-1">
                  Configure Cloudinary env vars to enable uploads
                </span>
              )}
            </label>
          )}
        </section>

        {submitError && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn w-full gap-2 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Creating…
            </>
          ) : (
            <>
              Create Merchant
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

      </form>
    </div>
  )
}
