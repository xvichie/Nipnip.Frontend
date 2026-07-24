'use client'

import { useEffect, useState } from 'react'
import { useMyProducts } from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { ReorderButtons } from '@/components/ui/ReorderButtons'
import { XIcon } from '@/components/ui/icons'
import type { ProductSummaryResponse } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

export function FeaturedProductsPicker({
  pickedIds,
  onChange,
  resolveMap,
}: {
  pickedIds: string[]
  onChange: (ids: string[]) => void
  resolveMap: Map<string, ProductSummaryResponse>
}) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: searchResults } = useMyProducts({ search: search || undefined, pageSize: 8 })
  const pickedSet = new Set(pickedIds)
  const candidates = (searchResults?.items ?? []).filter(p => !pickedSet.has(p.id))

  function addPick(id: string) {
    onChange([...pickedIds, id])
    setSearchInput('')
    setSearch('')
  }

  function removePick(id: string) {
    onChange(pickedIds.filter(x => x !== id))
  }

  function movePick(id: string, direction: -1 | 1) {
    const index = pickedIds.indexOf(id)
    const nextIndex = index + direction
    if (index === -1 || nextIndex < 0 || nextIndex >= pickedIds.length) return
    const next = [...pickedIds]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">გამორჩეული პროდუქტები</h2>
        <p className="text-white/30 text-xs mt-1">
          ხელით აირჩიეთ და დაალაგეთ, რომელი პროდუქტები გამოჩნდეს მთავარი გვერდის პროდუქტების ბადეში, იმის
          ნაცვლად, რომ ყოველთვის თქვენი უახლესი პროდუქტები ჩანდეს.
        </p>
      </div>

      {pickedIds.length > 0 ? (
        <div className="flex flex-col gap-2">
          {pickedIds.map((id, index) => {
            const product = resolveMap.get(id)
            return (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
                <ReorderButtons
                  disabledUp={index === 0}
                  disabledDown={index === pickedIds.length - 1}
                  onUp={() => movePick(id, -1)}
                  onDown={() => movePick(id, 1)}
                />
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                  {product?.thumbnailUrl && (
                    <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{product?.name ?? 'იტვირთება…'}</p>
                  {product && <p className="text-white/40 text-xs">{priceLabel(product)}</p>}
                </div>
                <IconButton icon={<XIcon />} label="წაშლა" onClick={() => removePick(id)} className="shrink-0" />
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-white/30 text-sm">პროდუქტები ჯერ არჩეული არ არის — ნაცვლად ამისა ნაჩვენებია თქვენი უახლესი პროდუქტები.</p>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="მოძებნეთ გამოსაჩენი პროდუქტები…"
          className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
        {search && candidates.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-2xl shadow-black/60 overflow-hidden">
            {candidates.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => addPick(product.id)}
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
