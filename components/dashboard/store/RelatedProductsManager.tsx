'use client'

import { useEffect, useState } from 'react'
import { useMyProducts } from '@/lib/queries/storefront-admin'
import type { ProductSummaryResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

export function RelatedProductsManager({
  productId,
  picks,
  onChange,
  isLoading,
}: {
  productId: string
  picks: ProductSummaryResponse[]
  onChange: (picks: ProductSummaryResponse[]) => void
  isLoading: boolean
}) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: searchResults } = useMyProducts({ search: search || undefined, pageSize: 8 })
  const pickedIds = new Set(picks.map(p => p.id))
  const candidates = (searchResults?.items ?? []).filter(p => p.id !== productId && !pickedIds.has(p.id))

  function addPick(product: ProductSummaryResponse) {
    onChange([...picks, product])
    setSearchInput('')
    setSearch('')
  }

  function removePick(id: string) {
    onChange(picks.filter(p => p.id !== id))
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">მსგავსი პროდუქტები</h2>
        <p className="text-white/30 text-xs mt-1">
          ხელით აირჩიეთ, რომელი პროდუქტები გამოჩნდეს ამის ქვემოთ. ცარიელი დატოვების შემთხვევაში ავტომატურად
          შემოგთავაზებთ პროდუქტებს იმავე კატეგორიიდან და მსგავსი ფასის დიაპაზონიდან. არჩევანი ინახება
          გვერდის დანარჩენ ცვლილებებთან ერთად, „ცვლილებების შენახვის“ ღილაკით.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : picks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {picks.map(product => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                {product.thumbnailUrl && (
                  <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <p className="text-white/40 text-xs">{priceLabel(product)}</p>
              </div>
              <button
                type="button"
                onClick={() => removePick(product.id)}
                className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ხელით არჩეული ჯერ არაფერია — გამოიყენება ავტომატური რეკომენდაციები.</p>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="მოძებნეთ დასამატებელი პროდუქტები…"
          className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
        {search && candidates.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-2xl shadow-black/60 overflow-hidden">
            {candidates.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => addPick(product)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                  {product.thumbnailUrl && (
                    <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{product.name}</p>
                </div>
                <span className="text-white/40 text-xs shrink-0">{priceLabel(product)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
