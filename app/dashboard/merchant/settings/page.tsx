'use client'

import { useEffect, useRef, useState } from 'react'
import { useMerchantMe, useUpdateMerchant } from '@/lib/queries/merchants'
import { uploadImage } from '@/lib/uploadImage'
import { useLanguage } from '@/lib/i18n'
import { CImg } from '@/components/ui/CImg'

export default function MerchantSettingsPage() {
  const { data: merchant, isLoading } = useMerchantMe()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [commissionPercent, setCommissionPercent] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!merchant) return
    setName(merchant.name)
    setDescription(merchant.description ?? '')
    setWebsiteUrl(merchant.websiteUrl ?? '')
    setInstagram(merchant.instagramHandle ?? '')
    setLogoUrl(merchant.logoUrl ?? '')
    setCommissionPercent(String(merchant.commissionPercent))
    setNotificationEmail(merchant.notificationEmail ?? '')
  }, [merchant])

  async function handleLogoFile(file: File) {
    setLogoUploadError(null)
    setLogoPreview(URL.createObjectURL(file))
    setLogoUploading(true)
    try {
      const url = await uploadImage(file)
      setLogoUrl(url)
      setLogoPreview(null)
    } catch {
      setLogoUploadError(t.settings.uploadError)
      setLogoPreview(null)
    } finally {
      setLogoUploading(false)
    }
  }

  function handleCopyApiKey() {
    if (!merchant?.apiKey) return
    navigator.clipboard.writeText(merchant.apiKey)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  const { mutate, isPending, error } = useUpdateMerchant(merchant?.id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!merchant || isPending) return
    const pct = parseFloat(commissionPercent)
    mutate(
      {
        name: name.trim() || null,
        description: description.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        instagramHandle: instagram.trim() || null,
        logoUrl: logoUrl.trim() || null,
        commissionPercent: isNaN(pct) ? null : pct,
        notificationEmail: notificationEmail.trim() || null,
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        },
      }
    )
  }

  const initials = (merchant?.name ?? '??').slice(0, 2).toUpperCase()

  if (isLoading || !merchant) {
    return (
      <div className="flex flex-col gap-8 max-w-lg">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-128 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.settings.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.settings.profileSection}</p>
      </div>

      <div className="flex items-center gap-4">
        {logoUrl ? (
          <CImg
            src={logoUrl}
            alt={merchant?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/20 flex items-center justify-center text-xl font-black text-fuchsia-400 select-none">
            {initials}
          </div>
        )}
        <div>
          <p className="font-bold text-white text-sm">{merchant?.name}</p>
          <p className="text-white/30 text-xs mt-0.5">/{merchant?.slug}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="fieldset gap-2">
            <label htmlFor="name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.nameLabel} <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              placeholder="My Store"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.descriptionLabel}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="website" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.websiteLabel}
            </label>
            <input
              id="website"
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              placeholder="https://mystore.ge"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="instagram" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.instagramLabel}
            </label>
            <div className="flex">
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                @
              </span>
              <input
                id="instagram"
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-fuchsia-500/60 min-w-0"
                placeholder="mystore.ge"
              />
            </div>
          </div>

          {/* Logo upload */}
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.logoLabel}
            </label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
            />
            <div
              className="relative flex items-center gap-4 rounded-xl border border-dashed border-white/12 bg-white/2 p-4 cursor-pointer hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoUploading ? (
                <div className="w-14 h-14 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center shrink-0">
                  <span className="loading loading-spinner loading-sm text-fuchsia-400" />
                </div>
              ) : (logoPreview ?? logoUrl) ? (
                <CImg
                  src={logoPreview ?? logoUrl}
                  alt="logo preview"
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                    <path d="M4 16l4-4 3 3 4-5 5 6H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="2" y="2" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/70">
                  {logoUploading ? t.settings.uploading : t.settings.uploadPhoto}
                </p>
                <p className="text-xs text-white/30 mt-0.5 truncate">
                  {t.settings.uploadHint}
                </p>
              </div>
            </div>
            {logoUploadError && <p className="text-xs text-error">{logoUploadError}</p>}
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="commission" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.commissionLabel} <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-0">
              <input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionPercent}
                onChange={e => setCommissionPercent(e.target.value)}
                className="input flex-1 bg-white/4 border-white/10 rounded-r-none focus:border-fuchsia-500/60 tabular-nums"
                placeholder="10"
                required
              />
              <span className="flex items-center px-3 h-full text-white/30 text-sm bg-white/3 border border-l-0 border-white/10 rounded-r-(--radius-field) select-none shrink-0">
                %
              </span>
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="notif-email" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.notificationEmailLabel}
            </label>
            <input
              id="notif-email"
              type="email"
              value={notificationEmail}
              onChange={e => setNotificationEmail(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              placeholder="sales@mystore.ge"
            />
            <p className="text-white/25 text-xs">{t.settings.notificationEmailHint}</p>
          </div>

          {/* Slug read-only */}
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.slugLabel}
            </label>
            <input
              type="text"
              value={merchant?.slug ?? ''}
              disabled
              className="input w-full bg-white/2 border-white/6 text-white/30 cursor-not-allowed"
            />
          </div>

          {/* API Key read-only */}
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={merchant?.apiKey ?? ''}
                disabled
                className="input w-full bg-white/2 border-white/6 text-white/40 cursor-not-allowed font-mono text-xs pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={handleCopyApiKey} className="btn btn-ghost btn-xs text-white/40 hover:text-white px-1.5">
                  {apiKeyCopied ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <rect x="5" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M9 11v1.5A1.5 1.5 0 0 1 7.5 14h-6A1.5 1.5 0 0 1 0 12.5v-8A1.5 1.5 0 0 1 1.5 3H3" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
                <button type="button" onClick={() => setShowApiKey(v => !v)} className="btn btn-ghost btn-xs text-white/40 hover:text-white px-1.5">
                  {showApiKey ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M1 1l12 12M5.5 5.6A2 2 0 0 0 8.4 8.5M3.2 3.3C2 4.2 1 5.5 1 7c0 2 3 5 6 5 1.2 0 2.3-.4 3.2-1M5 2.2C5.6 2.1 6.3 2 7 2c3 0 6 3 6 5 0 .8-.3 1.6-.8 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M1 7c0-2 3-5 6-5s6 3 6 5-3 5-6 5-6-3-6-5z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {t.settings.saveError}
            </div>
          )}

          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t.settings.saveSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim() || !commissionPercent}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                {t.common.save}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  )
}
