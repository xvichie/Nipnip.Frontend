'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAdminMerchant, useAdminMerchantOwner, useAdminMerchantStore, useAdminUpdateMerchant } from '@/lib/queries/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminEditMerchantPage() {
  const { id } = useParams<{ id: string }>()

  const { data: merchant, isLoading, isError } = useAdminMerchant(id)
  const { data: store } = useAdminMerchantStore(id)
  const { data: ownerData, isLoading: ownerLoading } = useAdminMerchantOwner(id)
  const { mutate, isPending, error } = useAdminUpdateMerchant(id)

  const [name, setName] = useState('')
  const [commissionPercent, setCommissionPercent] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates the form once the merchant
  // query resolves (matches the pattern used by the admin store/prospect pages).
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  if (merchant && hydratedId !== merchant.id) {
    setHydratedId(merchant.id)
    setName(merchant.name)
    setCommissionPercent(String(merchant.commissionPercent))
    setWebsiteUrl(merchant.websiteUrl ?? '')
    setInstagram(merchant.instagramHandle ?? '')
    setDescription(merchant.description ?? '')
    setLogoUrl(merchant.logoUrl ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pct = parseFloat(commissionPercent)
    if (isNaN(pct)) return

    mutate(
      {
        name: name.trim() || null,
        commissionPercent: pct,
        websiteUrl: websiteUrl.trim() || null,
        instagramHandle: instagram.trim() || null,
        description: description.trim() || null,
        logoUrl: logoUrl.trim() || null,
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        },
      }
    )
  }

  const canSubmit = name.trim() && commissionPercent && !isPending

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-[34rem] rounded-2xl" />
      </div>
    )
  }

  if (isError || !merchant) {
    return (
      <div className="max-w-lg">
        <div className="alert alert-error text-sm rounded-2xl">Merchant not found.</div>
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
          <h1 className="text-2xl font-black tracking-tight">Edit Merchant</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {merchant.name}
            <span className="text-white/25 ml-1.5">/{merchant.slug}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="fieldset gap-2">
            <label htmlFor="e-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Name <span className="text-error">*</span>
            </label>
            <input
              id="e-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-commission" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Commission % <span className="text-error">*</span>
            </label>
            <div className="flex">
              <input
                id="e-commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionPercent}
                onChange={e => setCommissionPercent(e.target.value)}
                className="input flex-1 bg-white/[0.04] border-white/[0.1] rounded-r-none focus:border-amber-500/60 tabular-nums"
                required
              />
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/[0.03] border border-l-0 border-white/[0.1] rounded-r-[var(--radius-field)] select-none shrink-0">
                %
              </span>
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-website" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Website URL
            </label>
            <input
              id="e-website"
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
              placeholder="https://mystore.ge"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-instagram" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Instagram
            </label>
            <div className="flex">
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/[0.03] border border-r-0 border-white/[0.1] rounded-l-[var(--radius-field)] select-none shrink-0">
                @
              </span>
              <input
                id="e-instagram"
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="input flex-1 bg-white/[0.04] border-white/[0.1] rounded-l-none focus:border-amber-500/60 min-w-0"
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="e-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="textarea w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 resize-none"
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-logo" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Logo URL
            </label>
            <input
              id="e-logo"
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
            />
          </div>

          {/* Read-only info */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 flex flex-col gap-2">
            <div className="flex justify-between items-center gap-3">
              <span className="text-white/30 text-xs uppercase tracking-wider shrink-0">Owner</span>
              <span className="text-white/50 text-xs truncate text-right">
                {ownerLoading
                  ? <span className="loading loading-spinner loading-xs align-middle" />
                  : ownerData?.owner
                    ? (() => {
                        const fullName = [ownerData.owner.firstName, ownerData.owner.lastName].filter(Boolean).join(' ')
                        return (
                          <>
                            {fullName && <span className="text-white/60">{fullName}</span>}
                            {ownerData.owner.email && <span className="text-white/35">{fullName ? ` · ${ownerData.owner.email}` : ownerData.owner.email}</span>}
                            {!fullName && !ownerData.owner.email && <span className="text-white/20">—</span>}
                          </>
                        )
                      })()
                    : <span className="text-white/20">No linked account</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">Slug</span>
              <span className="font-mono text-white/40 text-xs">{merchant.slug}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">Store Created</span>
              <span className="text-white/40 text-xs tabular-nums">
                {store ? formatDate(store.createdAt) : <span className="text-white/20">No store yet</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">API Key</span>
              <span className="font-mono text-white/25 text-xs truncate max-w-[200px]">{merchant.apiKey}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">Balance</span>
              <span className="text-white/40 text-xs tabular-nums">{merchant.balance.toFixed(2)} ₾</span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              Failed to save changes.
            </div>
          )}

          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved successfully
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn w-full mt-1 gap-2 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                Save Changes
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
