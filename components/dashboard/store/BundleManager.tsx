'use client'

import { useState } from 'react'
import { useCreateBundle, useDeleteBundle, useMyBundles, useUpdateBundle } from '@/lib/queries/storefront-admin'
import { TranslatedNameInput, hasAnyTranslatedName, type TranslatedNameValue } from './TranslatedNameInput'
import { ProductPickerGrid } from './ProductPickerGrid'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { uploadImage } from '@/lib/uploadImage'
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

function BundleModal({
  bundle,
  onClose,
}: {
  bundle?: ProductBundleResponse
  onClose: () => void
}) {
  const isEditing = !!bundle
  const { mutate: createBundle, isPending: isCreating, error: createError } = useCreateBundle()
  const { mutate: updateBundle, isPending: isSaving, error: updateError } = useUpdateBundle()

  const [names, setNames] = useState<TranslatedNameValue>(bundle ? namesOf(bundle) : { nameKa: '', nameEn: '', nameRu: '' })
  const [bundlePrice, setBundlePrice] = useState(bundle ? String(bundle.bundlePrice) : '')
  const [imageUrl, setImageUrl] = useState(bundle?.imageUrl ?? '')
  const [imageUploading, setImageUploading] = useState(false)
  const [items, setItems] = useState<DraftItem[]>(
    bundle ? bundle.items.map(i => ({ productId: i.productId, productName: i.productName, thumbnailUrl: i.imageUrl, price: i.productPrice, quantity: i.quantity })) : []
  )

  const isPending = isCreating || isSaving
  const error = createError ?? updateError
  const regularTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const price = Number(bundlePrice)
  const canSubmit = hasAnyTranslatedName(names) && Number.isFinite(price) && price > 0 && items.length > 0

  function addItem(product: ProductSummaryResponse) {
    setItems(prev => [...prev, { productId: product.id, productName: product.name, thumbnailUrl: product.thumbnailUrl, price: priceOf(product), quantity: 1 }])
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)))
  }

  async function handleImageFile(file: File) {
    setImageUploading(true)
    try {
      setImageUrl(await uploadImage(file))
    } finally {
      setImageUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const body = {
      nameKa: names.nameKa.trim() || null,
      nameEn: names.nameEn.trim() || null,
      nameRu: names.nameRu.trim() || null,
      bundlePrice: price,
      imageUrl: imageUrl || null,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) as BundleItemInput[],
    }
    if (isEditing) {
      updateBundle({ id: bundle.id, body }, { onSuccess: onClose })
    } else {
      createBundle(body, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{isEditing ? 'ბანდლის რედაქტირება' : 'ახალი ბანდლი'}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="დახურვა"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">სახელი</label>
              <TranslatedNameInput
                value={names}
                onChange={setNames}
                placeholder="მაგ. Starter Kit"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                autoFocus
              />
            </div>
            <div className="w-full sm:w-40 shrink-0">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">ბანდლის ფასი</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bundlePrice}
                  onChange={e => setBundlePrice(e.target.value)}
                  placeholder="0.00"
                  className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">₾</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">ყდის სურათი (სურვილისამებრ)</label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
                {imageUploading ? (
                  <span className="loading loading-spinner loading-sm text-fuchsia-400" />
                ) : imageUrl ? (
                  <CImg src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/20 text-[10px]">არცერთი</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer w-fit">
                  ატვირთვა
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageFile(f) }}
                  />
                </label>
                {imageUrl && (
                  <button type="button" onClick={() => setImageUrl('')} className="text-xs text-white/30 hover:text-red-400 text-left">
                    წაშლა
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                პროდუქტები ბანდლში {items.length > 0 && <span className="text-white/30 normal-case">({items.length})</span>}
              </label>
              {items.length > 0 && <p className="text-white/30 text-xs">ჩვეულებრივი ჯამი: ₾{regularTotal.toFixed(2)}</p>}
            </div>

            {items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 px-3 py-2.5">
                    <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                      {item.thumbnailUrl && <CImg src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                      <p className="text-white/40 text-xs">₾{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="რაოდენობის შემცირება"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/4 border border-white/8 text-white/60 hover:text-white disabled:opacity-30 text-base leading-none"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-white tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="რაოდენობის გაზრდა"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/4 border border-white/8 text-white/60 hover:text-white text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                    <IconButton icon={<XIcon />} label="ამოღება" onClick={() => removeItem(item.productId)} className="shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">დაამატეთ პროდუქტები ქვემოთ სიიდან.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">პროდუქტის დამატება</label>
            <ProductPickerGrid excludeIds={items.map(i => i.productId)} onPick={addItem} />
          </div>

          {error != null && <p className="text-error text-sm">ვერ შეინახა — გადაამოწმეთ ველები.</p>}
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="btn flex-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : isEditing ? 'შენახვა' : 'ბანდლის შექმნა'}
          </button>
          <button type="button" onClick={onClose} className="btn bg-white/4 border-white/8 text-white/60 hover:text-white">
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  )
}

function BundleRow({ bundle, onEdit }: { bundle: ProductBundleResponse; onEdit: () => void }) {
  const { mutate: updateBundle } = useUpdateBundle()
  const { mutate: deleteBundle, isPending: isDeleting } = useDeleteBundle()

  function handleDelete() {
    if (!confirm(`წავშალო ბანდლი "${bundle.name}"?`)) return
    deleteBundle(bundle.id)
  }

  function toggleActive() {
    updateBundle({ id: bundle.id, body: { isActive: !bundle.isActive } })
  }

  const savings = bundle.regularTotal - bundle.bundlePrice

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-3">
      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
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
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="checkbox"
          checked={bundle.isActive}
          onChange={toggleActive}
          className={`toggle toggle-sm ${bundle.isActive ? 'toggle-success' : ''}`}
          title="აქტიური"
        />
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={onEdit} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function BundleManager() {
  const { data: bundles, isLoading } = useMyBundles()
  const [modal, setModal] = useState<'create' | ProductBundleResponse | null>(null)

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ბანდლები</h2>
          <p className="text-white/30 text-xs mt-1">
            გაყიდეთ რამდენიმე პროდუქტი ერთად, ფიქსირებულ ერთობლივ ფასად (მაგ. &quot;Starter Kit&quot;).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal('create')}
          className="btn btn-sm gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white shrink-0"
        >
          <PlusIcon /> დამატება
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : bundles && bundles.length > 0 ? (
        <div className="flex flex-col gap-2">
          {bundles.map(bundle => (
            <BundleRow key={bundle.id} bundle={bundle} onEdit={() => setModal(bundle)} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ბანდლები ჯერ არ გაქვთ.</p>
      )}

      {modal && (
        <BundleModal
          bundle={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
