'use client'

import { useEffect, useState } from 'react'
import { useCreateBundle, useDeleteBundle, useMyBundles, useMyProducts, useUpdateBundle } from '@/lib/queries/storefront-admin'
import { TranslatedNameInput, hasAnyTranslatedName, type TranslatedNameValue } from './TranslatedNameInput'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import type { BundleItemInput, ProductBundleResponse, ProductSummaryResponse } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function namesOf(bundle: ProductBundleResponse): TranslatedNameValue {
  return { nameKa: bundle.nameKa ?? '', nameEn: bundle.nameEn ?? '', nameRu: bundle.nameRu ?? '' }
}

interface DraftItem {
  productId: string
  productName: string
  thumbnailUrl: string | null
  price: number
  quantity: number
}

function priceOf(product: ProductSummaryResponse): number {
  return product.salePrice ?? product.basePrice
}

function BundleForm({
  initialNames = { nameKa: '', nameEn: '', nameRu: '' },
  initialBundlePrice = '',
  initialImageUrl = '',
  initialItems = [],
  onSubmit,
  isPending,
  error,
  submitLabel,
  onCancel,
}: {
  initialNames?: TranslatedNameValue
  initialBundlePrice?: string
  initialImageUrl?: string
  initialItems?: DraftItem[]
  onSubmit: (data: { names: TranslatedNameValue; bundlePrice: number; imageUrl: string; items: BundleItemInput[] }) => void
  isPending: boolean
  error: unknown
  submitLabel: string
  onCancel?: () => void
}) {
  const [names, setNames] = useState<TranslatedNameValue>(initialNames)
  const [bundlePrice, setBundlePrice] = useState(initialBundlePrice)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [items, setItems] = useState<DraftItem[]>(initialItems)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: searchResults } = useMyProducts({ search: search || undefined, pageSize: 8 })
  const pickedSet = new Set(items.map(i => i.productId))
  const candidates = (searchResults?.items ?? []).filter(p => !pickedSet.has(p.id))

  const regularTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  function addItem(product: ProductSummaryResponse) {
    setItems(prev => [...prev, { productId: product.id, productName: product.name, thumbnailUrl: product.thumbnailUrl, price: priceOf(product), quantity: 1 }])
    setSearchInput('')
    setSearch('')
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number(bundlePrice)
    if (!hasAnyTranslatedName(names) || !Number.isFinite(price) || price <= 0 || items.length === 0) return
    onSubmit({
      names,
      bundlePrice: price,
      imageUrl: imageUrl.trim(),
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
        <TranslatedNameInput value={names} onChange={setNames} placeholder="ბანდლის სახელი, მაგ. Starter Kit" />
        <input
          type="number"
          min="0"
          step="0.01"
          value={bundlePrice}
          onChange={e => setBundlePrice(e.target.value)}
          placeholder="ბანდლის ფასი"
          className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
          required
        />
      </div>
      <input
        type="text"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        placeholder="სურათის URL (არასავალდებულო)"
        className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
      />

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                {item.thumbnailUrl && <CImg src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                <p className="text-white/40 text-xs">₾{item.price.toFixed(2)}</p>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                className="input input-xs w-16 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 text-center"
              />
              <IconButton icon={<XIcon />} label="წაშლა" onClick={() => removeItem(item.productId)} className="shrink-0" />
            </div>
          ))}
          <p className="text-white/30 text-xs">ჩვეულებრივი ჯამი: ₾{regularTotal.toFixed(2)}</p>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="მოძებნეთ დასამატებელი პროდუქტი…"
          className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
        {search && candidates.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-2xl shadow-black/60 overflow-hidden">
            {candidates.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => addItem(product)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                  {product.thumbnailUrl && <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{product.name}</p>
                </div>
                <span className="text-white/40 text-xs shrink-0">₾{priceOf(product).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error != null && <p className="text-error text-xs">ვერ შეინახა — გადაამოწმეთ ველები.</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || !hasAnyTranslatedName(names) || !bundlePrice.trim() || items.length === 0}
          className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : submitLabel}
        </button>
        {onCancel && <IconButton icon={<XIcon />} label="გაუქმება" onClick={onCancel} size="sm" />}
      </div>
    </form>
  )
}

function BundleRow({ bundle }: { bundle: ProductBundleResponse }) {
  const { mutate: updateBundle, isPending: isSaving, error: updateError } = useUpdateBundle()
  const { mutate: deleteBundle, isPending: isDeleting } = useDeleteBundle()
  const [isEditing, setIsEditing] = useState(false)

  function handleDelete() {
    if (!confirm(`წავშალო ბანდლი "${bundle.name}"?`)) return
    deleteBundle(bundle.id)
  }

  function toggleActive() {
    updateBundle({ id: bundle.id, body: { isActive: !bundle.isActive } })
  }

  if (isEditing) {
    return (
      <div className="rounded-xl bg-white/2 border border-fuchsia-500/30 px-4 py-3">
        <BundleForm
          initialNames={namesOf(bundle)}
          initialBundlePrice={String(bundle.bundlePrice)}
          initialImageUrl={bundle.imageUrl ?? ''}
          initialItems={bundle.items.map(i => ({ productId: i.productId, productName: i.productName, thumbnailUrl: i.imageUrl, price: i.productPrice, quantity: i.quantity }))}
          submitLabel="შენახვა"
          isPending={isSaving}
          error={updateError}
          onCancel={() => setIsEditing(false)}
          onSubmit={data =>
            updateBundle(
              {
                id: bundle.id,
                body: {
                  nameKa: data.names.nameKa.trim() || null,
                  nameEn: data.names.nameEn.trim() || null,
                  nameRu: data.names.nameRu.trim() || null,
                  bundlePrice: data.bundlePrice,
                  imageUrl: data.imageUrl || null,
                  items: data.items,
                },
              },
              { onSuccess: () => setIsEditing(false) }
            )
          }
        />
      </div>
    )
  }

  const savings = bundle.regularTotal - bundle.bundlePrice

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
        {bundle.imageUrl && <CImg src={bundle.imageUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{bundle.name}</span>
          <span className="text-white/25 text-xs">/{bundle.slug}</span>
          {!bundle.isActive && <span className="badge badge-xs bg-white/10 border-none text-white/40">გამორთული</span>}
        </div>
        <p className="text-white/30 text-xs mt-0.5">
          ₾{bundle.bundlePrice.toFixed(2)}{savings > 0 && <span className="text-emerald-400"> · დაზოგვა ₾{savings.toFixed(2)}</span>} · {bundle.items.length} პროდუქტი
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <input
          type="checkbox"
          checked={bundle.isActive}
          onChange={toggleActive}
          className={`toggle toggle-xs ${bundle.isActive ? 'toggle-success' : ''}`}
          title="აქტიური"
        />
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={() => setIsEditing(true)} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function BundleManager() {
  const { data: bundles, isLoading } = useMyBundles()
  const { mutate: createBundle, isPending: isCreating, error: createError } = useCreateBundle()
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ბანდლები</h2>
        <p className="text-white/30 text-xs mt-1">
          გაყიდეთ რამდენიმე პროდუქტი ერთად, ფიქსირებულ ერთობლივ ფასად (მაგ. &quot;Starter Kit&quot;).
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : bundles && bundles.length > 0 ? (
        <div className="flex flex-col gap-2">
          {bundles.map(bundle => (
            <BundleRow key={bundle.id} bundle={bundle} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ბანდლები ჯერ არ გაქვთ.</p>
      )}

      {showCreateForm ? (
        <div className="pt-2 border-t border-white/5">
          <BundleForm
            submitLabel="ბანდლის შექმნა"
            isPending={isCreating}
            error={createError}
            onCancel={() => setShowCreateForm(false)}
            onSubmit={data =>
              createBundle(
                {
                  nameKa: data.names.nameKa.trim() || null,
                  nameEn: data.names.nameEn.trim() || null,
                  nameRu: data.names.nameRu.trim() || null,
                  bundlePrice: data.bundlePrice,
                  imageUrl: data.imageUrl || null,
                  items: data.items,
                },
                { onSuccess: () => setShowCreateForm(false) }
              )
            }
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="btn btn-sm gap-1.5 self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white"
        >
          <PlusIcon /> ბანდლის დამატება
        </button>
      )}
    </div>
  )
}
