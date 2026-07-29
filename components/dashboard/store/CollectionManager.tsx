'use client'

import { useState } from 'react'
import {
  useCollectionProducts,
  useCreateCollection,
  useDeleteCollection,
  useMyCollections,
  useSetCollectionProducts,
  useUpdateCollection,
} from '@/lib/queries/storefront-admin'
import { ProductPickerGrid } from './ProductPickerGrid'
import { TranslatedNameInput, hasAnyTranslatedName, type TranslatedNameValue } from './TranslatedNameInput'
import { IconButton } from '@/components/ui/IconButton'
import { ReorderButtons } from '@/components/ui/ReorderButtons'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { useAnimatedModal } from '@/lib/useAnimatedModal'
import type { CollectionResponse, ProductSummaryResponse } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function namesOf(collection: CollectionResponse): TranslatedNameValue {
  return { nameKa: collection.nameKa ?? '', nameEn: collection.nameEn ?? '', nameRu: collection.nameRu ?? '' }
}

function priceLabel(product: ProductSummaryResponse): string {
  return product.salePrice != null ? `${product.salePrice} ₾` : `${product.basePrice} ₾`
}

// Handles both "create a collection" and "edit a collection + manage its products" in one
// modal — creating first saves just the name (a collection needs to exist before products can
// be attached to it), then the exact same modal keeps itself open and reveals the product
// picker underneath, immediately, using the newly-created collection's id. No second trip
// through "close, click edit again" just to add products right after creating.
function CollectionModal({
  collection: initialCollection,
  onClose,
}: {
  collection?: CollectionResponse
  onClose: () => void
}) {
  const { closing, close } = useAnimatedModal(onClose)
  const { mutate: createCollection, isPending: isCreating, error: createError } = useCreateCollection()
  const { mutate: updateCollection, isPending: isSaving, error: updateError } = useUpdateCollection()

  const [collection, setCollection] = useState<CollectionResponse | undefined>(initialCollection)
  const [names, setNames] = useState<TranslatedNameValue>(initialCollection ? namesOf(initialCollection) : { nameKa: '', nameEn: '', nameRu: '' })

  const { data: initialProducts, isLoading: productsLoading } = useCollectionProducts(collection?.id ?? '')
  const { mutate: setProducts, isPending: isSavingProducts, error: productsError } = useSetCollectionProducts(collection?.id ?? '')

  const [picks, setPicks] = useState<ProductSummaryResponse[]>([])
  const [picksHydrated, setPicksHydrated] = useState(false)
  const [productsSaved, setProductsSaved] = useState(false)

  if (initialProducts && !picksHydrated) {
    setPicksHydrated(true)
    setPicks(initialProducts)
  }

  const isPendingName = isCreating || isSaving
  const nameError = createError ?? updateError

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!hasAnyTranslatedName(names)) return
    const body = {
      nameKa: names.nameKa.trim() || null,
      nameEn: names.nameEn.trim() || null,
      nameRu: names.nameRu.trim() || null,
    }
    if (collection) {
      updateCollection({ id: collection.id, body }, { onSuccess: updated => setCollection(updated) })
    } else {
      createCollection(body, { onSuccess: created => setCollection(created) })
    }
  }

  function addPick(product: ProductSummaryResponse) {
    setPicks(prev => [...prev, product])
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

  function handleSaveProducts() {
    setProducts(
      { productIds: picks.map(p => p.id) },
      { onSuccess: () => { setProductsSaved(true); setTimeout(() => setProductsSaved(false), 2000) } }
    )
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={close} />
      <div className={`relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh] ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{collection ? 'კოლექციის რედაქტირება' : 'ახალი კოლექცია'}</h3>
          <button
            type="button"
            onClick={close}
            aria-label="დახურვა"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-4 overflow-y-auto">
          <form onSubmit={handleSaveName} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">სახელი</label>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
              <TranslatedNameInput
                value={names}
                onChange={setNames}
                placeholder="მაგ. საზაფხულო კოლექცია"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                autoFocus={!collection}
              />
              <button
                type="submit"
                disabled={isPendingName || !hasAnyTranslatedName(names)}
                className="btn shrink-0 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
              >
                {isPendingName ? <span className="loading loading-spinner loading-sm" /> : collection ? 'სახელის შენახვა' : 'შექმნა და გაგრძელება'}
              </button>
            </div>
            {nameError != null && <p className="text-error text-sm">ვერ შეინახა — მიუთითეთ სახელი მინიმუმ ერთ ენაზე.</p>}
          </form>

          {collection ? (
            <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  პროდუქტები კოლექციაში {picks.length > 0 && <span className="text-white/30 normal-case">({picks.length})</span>}
                </label>
                <p className="text-white/25 text-xs">/{collection.slug}</p>
              </div>

              {productsLoading ? (
                <div className="skeleton h-16 rounded-xl" />
              ) : picks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {picks.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2.5">
                      <ReorderButtons
                        disabledUp={index === 0}
                        disabledDown={index === picks.length - 1}
                        onUp={() => movePick(product.id, -1)}
                        onDown={() => movePick(product.id, 1)}
                      />
                      <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0">
                        {product.thumbnailUrl && <CImg src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="text-white/40 text-xs">{priceLabel(product)}</p>
                      </div>
                      <IconButton icon={<XIcon />} label="ამოღება" onClick={() => removePick(product.id)} className="shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm">ამ კოლექციაში პროდუქტები ჯერ არ არის.</p>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">პროდუქტის დამატება</label>
                <ProductPickerGrid excludeIds={picks.map(p => p.id)} onPick={addPick} />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveProducts}
                  disabled={isSavingProducts}
                  className="btn btn-sm gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
                >
                  {isSavingProducts ? <span className="loading loading-spinner loading-xs" /> : 'პროდუქტების შენახვა'}
                </button>
                {productsSaved && <span className="text-emerald-400 text-xs">შენახულია</span>}
                {productsError && <span className="text-error text-xs">ვერ შეინახა</span>}
              </div>
            </div>
          ) : (
            <p className="text-white/25 text-sm pt-2 border-t border-white/5">
              შექმენით კოლექცია სახელით, რომ შემდეგ პროდუქტების დამატება შეძლოთ.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function CollectionRow({ collection, onEdit }: { collection: CollectionResponse; onEdit: () => void }) {
  const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection()

  function handleDelete() {
    if (!confirm(`წავშალო კოლექცია "${collection.name}"?`)) return
    deleteCollection(collection.id)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-3">
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-white">{collection.name}</span>
        <span className="text-white/25 text-xs ml-1.5">/{collection.slug}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={onEdit} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function CollectionManager() {
  const { data: collections, isLoading } = useMyCollections()
  const [modal, setModal] = useState<'create' | CollectionResponse | null>(null)

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">კოლექციები</h2>
          <p className="text-white/30 text-xs mt-1">
            დააჯგუფეთ პროდუქტები თემატურად (მაგ. &quot;საზაფხულო&quot;, &quot;ორიგინალი&quot;) — ერთი პროდუქტი შეიძლება რამდენიმე
            კოლექციაში იყოს ერთდროულად. თითოეული ჩანს მთავარ გვერდზე ცალკე გადასაფურცლავ სექციად.
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
      ) : collections && collections.length > 0 ? (
        <div className="flex flex-col gap-2">
          {collections.map(collection => (
            <CollectionRow key={collection.id} collection={collection} onEdit={() => setModal(collection)} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">კოლექციები ჯერ არ გაქვთ.</p>
      )}

      {modal && (
        <CollectionModal
          collection={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
