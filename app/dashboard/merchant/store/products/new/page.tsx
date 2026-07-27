'use client'

import { useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useCreateProduct, useMyCategories, useMyProduct, useRelatedProducts, useSetRelatedProducts, useUpdateProduct } from '@/lib/queries/storefront-admin'
import { apiFetch } from '@/lib/api'
import type { ProductDetailResponse, ProductOptionResponse, ProductSummaryResponse } from '@/lib/types/storefront'
import { PRODUCT_IMPORT_STORAGE_KEY, type ProductImportData } from '@/lib/productImport'
import { defaultOptionsToStaged } from '@/lib/store/category-default-options'
import { StagedImagesEditor } from '@/components/dashboard/store/StagedImagesEditor'
import { StagedVideoEditor } from '@/components/dashboard/store/StagedVideoEditor'
import { StagedOptionsEditor, type StagedOption } from '@/components/dashboard/store/StagedOptionsEditor'
import { ProductImagesManager } from '@/components/dashboard/store/ProductImagesManager'
import { ProductVideoManager } from '@/components/dashboard/store/ProductVideoManager'
import { ProductOptionsManager } from '@/components/dashboard/store/ProductOptionsManager'
import { ProductVariantsManager } from '@/components/dashboard/store/ProductVariantsManager'
import { RelatedProductsManager } from '@/components/dashboard/store/RelatedProductsManager'
import { ImportFromListingModal, type ImportFields } from '@/components/dashboard/store/ImportFromListingModal'
import { useFacebookPublish, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramPublish, useInstagramStatus } from '@/lib/queries/instagram'
import { useTikTokPublish, useTikTokStatus } from '@/lib/queries/tiktok'
import { FloatingFormButton } from '@/components/dashboard/FloatingFormButton'
import { BetaBadge } from '@/components/dashboard/store/BetaBadge'

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function NewProductPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { data: categories } = useMyCategories()
  const { mutate: createProduct, isPending: isCreating, error: createError } = useCreateProduct()

  const [productId, setProductId] = useState<string | null>(null)
  const { data: product } = useMyProduct(productId ?? '')
  const { mutate: updateProduct, isPending: isSaving, error: updateError } = useUpdateProduct(productId ?? '')
  const { data: serverRelatedProducts } = useRelatedProducts(productId ?? '')
  const { mutateAsync: setRelated } = useSetRelatedProducts(productId ?? '')

  // Read once on mount via lazy initializers — hydrating several fields from a single
  // parsed payload doesn't fit react-hooks/set-state-in-effect's "sync external system"
  // model, so each field seeds itself directly instead of an effect calling setState N times.
  const [importedData] = useState<ProductImportData | null>(() => {
    if (typeof window === 'undefined') return null
    const raw = sessionStorage.getItem(PRODUCT_IMPORT_STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PRODUCT_IMPORT_STORAGE_KEY)
    try {
      return JSON.parse(raw) as ProductImportData
    } catch {
      return null
    }
  })

  const [name, setName] = useState(() => importedData?.name ?? '')
  const [description, setDescription] = useState(() => importedData?.description ?? '')
  const [basePrice, setBasePrice] = useState(() => (importedData?.price != null ? String(importedData.price) : ''))
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState(() => importedData?.categoryId ?? '')
  const [isActive, setIsActive] = useState(true)
  const [stagedImages, setStagedImages] = useState<string[]>(() => importedData?.imageUrls ?? [])
  const [stagedVideoUrl, setStagedVideoUrl] = useState<string | null>(() => importedData?.videoUrl ?? null)
  const [stagedOptions, setStagedOptions] = useState<StagedOption[]>(() =>
    (importedData?.optionGroups ?? []).map(group => ({
      id: newId(),
      name: group.name,
      values: group.values.map(value => ({ id: newId(), value })),
    }))
  )
  const [relatedPicks, setRelatedPicks] = useState<ProductSummaryResponse[]>([])
  const [wasImported] = useState(() => importedData !== null)
  const [attaching, setAttaching] = useState(false)
  const [importingOptions, setImportingOptions] = useState(false)
  const [saved, setSaved] = useState(false)

  // Once the product exists, keep relatedPicks in sync with whatever's actually saved server-side
  // (only relevant if this page is revisited before creation "settles" — normal single-session
  // creation never has a mismatch here since relatedPicks is the source of truth pre-save).
  const [prevServerRelatedId, setPrevServerRelatedId] = useState<string | null>(null)
  if (serverRelatedProducts && productId && productId !== prevServerRelatedId) {
    setPrevServerRelatedId(productId)
    setRelatedPicks(serverRelatedProducts)
  }
  const [shareToFacebook, setShareToFacebook] = useState(false)
  const [shareToInstagram, setShareToInstagram] = useState(false)
  const [shareToTiktok, setShareToTiktok] = useState(false)
  const [tiktokHashtags, setTiktokHashtags] = useState('')

  const { data: fbStatus } = useFacebookStatus()
  const fbConnected = fbStatus?.connected ?? false
  const { mutate: publishToFacebook } = useFacebookPublish()

  const { data: igStatus } = useInstagramStatus()
  const igConnected = igStatus?.connected ?? false
  const { mutate: publishToInstagram } = useInstagramPublish()

  const { data: ttStatus } = useTikTokStatus()
  const ttConnected = ttStatus?.connected ?? false
  const { mutate: publishToTiktok } = useTikTokPublish()

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId)
    // Only pre-fill from the category's defaults when options are still empty — never clobber
    // options the merchant already imported or typed in themselves.
    if (stagedOptions.length > 0) return
    const category = categories?.find(c => c.id === nextCategoryId)
    if (!category) return
    const defaults = defaultOptionsToStaged(category.defaultOptions)
    if (defaults.length > 0) setStagedOptions(defaults)
  }

  async function handleImport(source: ProductDetailResponse, fields: ImportFields) {
    if (fields.name) setName(source.name)
    if (fields.description) setDescription(source.description ?? '')
    if (fields.price) {
      setBasePrice(String(source.basePrice))
      setSalePrice(source.salePrice !== null ? String(source.salePrice) : '')
    }
    if (fields.categoryId && source.categoryId) setCategoryId(source.categoryId)

    if (fields.relatedProducts && source.relatedProducts.length > 0) {
      setRelatedPicks(prev => {
        const existingIds = new Set([...(productId ? [productId] : []), ...prev.map(p => p.id)])
        return [...prev, ...source.relatedProducts.filter(p => !existingIds.has(p.id))]
      })
    }

    if (fields.options && source.options.length > 0) {
      const importedGroups: StagedOption[] = source.options.map(option => ({
        id: newId(),
        name: option.name,
        values: option.values.map(v => ({ id: newId(), value: v.value })),
      }))

      if (!isCreated) {
        // Not saved yet — options are still just local staged state, same as everything else here.
        setStagedOptions(prev => [...prev, ...importedGroups])
      } else {
        // Already saved — options are live sub-resources (each one saves itself as it's added),
        // so importing means replaying create-option/create-value calls, then refetching so
        // ProductOptionsManager picks up the result.
        setImportingOptions(true)
        const token = await getToken()
        for (const option of source.options) {
          try {
            const createdOption = await apiFetch<ProductOptionResponse>(`/api/products/${productId}/options`, token, {
              method: 'POST',
              body: JSON.stringify({ name: option.name }),
            })
            await Promise.allSettled(
              option.values.map(v =>
                apiFetch(`/api/products/${productId}/options/${createdOption.id}/values`, token, {
                  method: 'POST',
                  body: JSON.stringify({ value: v.value }),
                })
              )
            )
          } catch {
            // best effort — other option groups still get imported
          }
        }
        await queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] })
        setImportingOptions(false)
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(basePrice)
    if (isNaN(price)) return

    const parsedSalePrice = parseFloat(salePrice)
    if (salePrice.trim() && isNaN(parsedSalePrice)) return

    // A plain product with no options staged must have a stock count — there's no per-variant
    // stock to fall back on once it's created, unlike a product with real color/size options.
    const needsStock = !productId && stagedOptions.length === 0
    const parsedStock = parseInt(stock, 10)
    if (needsStock && (stock.trim() === '' || isNaN(parsedStock) || parsedStock < 0)) return

    // Product already exists — every later submit of this same form is a normal save.
    if (productId) {
      updateProduct(
        {
          name: name.trim() || null,
          description: description.trim() || null,
          basePrice: price,
          salePrice: salePrice.trim() ? parsedSalePrice : null,
          categoryId: categoryId || null,
          isActive,
        },
        { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
      )
      setRelated({ productIds: relatedPicks.map(p => p.id) }).catch(() => {})
      return
    }

    createProduct(
      {
        name: name.trim(),
        description: description.trim() || null,
        videoUrl: stagedVideoUrl,
        basePrice: price,
        salePrice: salePrice.trim() ? parsedSalePrice : null,
        categoryId: categoryId || null,
      },
      {
        onSuccess: async created => {
          let finalProduct: ProductDetailResponse = created

          if (stagedImages.length > 0 || stagedOptions.length > 0 || relatedPicks.length > 0 || needsStock) {
            setAttaching(true)
            const token = await getToken()

            if (needsStock) {
              try {
                await apiFetch(`/api/products/${created.id}/variants`, token, {
                  method: 'POST',
                  body: JSON.stringify({
                    sku: 'BASE',
                    price,
                    salePrice: salePrice.trim() ? parsedSalePrice : null,
                    stock: parsedStock,
                    optionValueIds: [],
                  }),
                })
              } catch {
                // product was created fine; stock can be set via the "მარაგი" field below
              }
            }

            if (relatedPicks.length > 0) {
              try {
                await apiFetch(`/api/products/${created.id}/related`, token, {
                  method: 'PUT',
                  body: JSON.stringify({ productIds: relatedPicks.map(p => p.id) }),
                })
              } catch {
                // product was created fine; similar products can be re-added manually below
              }
            }

            for (const url of stagedImages) {
              try {
                await apiFetch(`/api/products/${created.id}/images`, token, {
                  method: 'POST',
                  body: JSON.stringify({ url }),
                })
              } catch {
                // product was created fine; a failed image can be re-added manually below
              }
            }

            for (const option of stagedOptions) {
              try {
                const createdOption = await apiFetch<ProductOptionResponse>(`/api/products/${created.id}/options`, token, {
                  method: 'POST',
                  body: JSON.stringify({ name: option.name }),
                })
                await Promise.allSettled(
                  option.values.map(v =>
                    apiFetch(`/api/products/${created.id}/options/${createdOption.id}/values`, token, {
                      method: 'POST',
                      body: JSON.stringify({ value: v.value }),
                    })
                  )
                )
              } catch {
                // product was created fine; this option can be re-added manually below
              }
            }

            try {
              finalProduct = await apiFetch<ProductDetailResponse>(`/api/stores/me/products/${created.id}`, token)
            } catch {
              // keep the pre-attach snapshot; the managers below will pick up the rest on their own refetch
            }
            setAttaching(false)
          }

          if (shareToFacebook && fbConnected) {
            // Fire-and-forget — the product is already saved either way; if this fails,
            // the merchant can still use "Export" on the product page.
            publishToFacebook({ productId: created.id })
          }
          if (shareToInstagram && igConnected && stagedImages.length > 0) {
            publishToInstagram({ productId: created.id })
          }
          if (shareToTiktok && ttConnected && stagedImages.length > 0) {
            publishToTiktok({ productId: created.id, hashtags: tiktokHashtags.trim() || undefined })
          }

          // Seed the query cache before revealing the live managers below, so both this page
          // and the canonical edit route (after the URL swap) render instantly from cache —
          // no network round-trip, no loading flash.
          queryClient.setQueryData(['storefront-admin', 'product', created.id], finalProduct)
          setProductId(created.id)
          router.replace(`/dashboard/merchant/store/products/${created.id}`, { scroll: false })
        },
      }
    )
  }

  const isCreated = !!productId
  const busy = isCreating || isSaving || attaching || importingOptions
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={contentRef} className="flex flex-col gap-6 max-w-2xl pb-20">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/merchant/store/products" className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-tight flex-1">{product?.name || 'ახალი პროდუქტი'}</h1>
        <ImportFromListingModal excludeProductId={productId ?? undefined} onImport={handleImport} />
      </div>

      {wasImported && (
        <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 px-4 py-3">
          <p className="text-fuchsia-300 text-xs leading-relaxed">
            იმპორტირებულია — ქვემოთ ყველაფერი წინასწარ შევსებულია და რედაქტირებადია. გადაამოწმეთ და შემდეგ შეინახეთ.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="fieldset gap-2">
            <label htmlFor="p-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              სახელი <span className="text-error">*</span>
            </label>
            <input
              id="p-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="p-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              აღწერა
            </label>
            <textarea
              id="p-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="fieldset gap-2 flex-1">
              <label htmlFor="p-price" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                საბაზისო ფასი <span className="text-error">*</span>
              </label>
              <input
                id="p-price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                required
              />
            </div>

            <div className="fieldset gap-2 flex-1">
              <label htmlFor="p-sale-price" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                ფასდაკლებული ფასი
              </label>
              <input
                id="p-sale-price"
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="სურვილისამებრ"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>
          </div>

          {!isCreated && stagedOptions.length === 0 && (
            <div className="fieldset gap-2">
              <label htmlFor="p-stock" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                მარაგი <span className="text-error">*</span>
              </label>
              <input
                id="p-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                required
              />
              <p className="text-white/30 text-xs">რამდენი ცალი გაქვთ მარაგში ამ პროდუქტისთვის.</p>
            </div>
          )}

          {categories && categories.length > 0 && (
            <div className="fieldset gap-2">
              <label htmlFor="p-category" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                კატეგორია
              </label>
              <select
                id="p-category"
                value={categoryId}
                onChange={e => handleCategoryChange(e.target.value)}
                className="select w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              >
                <option value="">კატეგორიის გარეშე</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          )}

          {isCreated && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className={`toggle toggle-sm ${isActive ? 'toggle-success' : 'toggle-error'}`}
              />
              <span className="text-sm text-white/70">გამოჩენილია მაღაზიაში</span>
            </label>
          )}

          {(createError || updateError) && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {isCreated ? 'ცვლილებების შენახვა ვერ მოხერხდა.' : 'პროდუქტის შექმნა ვერ მოხერხდა.'}
            </div>
          )}
          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              წარმატებით შეინახა
            </div>
          )}

        </form>
      </div>

      <FloatingFormButton anchorRef={contentRef} formId="product-form" disabled={busy || !name.trim() || !basePrice || (!isCreated && stagedOptions.length === 0 && !stock.trim())}>
        {busy ? <span className="loading loading-spinner loading-sm" /> : isCreated ? 'ცვლილებების შენახვა' : 'პროდუქტის შექმნა'}
      </FloatingFormButton>

      {isCreated && product ? (
        <>
          <ProductImagesManager productId={productId} images={product.images} />
          <ProductVideoManager productId={productId} videoUrl={product.videoUrl} />
          <ProductOptionsManager productId={productId} options={product.options} />
          <ProductVariantsManager
            productId={productId}
            options={product.options}
            variants={product.variants}
            basePrice={product.basePrice}
            salePrice={product.salePrice}
          />
          <RelatedProductsManager productId={productId} picks={relatedPicks} onChange={setRelatedPicks} isLoading={false} />
        </>
      ) : isCreated ? (
        <div className="skeleton h-32 rounded-2xl" />
      ) : (
        <>
          <StagedImagesEditor images={stagedImages} onChange={setStagedImages} />
          <StagedVideoEditor videoUrl={stagedVideoUrl} onChange={setStagedVideoUrl} />
          <StagedOptionsEditor options={stagedOptions} onChange={setStagedOptions} />
          <RelatedProductsManager productId="" picks={relatedPicks} onChange={setRelatedPicks} isLoading={false} />
          {stagedOptions.length > 0 && (
            <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-2">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ვარიაციები</h2>
              <p className="text-white/30 text-sm">
                ზემოთ მითითებული ყველა კომბინაცია ნაგულისხმევად იყიდება საბაზისო ფასად და შეუზღუდავი მარაგით. შეინახეთ
                პროდუქტი კონკრეტული კომბინაციებისთვის ფასის ან მარაგის დასაყენებლად (მაგ. ზომა 43 = 5 ერთეული
                165 ლარად) — ვარიაციები ეყრდნობა რეალურ პარამეტრის მნიშვნელობებს, რომლებიც არსებობს მხოლოდ ამ პროდუქტის შენახვის შემდეგ.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ავტომატური გაზიარება</h2>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToFacebook}
                  onChange={e => setShareToFacebook(e.target.checked)}
                  disabled={!fbConnected}
                  className={`toggle toggle-sm ${shareToFacebook ? 'toggle-success' : 'toggle-error'} disabled:opacity-30`}
                />
                <span className="text-sm text-white/70">გაზიარება Facebook-ზე</span>
              </label>
              <p className="text-white/30 text-xs leading-relaxed">
                {fbConnected
                  ? 'ავტომატურად გამოაქვეყნებს ამ პროდუქტს თქვენს დაკავშირებულ Facebook გვერდზე, როგორც კი ქვემოთ შექმნით.'
                  : (
                    <>
                      დააკავშირეთ თქვენი Facebook გვერდი{' '}
                      <Link href="/dashboard/merchant/store/integrations" className="text-fuchsia-400 hover:text-fuchsia-300">
                        ინტეგრაციებში
                      </Link>{' '}
                      ამის ჩასართავად.
                    </>
                  )}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToInstagram}
                  onChange={e => setShareToInstagram(e.target.checked)}
                  disabled={!igConnected}
                  className={`toggle toggle-sm ${shareToInstagram ? 'toggle-success' : 'toggle-error'} disabled:opacity-30`}
                />
                <span className="text-sm text-white/70 flex items-center gap-2">
                  გაზიარება Instagram-ზე
                  <BetaBadge />
                </span>
              </label>
              <p className="text-white/30 text-xs leading-relaxed">
                {!igConnected ? (
                  <>
                    დააკავშირეთ Instagram{' '}
                    <Link href="/dashboard/merchant/store/integrations" className="text-fuchsia-400 hover:text-fuchsia-300">
                      ინტეგრაციებში
                    </Link>{' '}
                    ამის ჩასართავად.
                  </>
                ) : stagedImages.length === 0 ? (
                  'დაამატეთ მინიმუმ ერთი ფოტო ზემოთ — Instagram-ის პოსტს ესაჭიროება მინიმუმ ერთი.'
                ) : (
                  'ავტომატურად გამოაქვეყნებს ამ პროდუქტს თქვენს დაკავშირებულ Instagram ანგარიშზე, როგორც კი ქვემოთ შექმნით.'
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToTiktok}
                  onChange={e => setShareToTiktok(e.target.checked)}
                  disabled={!ttConnected}
                  className={`toggle toggle-sm ${shareToTiktok ? 'toggle-success' : 'toggle-error'} disabled:opacity-30`}
                />
                <span className="text-sm text-white/70 flex items-center gap-2">
                  გაზიარება TikTok-ზე
                  <BetaBadge />
                </span>
              </label>
              <p className="text-white/30 text-xs leading-relaxed">
                {!ttConnected ? (
                  <>
                    დააკავშირეთ TikTok{' '}
                    <Link href="/dashboard/merchant/store/integrations" className="text-fuchsia-400 hover:text-fuchsia-300">
                      ინტეგრაციებში
                    </Link>{' '}
                    ამის ჩასართავად.
                  </>
                ) : stagedImages.length === 0 ? (
                  'დაამატეთ მინიმუმ ერთი ფოტო ზემოთ — TikTok-ის პოსტს ესაჭიროება მინიმუმ ერთი.'
                ) : (
                  'ავტომატურად გამოაქვეყნებს ამ პროდუქტს თქვენს დაკავშირებულ TikTok ანგარიშზე, როგორც კი ქვემოთ შექმნით.'
                )}
              </p>

              {shareToTiktok && ttConnected && (
                <div className="fieldset gap-1.5 mt-1">
                  <label htmlFor="tiktok-hashtags" className="fieldset-legend text-white/50 text-xs uppercase tracking-wider">
                    ჰეშთეგები
                  </label>
                  <input
                    id="tiktok-hashtags"
                    type="text"
                    value={tiktokHashtags}
                    onChange={e => setTiktokHashtags(e.target.value)}
                    placeholder="#shoes #newarrival #georgia"
                    className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                  <p className="text-white/20 text-[11px]">დაემატება TikTok პოსტის აღწერის ბოლოში.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
