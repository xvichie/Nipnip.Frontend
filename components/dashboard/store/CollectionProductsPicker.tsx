'use client'

import { useEffect, useState } from 'react'
import { useCollectionProducts, useMyProducts, useSetCollectionProducts } from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { ReorderButtons } from '@/components/ui/ReorderButtons'
import { XIcon } from '@/components/ui/icons'
import type { ProductSummaryResponse } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

// Merchant's "add products individually" entry point onto a collection — this is the
// collection-side counterpart to the checkbox list on the product edit page.
export function CollectionProductsPicker({ collectionId }: { collectionId: string }) {
  const { data: initialProducts, isLoading } = useCollectionProducts(collectionId)
  const { mutate: setProducts, isPending, error } = useSetCollectionProducts(collectionId)

  const [picks, setPicks] = useState<ProductSummaryResponse[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  if (initialProducts && !hydrated) {
    setHydrated(true)
    setPicks(initialProducts)
  }

  const { data: searchResults } = useMyProducts({ search: search || undefined, pageSize: 8 })
  const pickedSet = new Set(picks.map(p => p.id))
  const candidates = (searchResults?.items ?? []).filter(p => !pickedSet.has(p.id))

  function addPick(product: ProductSummaryResponse) {
    setPicks(prev => [...prev, product])
    setSearchInput('')
    setSearch('')
  }

  function removePick(id: string) {
    setPicks(prev => prev.filter(p => p.id !== id))
  }

  function movePick(id: string, direction: -1 | 1) {
    setPicks(prev => {
      const index = prev.findIndex(p => p.id === id)
      const nextIndex = index + direction
      if (index === -1 || nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  function handleSave() {
    setProducts(
      { productIds: picks.map(p => p.id) },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) } }
    )
  }

  if (isLoading) {
    return <div className="skeleton h-24 rounded-xl" />
  }

  return (
    <div className="rounded-xl border border-white/7 bg-white/2 p-4 flex flex-col gap-4 ml-2">
      <p className="text-white/30 text-xs">
        დაამატეთ ან მოაწესრიგეთ პროდუქტები ამ კოლექციაში — ეს რიგი ჩანს მთავარ გვერდზე ჰორიზონტალურ სექციაში.
      </p>

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="მოძებნეთ დასამატებელი პროდუქტი…"
          className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
        {search && candidates.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-2xl shadow-black/60 overflow-hidden max-h-64 overflow-y-auto">
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

      {picks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {picks.map((product, index) => (
            <div key={product.id} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
              <ReorderButtons
                disabledUp={index === 0}
                disabledDown={index === picks.length - 1}
                onUp={() => movePick(product.id, -1)}
                onDown={() => movePick(product.id, 1)}
              />
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                {product.thumbnailUrl && (
                  <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <p className="text-white/40 text-xs">{priceLabel(product)}</p>
              </div>
              <IconButton icon={<XIcon />} label="წაშლა" onClick={() => removePick(product.id)} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ამ კოლექციაში პროდუქტები ჯერ არ არის.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn btn-xs self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : 'პროდუქტების შენახვა'}
        </button>
        {saved && <span className="text-emerald-400 text-xs">შენახულია</span>}
        {error && <span className="text-error text-xs">ვერ შეინახა</span>}
      </div>
    </div>
  )
}
