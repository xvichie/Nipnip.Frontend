'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useMyCategories, useMyProduct, useUpdateProduct } from '@/lib/queries/storefront-admin'
import { ProductImagesManager } from '@/components/dashboard/store/ProductImagesManager'
import { ProductOptionsManager } from '@/components/dashboard/store/ProductOptionsManager'
import { ProductVariantsManager } from '@/components/dashboard/store/ProductVariantsManager'

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const { data: product, isLoading, isError } = useMyProduct(productId)
  const { data: categories } = useMyCategories()
  const { mutate: updateProduct, isPending, error } = useUpdateProduct(productId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!product) return
    setName(product.name)
    setDescription(product.description ?? '')
    setBasePrice(String(product.basePrice))
    setSalePrice(product.salePrice !== null ? String(product.salePrice) : '')
    setCategoryId(product.categoryId ?? '')
    setIsActive(product.isActive)
  }, [product])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(basePrice)
    const parsedSalePrice = parseFloat(salePrice)
    updateProduct(
      {
        name: name.trim() || null,
        description: description.trim() || null,
        basePrice: isNaN(price) ? null : price,
        salePrice: salePrice.trim() ? (isNaN(parsedSalePrice) ? null : parsedSalePrice) : null,
        categoryId: categoryId || null,
        isActive,
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
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
    <div className="flex flex-col gap-6 max-w-2xl">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/merchant/store/products" className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-tight">{product.name}</h1>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="toggle toggle-sm"
            />
            <span className="text-sm text-white/70">Visible in store</span>
          </label>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              Failed to save changes.
            </div>
          )}
          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              Saved successfully
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim() || !basePrice}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      <ProductImagesManager productId={productId} images={product.images} />
      <ProductOptionsManager productId={productId} options={product.options} />
      <ProductVariantsManager productId={productId} options={product.options} variants={product.variants} />

    </div>
  )
}
