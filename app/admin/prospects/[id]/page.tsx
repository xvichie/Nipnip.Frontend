'use client'

import { use, useRef, useState } from 'react'
import Link from 'next/link'
import {
  useAdminCreateMerchantCategory,
  useAdminCreateMerchantProduct,
  useAdminCreateMerchantProductImage,
  useAdminDeleteMerchantCategory,
  useAdminDeleteMerchantProduct,
  useAdminMerchant,
  useAdminMerchantCategories,
  useAdminMerchantProducts,
  useAdminMerchantStore,
  useAdminPromoteProspect,
  useAdminUpdateMerchantStore,
} from '@/lib/queries/admin'
import { DEFAULT_THEME_CONFIG, parseThemeConfig } from '@/lib/store/theme-config'
import { THEMES } from '@/lib/storefront-themes'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'
import { CImg } from '@/components/ui/CImg'
import type { ThemeId } from '@/lib/types/storefront'

function priceLabel(price: number, salePrice: number | null) {
  return salePrice != null ? `${salePrice} ₾ (was ${price} ₾)` : `${price} ₾`
}

export default function AdminProspectStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: merchantId } = use(params)

  const { data: merchant, isLoading: merchantLoading } = useAdminMerchant(merchantId)
  const { data: store, isLoading: storeLoading } = useAdminMerchantStore(merchantId)
  const { mutate: updateStore, isPending: isSaving, error: saveError } = useAdminUpdateMerchantStore(merchantId)

  // --- Branding / theme ---
  const [themeId, setThemeId] = useState<ThemeId>('minimal')
  const [accentColor, setAccentColor] = useState(DEFAULT_THEME_CONFIG.accentColor)
  const [logoUrl, setLogoUrl] = useState('')
  const [heroHeadline, setHeroHeadline] = useState('')
  const [heroSubheadline, setHeroSubheadline] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [heroUploading, setHeroUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once the store query resolves.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setThemeId(store.themeId as ThemeId)
    setAccentColor(parsed.accentColor)
    setLogoUrl(parsed.logoUrl)
    setHeroHeadline(parsed.heroHeadline)
    setHeroSubheadline(parsed.heroSubheadline)
    setHeroImageUrl(parsed.heroImageUrl)
  }

  async function handleLogoFile(file: File) {
    setLogoUploading(true)
    try { setLogoUrl(await uploadImage(file)) }
    finally { setLogoUploading(false) }
  }

  async function handleHeroFile(file: File) {
    setHeroUploading(true)
    try { setHeroImageUrl(await uploadImage(file)) }
    finally { setHeroUploading(false) }
  }

  function handleSaveBranding() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore(
      {
        themeId,
        themeConfig: JSON.stringify({ ...parsed, accentColor, logoUrl, heroHeadline, heroSubheadline, heroImageUrl }),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  // --- Categories ---
  const { data: categories } = useAdminMerchantCategories(merchantId)
  const { mutate: createCategory, isPending: isCreatingCategory } = useAdminCreateMerchantCategory(merchantId)
  const { mutate: deleteCategory } = useAdminDeleteMerchantCategory(merchantId)
  const [newCategoryName, setNewCategoryName] = useState('')

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    createCategory({ name: newCategoryName.trim() }, { onSuccess: () => setNewCategoryName('') })
  }

  // --- Products ---
  const { data: productsPage } = useAdminMerchantProducts(merchantId, 1, 100)
  const { mutate: createProduct, isPending: isCreatingProduct, error: createProductError } = useAdminCreateMerchantProduct(merchantId)
  const { mutate: deleteProduct } = useAdminDeleteMerchantProduct(merchantId)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productSalePrice, setProductSalePrice] = useState('')
  const [productCategoryId, setProductCategoryId] = useState('')
  const [productImageUrl, setProductImageUrl] = useState('')
  const [productImageUploading, setProductImageUploading] = useState(false)
  const { mutate: attachImage } = useAdminCreateMerchantProductImage(merchantId)

  function openProductDialog() {
    setProductName('')
    setProductPrice('')
    setProductSalePrice('')
    setProductCategoryId('')
    setProductImageUrl('')
    dialogRef.current?.showModal()
  }

  async function handleProductImageFile(file: File) {
    setProductImageUploading(true)
    try { setProductImageUrl(await uploadImage(file)) }
    finally { setProductImageUploading(false) }
  }

  function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(productPrice)
    if (isNaN(price)) return
    const sale = productSalePrice.trim() ? parseFloat(productSalePrice) : null

    createProduct(
      {
        name: productName.trim(),
        basePrice: price,
        salePrice: sale !== null && !isNaN(sale) ? sale : null,
        categoryId: productCategoryId || null,
      },
      {
        onSuccess: created => {
          if (productImageUrl) attachImage({ productId: created.id, body: { url: productImageUrl } })
          dialogRef.current?.close()
        },
      }
    )
  }

  // --- Promote ---
  const promoteDialogRef = useRef<HTMLDialogElement>(null)
  const [promoteClerkUserId, setPromoteClerkUserId] = useState('')
  const { mutate: promote, isPending: isPromoting, error: promoteError } = useAdminPromoteProspect(merchantId)

  function handlePromote(e: React.FormEvent) {
    e.preventDefault()
    promote(
      { clerkUserId: promoteClerkUserId.trim() || undefined },
      { onSuccess: () => promoteDialogRef.current?.close() }
    )
  }

  if (merchantLoading || storeLoading || !merchant || !store) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-24">

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/prospects" className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{merchant.name}</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 uppercase tracking-wider">
                Prospect
              </span>
            </div>
            <p className="text-white/40 text-sm mt-0.5 font-mono">/{merchant.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/preview/${merchant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm gap-2 bg-white/4 border-white/8 text-white/60 hover:text-white"
          >
            Open Preview ↗
          </a>
          <button
            onClick={() => promoteDialogRef.current?.showModal()}
            className="btn btn-sm gap-2 bg-emerald-500/15 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25"
          >
            Promote to Customer
          </button>
        </div>
      </div>

      {/* Branding */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-5">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Branding &amp; Theme</h2>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Theme</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeId(t.id)}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                  themeId === t.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                ].join(' ')}
              >
                <div className="flex gap-1 mb-1.5">
                  {t.swatch.map((c, i) => (
                    <span key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-amber-500/60 font-mono"
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Logo</label>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
                {logoUploading ? (
                  <span className="loading loading-spinner loading-xs text-amber-400" />
                ) : logoUrl ? (
                  <CImg src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/20 text-[9px]">None</span>
                )}
              </div>
              <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
                />
              </label>
              {!cloudinaryConfigured && <span className="text-amber-400/60 text-[10px]">Cloudinary not configured</span>}
            </div>
          </div>
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Hero Headline</label>
          <input
            type="text"
            value={heroHeadline}
            onChange={e => setHeroHeadline(e.target.value)}
            placeholder={merchant.name}
            className="input w-full bg-white/4 border-white/10 focus:border-amber-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Hero Subheadline</label>
          <textarea
            value={heroSubheadline}
            onChange={e => setHeroSubheadline(e.target.value)}
            rows={2}
            className="textarea w-full bg-white/4 border-white/10 focus:border-amber-500/60 resize-none"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Hero Image</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
              {heroUploading ? (
                <span className="loading loading-spinner loading-xs text-amber-400" />
              ) : heroImageUrl ? (
                <CImg src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-[9px]">None</span>
              )}
            </div>
            <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleHeroFile(f) }}
              />
            </label>
          </div>
        </div>

        {saveError && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {saveError instanceof Error ? saveError.message : 'Failed to save'}
          </div>
        )}

        <button
          onClick={handleSaveBranding}
          disabled={isSaving || logoUploading || heroUploading}
          className="btn self-start gap-2 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
        >
          {isSaving ? <span className="loading loading-spinner loading-sm" /> : saved ? 'Saved ✓' : 'Save Branding'}
        </button>
      </section>

      {/* Categories */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Categories</h2>

        <div className="flex flex-wrap gap-2">
          {(categories ?? []).map(c => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-sm text-white/70"
            >
              {c.name}
              <button
                onClick={() => deleteCategory(c.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
                aria-label={`Remove ${c.name}`}
              >
                ✕
              </button>
            </span>
          ))}
          {(categories ?? []).length === 0 && <p className="text-white/25 text-sm">No categories yet.</p>}
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="e.g. Shoes"
            className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-amber-500/60"
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim() || isCreatingCategory}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </section>

      {/* Products */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Sample Products</h2>
          <button
            onClick={openProductDialog}
            className="btn btn-xs gap-1.5 bg-white/4 border-white/8 text-white/60 hover:text-white"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Add Product
          </button>
        </div>

        {(productsPage?.items.length ?? 0) === 0 ? (
          <p className="text-white/25 text-sm py-6 text-center">No products yet — add a few to make the demo feel real.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {productsPage!.items.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                  {p.thumbnailUrl && <CImg src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-white/40 text-xs">{priceLabel(p.basePrice, p.salePrice)}</p>
                </div>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New product dialog */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Add Product</h3>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          </div>

          <form onSubmit={handleCreateProduct} className="p-6 flex flex-col gap-4">
            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="input input-sm w-full bg-white/4 border-white/10 focus:border-amber-500/60"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={e => setProductPrice(e.target.value)}
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-amber-500/60"
                  required
                />
              </div>
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productSalePrice}
                  onChange={e => setProductSalePrice(e.target.value)}
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-amber-500/60"
                />
              </div>
            </div>

            {(categories ?? []).length > 0 && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Category</label>
                <select
                  value={productCategoryId}
                  onChange={e => setProductCategoryId(e.target.value)}
                  className="select select-sm w-full bg-white/4 border-white/10 focus:border-amber-500/60"
                >
                  <option value="">None</option>
                  {categories!.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Photo</label>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
                  {productImageUploading ? (
                    <span className="loading loading-spinner loading-xs text-amber-400" />
                  ) : productImageUrl ? (
                    <CImg src={productImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/20 text-[9px]">None</span>
                  )}
                </div>
                <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleProductImageFile(f) }}
                  />
                </label>
              </div>
            </div>

            {createProductError && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {createProductError instanceof Error ? createProductError.message : 'Something went wrong'}
              </div>
            )}

            <button
              type="submit"
              disabled={!productName.trim() || !productPrice.trim() || isCreatingProduct || productImageUploading}
              className="btn btn-sm w-full bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
            >
              {isCreatingProduct ? <span className="loading loading-spinner loading-sm" /> : 'Add Product'}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Promote dialog */}
      <dialog ref={promoteDialogRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Promote to Customer</h3>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          </div>

          <form onSubmit={handlePromote} className="p-6 flex flex-col gap-4">
            <p className="text-white/50 text-sm leading-relaxed">
              This turns {merchant.name} into a real, live store with everything already built here.
              If you already have the customer&apos;s Clerk user ID, enter it below to hand them ownership
              immediately — otherwise leave it blank and reassign it later.
            </p>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Customer&apos;s Clerk User ID (optional)</label>
              <input
                type="text"
                value={promoteClerkUserId}
                onChange={e => setPromoteClerkUserId(e.target.value)}
                placeholder="user_..."
                className="input input-sm w-full bg-white/4 border-white/10 focus:border-emerald-500/60 font-mono"
              />
            </div>

            {promoteError && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {promoteError instanceof Error ? promoteError.message : 'Something went wrong'}
              </div>
            )}

            <button
              type="submit"
              disabled={isPromoting}
              className="btn btn-sm w-full bg-emerald-500/15 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40"
            >
              {isPromoting ? <span className="loading loading-spinner loading-sm" /> : 'Promote'}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  )
}
