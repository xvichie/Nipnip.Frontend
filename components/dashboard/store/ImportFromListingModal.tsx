'use client'

import { useEffect, useRef, useState } from 'react'
import { useMyProduct, useMyProducts } from '@/lib/queries/storefront-admin'
import type { ProductDetailResponse, ProductSummaryResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

export interface ImportFields {
  name: boolean
  description: boolean
  price: boolean
  categoryId: boolean
  options: boolean
  relatedProducts: boolean
}

const DEFAULT_FIELDS: ImportFields = {
  name: true,
  description: true,
  price: true,
  categoryId: true,
  options: true,
  relatedProducts: true,
}

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

function FieldCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <label className={`flex items-center gap-3 py-1.5 ${disabled ? 'opacity-30' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked && !disabled}
        onChange={onChange}
        disabled={disabled}
        className="checkbox checkbox-sm checkbox-secondary"
      />
      <span className="text-sm text-white/70">{label}</span>
    </label>
  )
}

// Lets a merchant pick one of their own OTHER products and copy specific fields (name,
// description, price, category, options/"variations", similar products) onto whatever
// listing they're currently creating or editing. Pure client-side data transform — the
// caller decides how to apply each field, since that differs between a not-yet-created
// product (local staged state) and an existing one (some fields are live-saved sub-resources).
export function ImportFromListingModal({
  excludeProductId,
  onImport,
}: {
  excludeProductId?: string
  onImport: (source: ProductDetailResponse, fields: ImportFields) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [fields, setFields] = useState<ImportFields>(DEFAULT_FIELDS)

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: searchResults } = useMyProducts({ search: search || undefined, pageSize: 8 })
  const candidates = (searchResults?.items ?? []).filter(p => p.id !== excludeProductId)

  const { data: picked, isLoading: pickedLoading } = useMyProduct(pickedId ?? '')

  function open() {
    setPickedId(null)
    setSearchInput('')
    setSearch('')
    setFields(DEFAULT_FIELDS)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  function handleImport() {
    if (!picked) return
    onImport(picked, fields)
    close()
  }

  function toggle(key: keyof ImportFields) {
    setFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="btn btn-sm gap-2 bg-white/4 border-white/10 text-white/60 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1.5v8M3.5 6l3.5 3.5L10.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 11.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        Import from another listing
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Import from another listing</h3>
            <button type="button" onClick={close} className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {!pickedId ? (
            <div className="p-6 flex flex-col gap-3">
              <input
                autoFocus
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search your products…"
                className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {candidates.length === 0 ? (
                  <p className="text-white/30 text-sm py-6 text-center">
                    {search ? 'No matches.' : 'Type to search your products.'}
                  </p>
                ) : (
                  candidates.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setPickedId(product.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                        {product.thumbnailUrl && (
                          <CImg src={product.thumbnailUrl} cldWidth={80} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{product.name}</p>
                      </div>
                      <span className="text-white/40 text-xs shrink-0">{priceLabel(product)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : pickedLoading || !picked ? (
            <div className="p-6">
              <div className="skeleton h-40 rounded-xl" />
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setPickedId(null)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white self-start"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {picked.name}
              </button>

              <div className="flex flex-col gap-1">
                <FieldCheckbox label="Name" checked={fields.name} onChange={() => toggle('name')} />
                <FieldCheckbox
                  label="Description"
                  checked={fields.description}
                  onChange={() => toggle('description')}
                  disabled={!picked.description}
                />
                <FieldCheckbox label="Price" checked={fields.price} onChange={() => toggle('price')} />
                <FieldCheckbox
                  label="Category"
                  checked={fields.categoryId}
                  onChange={() => toggle('categoryId')}
                  disabled={!picked.categoryId}
                />
                <FieldCheckbox
                  label={`Variations (${picked.options.length})`}
                  checked={fields.options}
                  onChange={() => toggle('options')}
                  disabled={picked.options.length === 0}
                />
                <FieldCheckbox
                  label={`Similar products (${picked.relatedProducts.length})`}
                  checked={fields.relatedProducts}
                  onChange={() => toggle('relatedProducts')}
                  disabled={picked.relatedProducts.length === 0}
                />
              </div>

              <button
                type="button"
                onClick={handleImport}
                className="btn btn-sm w-full bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white"
              >
                Import selected fields
              </button>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </>
  )
}
