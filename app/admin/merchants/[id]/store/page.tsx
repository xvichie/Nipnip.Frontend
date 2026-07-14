'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAdminCreateStore, useAdminMerchant, useAdminMerchantStore } from '@/lib/queries/admin'

export default function AdminMerchantStorePage() {
  const { id } = useParams<{ id: string }>()

  const { data: merchant, isLoading: isMerchantLoading, isError: isMerchantError } = useAdminMerchant(id)
  const { data: store, isLoading: isStoreLoading } = useAdminMerchantStore(id)
  const { mutate: createStore, isPending, error } = useAdminCreateStore(id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  function handleNameChange(v: string) {
    setName(v)
    if (!slugTouched) {
      setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createStore({ name: name.trim(), slug: slug.trim() })
  }

  const canSubmit = name.trim() && slug.trim() && !isPending

  if (isMerchantLoading || isStoreLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (isMerchantError || !merchant) {
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
          <h1 className="text-2xl font-black tracking-tight">Store</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {merchant.name}
            <span className="text-white/25 ml-1.5">/{merchant.slug}</span>
          </p>
        </div>
      </div>

      {store ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white text-sm">{store.name}</span>
            <span className={[
              'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium',
              store.isActive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white/30',
            ].join(' ')}>
              {store.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">Slug</span>
              <span className="font-mono text-white/40 text-xs">{store.slug}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs uppercase tracking-wider">Storefront</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="font-mono text-white/40 text-xs">{store.slug}.nipnip.ge</span>
                <a
                  href={`https://${store.slug}.nipnip.ge`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs gap-1 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25"
                >
                  ვებგვერდის ნახვა
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M5 9l4-4M5.5 3H11v5.5M3 5.5V11h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="text-white/25 text-xs">
            The merchant can now log into their dashboard and populate categories, products, and variants.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="fieldset gap-2">
              <label htmlFor="s-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Store Name <span className="text-error">*</span>
              </label>
              <input
                id="s-name"
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
                placeholder="My Store"
                required
              />
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="s-slug" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Slug <span className="text-error">*</span>
              </label>
              <input
                id="s-slug"
                type="text"
                value={slug}
                onChange={e => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')) }}
                className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 font-mono"
                placeholder="my-store"
                required
              />
              <p className="text-white/25 text-xs mt-1">Storefront will be reachable at {slug || 'slug'}.nipnip.ge</p>
            </div>

            {error && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                Failed to create store. The slug may already be taken.
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
                  Create Store
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      )}

    </div>
  )
}
