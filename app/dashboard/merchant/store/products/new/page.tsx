'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateProduct, useMyCategories } from '@/lib/queries/storefront-admin'

export default function NewProductPage() {
  const router = useRouter()
  const { data: categories } = useMyCategories()
  const { mutate: createProduct, isPending, error } = useCreateProduct()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [categoryId, setCategoryId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(basePrice)
    if (isNaN(price)) return

    const parsedSalePrice = parseFloat(salePrice)
    if (salePrice.trim() && isNaN(parsedSalePrice)) return

    createProduct(
      {
        name: name.trim(),
        description: description.trim() || null,
        basePrice: price,
        salePrice: salePrice.trim() ? parsedSalePrice : null,
        categoryId: categoryId || null,
      },
      { onSuccess: product => router.replace(`/dashboard/merchant/store/products/${product.id}`) }
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/merchant/store/products" className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-tight">New Product</h1>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="fieldset gap-2">
            <label htmlFor="p-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              Name <span className="text-error">*</span>
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
              Description
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
                Base Price <span className="text-error">*</span>
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
                Sale Price
              </label>
              <input
                id="p-sale-price"
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
              <label htmlFor="p-category" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Category
              </label>
              <select
                id="p-category"
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

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              Failed to create product.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim() || !basePrice}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Create Product'}
          </button>
        </form>
      </div>

    </div>
  )
}
