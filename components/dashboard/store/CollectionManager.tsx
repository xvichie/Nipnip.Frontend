'use client'

import { useState } from 'react'
import { useCreateCollection, useDeleteCollection, useMyCollections, useUpdateCollection } from '@/lib/queries/storefront-admin'
import { CollectionProductsPicker } from './CollectionProductsPicker'
import { IconButton } from '@/components/ui/IconButton'
import { CheckIcon, EditIcon, GridIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import type { CollectionResponse } from '@/lib/types/storefront'

function CollectionRow({ collection }: { collection: CollectionResponse }) {
  const { mutate: updateCollection, isPending: isSaving } = useUpdateCollection()
  const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection()

  const [isEditing, setIsEditing] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [name, setName] = useState(collection.name)

  function startEditing() {
    setName(collection.name)
    setIsEditing(true)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    updateCollection(
      { id: collection.id, body: { name: trimmed } },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  function handleDelete() {
    if (!confirm(`წავშალო კოლექცია "${collection.name}"?`)) return
    deleteCollection(collection.id)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white/2 border border-fuchsia-500/30 px-4 py-2.5">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } if (e.key === 'Escape') setIsEditing(false) }}
          className="input input-xs bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 flex-1"
        />
        <div className="flex gap-1.5 shrink-0">
          <IconButton
            icon={isSaving ? <span className="loading loading-spinner loading-xs" /> : <CheckIcon />}
            label="შენახვა"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            variant="accent"
          />
          <IconButton icon={<XIcon />} label="გაუქმება" onClick={() => setIsEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-white">{collection.name}</span>
          <span className="text-white/25 text-xs ml-1.5">/{collection.slug}</span>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <IconButton
            icon={<GridIcon />}
            label="პროდუქტების მართვა"
            onClick={() => setShowProducts(v => !v)}
            active={showProducts}
          />
          <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={startEditing} />
          <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
        </div>
      </div>
      {showProducts && <CollectionProductsPicker collectionId={collection.id} />}
    </div>
  )
}

export function CollectionManager() {
  const { data: collections, isLoading } = useMyCollections()
  const { mutate: createCollection, isPending: isCreating, error: createError } = useCreateCollection()

  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createCollection({ name: name.trim() }, { onSuccess: () => setName('') })
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">კოლექციები</h2>
        <p className="text-white/30 text-xs mt-1">
          დააჯგუფეთ პროდუქტები თემატურად (მაგ. &quot;საზაფხულო&quot;, &quot;ორიგინალი&quot;) — ერთი პროდუქტი შეიძლება რამდენიმე
          კოლექციაში იყოს ერთდროულად. თითოეული ჩანს მთავარ გვერდზე ცალკე გადასაფურცლავ სექციად.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : collections && collections.length > 0 ? (
        <div className="flex flex-col gap-2">
          {collections.map(collection => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">კოლექციები ჯერ არ გაქვთ.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ახალი კოლექციის სახელი"
            className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 flex-1"
            required
          />
          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="btn btn-sm gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 shrink-0"
          >
            {isCreating ? <span className="loading loading-spinner loading-xs" /> : <><PlusIcon /> დამატება</>}
          </button>
        </div>
        {createError && <p className="text-error text-xs">კოლექციის შექმნა ვერ მოხერხდა.</p>}
      </form>
    </div>
  )
}
