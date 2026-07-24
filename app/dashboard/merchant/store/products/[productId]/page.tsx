'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useMyCategories, useMyCollections, useMyProduct, useRelatedProducts, useSetRelatedProducts, useUpdateProduct } from '@/lib/queries/storefront-admin'
import { ProductImagesManager } from '@/components/dashboard/store/ProductImagesManager'
import { ProductVideoManager } from '@/components/dashboard/store/ProductVideoManager'
import { ProductOptionsManager } from '@/components/dashboard/store/ProductOptionsManager'
import { ProductVariantsManager } from '@/components/dashboard/store/ProductVariantsManager'
import { RelatedProductsManager } from '@/components/dashboard/store/RelatedProductsManager'
import { ExportProductButton } from '@/components/dashboard/store/ExportProductButton'
import { ImportFromListingModal, type ImportFields } from '@/components/dashboard/store/ImportFromListingModal'
import { FloatingFormButton } from '@/components/dashboard/FloatingFormButton'
import type { ProductDetailResponse, ProductOptionResponse, ProductSummaryResponse } from '@/lib/types'

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { data: product, isLoading, isError } = useMyProduct(productId)
  const { data: categories } = useMyCategories()
  const { data: collections } = useMyCollections()
  const { mutateAsync: updateProduct, isPending, error } = useUpdateProduct(productId)
  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(productId)
  const { mutateAsync: setRelated, isPending: isSavingRelated } = useSetRelatedProducts(productId)
  const [importingOptions, setImportingOptions] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [relatedPicks, setRelatedPicks] = useState<ProductSummaryResponse[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  // "Adjust state during render" instead of an effect: these fields hydrate once per productId
  // from the fetched product. Keying off the id (not object reference) means a background
  // refetch of the SAME product — e.g. from window focus — never clobbers in-progress edits.
  const [prevProductId, setPrevProductId] = useState<string | null>(null)
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id)
    setName(product.name)
    setDescription(product.description ?? '')
    setBasePrice(String(product.basePrice))
    setSalePrice(product.salePrice !== null ? String(product.salePrice) : '')
    setCategoryId(product.categoryId ?? '')
    setCollectionIds(product.collectionIds)
    setIsActive(product.isActive)
  }

  function toggleCollection(id: string) {
    setCollectionIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const [prevRelatedId, setPrevRelatedId] = useState<string | null>(null)
  if (relatedProducts && productId !== prevRelatedId) {
    setPrevRelatedId(productId)
    setRelatedPicks(relatedProducts)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(basePrice)
    const parsedSalePrice = parseFloat(salePrice)
    try {
      await Promise.all([
        updateProduct({
          name: name.trim() || null,
          description: description.trim() || null,
          basePrice: isNaN(price) ? null : price,
          salePrice: salePrice.trim() ? (isNaN(parsedSalePrice) ? null : parsedSalePrice) : null,
          categoryId: categoryId || null,
          collectionIds,
          isActive,
        }),
        setRelated({ productIds: relatedPicks.map(p => p.id) }),
      ])
      showToast('success', 'Changes saved')
    } catch {
      showToast('error', 'Failed to save changes')
    }
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
        const existingIds = new Set([productId, ...prev.map(p => p.id)])
        return [...prev, ...source.relatedProducts.filter(p => !existingIds.has(p.id))]
      })
    }

    // Options are live sub-resources on the edit page (each already saves itself as it's
    // added), unlike the other fields above which just update local form state — so importing
    // them means replaying create-option/create-value calls against this product, then
    // refetching so ProductOptionsManager picks up the result. Adds alongside any existing
    // options rather than replacing them.
    if (fields.options && source.options.length > 0) {
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

    showToast('success', 'Imported — review below, then save')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-2xl">
        <div className="alert alert-error text-sm rounded-2xl">Product not found.</div>
      </div>
    )
  }

  return (
    <div ref={contentRef} className="flex flex-col gap-6 max-w-2xl pb-20">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/merchant/store/products" className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-tight flex-1">{product.name}</h1>
        <ImportFromListingModal excludeProductId={productId} onImport={handleImport} />
        <ExportProductButton productId={productId} />
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="fieldset gap-2">
            <label htmlFor="e-p-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Name <span className="text-error">*</span>
            </label>
            <input
              id="e-p-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="e-p-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="e-p-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="fieldset gap-2 flex-1">
              <label htmlFor="e-p-price" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Base Price <span className="text-error">*</span>
              </label>
              <input
                id="e-p-price"
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
              <label htmlFor="e-p-sale-price" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Sale Price
              </label>
              <input
                id="e-p-sale-price"
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="Optional"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>
          </div>

          {categories && categories.length > 0 && (
            <div className="fieldset gap-2">
              <label htmlFor="e-p-category" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Category
              </label>
              <select
                id="e-p-category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="select w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              >
                <option value="">Uncategorized</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          )}

          {collections && collections.length > 0 && (
            <div className="fieldset gap-2">
              <span className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Collections</span>
              <div className="flex flex-col gap-1.5">
                {collections.map(collection => (
                  <label
                    key={collection.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer"
                  >
                    <span className="text-sm text-white/70">{collection.name}</span>
                    <input
                      type="checkbox"
                      checked={collectionIds.includes(collection.id)}
                      onChange={() => toggleCollection(collection.id)}
                      className="toggle toggle-sm"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className={`toggle toggle-sm ${isActive ? 'toggle-success' : 'toggle-error'}`}
            />
            <span className="text-sm text-white/70">Visible in store</span>
          </label>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              Failed to save changes.
            </div>
          )}

        </form>
      </div>

      <FloatingFormButton anchorRef={contentRef} formId="product-form" disabled={isPending || isSavingRelated || importingOptions || !name.trim() || !basePrice}>
        {isPending || isSavingRelated ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
      </FloatingFormButton>

      <ProductImagesManager productId={productId} images={product.images} />
      <ProductVideoManager productId={productId} videoUrl={product.videoUrl} />
      <ProductOptionsManager productId={productId} options={product.options} />
      <ProductVariantsManager productId={productId} options={product.options} variants={product.variants} />
      <RelatedProductsManager productId={productId} picks={relatedPicks} onChange={setRelatedPicks} isLoading={relatedLoading} />

      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className={[
            'alert shadow-lg rounded-2xl text-sm gap-2 px-4 py-3',
            toast.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-error/15 border border-error/30 text-error',
          ].join(' ')}>
            {toast.type === 'success' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  )
}
