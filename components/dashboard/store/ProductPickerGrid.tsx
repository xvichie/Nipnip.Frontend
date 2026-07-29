'use client'

import { useEffect, useState } from 'react'
import { useMyProducts } from '@/lib/queries/storefront-admin'
import type { ProductSummaryResponse } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

const RECENT_COUNT = 10

// Shared "browse and add a product" widget for bundles/collections — a visual grid (thumbnail +
// name + price) instead of a name-only search dropdown, since picking the right product among
// several similar-looking ones is much easier to eyeball than to type. With no search text yet,
// it shows the merchant's most recently added products (the common case: you just made the
// product you're now bundling/collecting it with) rather than an empty state.
export function ProductPickerGrid({
  excludeIds,
  onPick,
}: {
  excludeIds: string[]
  onPick: (product: ProductSummaryResponse) => void
}) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const isSearching = search.trim().length > 0
  const { data, isLoading, isFetching } = useMyProducts(
    isSearching
      ? { search, pageSize: RECENT_COUNT }
      : { sortBy: 'createdAt', sortDir: 'desc', pageSize: RECENT_COUNT }
  )

  const excludeSet = new Set(excludeIds)
  const candidates = (data?.items ?? []).filter(p => !excludeSet.has(p.id))

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        placeholder="მოძებნეთ პროდუქტის სახელით…"
        className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
      />

      <p className="text-white/25 text-xs uppercase tracking-wider">
        {isSearching ? 'შედეგები' : 'ბოლოს დამატებული პროდუქტები'}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {Array.from({ length: RECENT_COUNT }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 transition-opacity ${isFetching ? 'opacity-50' : ''}`}>
          {candidates.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => onPick(product)}
              className="group flex flex-col gap-1.5 rounded-xl border border-white/8 bg-white/2 p-2 text-left hover:border-fuchsia-500/50 hover:bg-white/5 transition-colors"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/8">
                {product.thumbnailUrl ? (
                  <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/15 text-[10px]">არცერთი</div>
                )}
                <div className="absolute inset-0 bg-fuchsia-500/0 group-hover:bg-fuchsia-500/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-fuchsia-600 text-white w-6 h-6 flex items-center justify-center text-lg leading-none">
                    +
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/80 truncate leading-tight">{product.name}</p>
              <p className="text-white/40 text-[11px]">{priceLabel(product)}</p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm py-4 text-center">
          {isSearching ? 'პროდუქტი ვერ მოიძებნა.' : 'პროდუქტები ჯერ არ გაქვთ.'}
        </p>
      )}
    </div>
  )
}
