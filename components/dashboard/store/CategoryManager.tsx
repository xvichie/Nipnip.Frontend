'use client'

import { useState } from 'react'
import { useCreateCategory, useDeleteCategory, useMyCategories, useUpdateCategory } from '@/lib/queries/storefront-admin'
import { IconPicker, type IconValue } from './IconPicker'
import { StagedOptionsEditor, type StagedOption } from './StagedOptionsEditor'
import { TranslatedNameInput, hasAnyTranslatedName, type TranslatedNameValue } from './TranslatedNameInput'
import { defaultOptionsToStaged, stagedToDefaultOptionsJson } from '@/lib/store/category-default-options'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, SlidersIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { useAnimatedModal } from '@/lib/useAnimatedModal'
import type { CategoryResponse } from '@/lib/types/storefront'

function iconValueOf(category: CategoryResponse): IconValue {
  return { iconUrl: category.iconUrl, iconKey: category.iconKey, iconEmoji: category.iconEmoji }
}

function namesOf(category: CategoryResponse): TranslatedNameValue {
  return { nameKa: category.nameKa ?? '', nameEn: category.nameEn ?? '', nameRu: category.nameRu ?? '' }
}

function CategoryModal({
  category,
  categories,
  onClose,
}: {
  category?: CategoryResponse
  categories: CategoryResponse[]
  onClose: () => void
}) {
  const isEditing = !!category
  const { closing, close } = useAnimatedModal(onClose)
  const { mutate: createCategory, isPending: isCreating, error: createError } = useCreateCategory()
  const { mutate: updateCategory, isPending: isSaving, error: updateError } = useUpdateCategory()

  const [names, setNames] = useState<TranslatedNameValue>(category ? namesOf(category) : { nameKa: '', nameEn: '', nameRu: '' })
  const [parentCategoryId, setParentCategoryId] = useState(category?.parentCategoryId ?? '')
  const [icon, setIcon] = useState<IconValue>(category ? iconValueOf(category) : { iconUrl: null, iconKey: null, iconEmoji: null })
  const [staged, setStaged] = useState<StagedOption[]>(() => defaultOptionsToStaged(category?.defaultOptions))

  const isPending = isCreating || isSaving
  const error = createError ?? updateError
  const canSubmit = hasAnyTranslatedName(names)

  // Own category (can't be its own parent) and its direct children (would create a cycle) are excluded.
  const selectableParents = categories.filter(c => c.id !== category?.id && c.parentCategoryId !== category?.id)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const body = {
      nameKa: names.nameKa.trim() || null,
      nameEn: names.nameEn.trim() || null,
      nameRu: names.nameRu.trim() || null,
      parentCategoryId: parentCategoryId || null,
      ...icon,
      defaultOptions: stagedToDefaultOptionsJson(staged),
    }
    if (isEditing) {
      updateCategory({ id: category.id, body }, { onSuccess: close })
    } else {
      createCategory(body, { onSuccess: close })
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={close} />
      <div className={`relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh] ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{isEditing ? 'კატეგორიის რედაქტირება' : 'ახალი კატეგორია'}</h3>
          <button
            type="button"
            onClick={close}
            aria-label="დახურვა"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">აიქონი და სახელი</label>
            <div className="flex items-stretch gap-3">
              <IconPicker value={icon} onChange={setIcon} previewClassName="w-14 h-14" />
              <TranslatedNameInput
                value={names}
                onChange={setNames}
                placeholder="მაგ. ტანსაცმელი"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              მშობელი კატეგორია <span className="text-white/25 normal-case">(არასავალდებულო)</span>
            </label>
            <select
              value={parentCategoryId}
              onChange={e => setParentCategoryId(e.target.value)}
              className="select w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            >
              <option value="">მშობელი კატეგორია არ არის</option>
              {selectableParents.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              ნაგულისხმევი პარამეტრები <span className="text-white/25 normal-case">(არასავალდებულო)</span>
            </label>
            <p className="text-white/30 text-xs -mt-1">
              დაემატება ავტომატურად ახალ პროდუქტს ამ კატეგორიაში — ხელით მაინც შეიცვლება.
            </p>
            <StagedOptionsEditor options={staged} onChange={setStaged} />
          </div>

          {!hasAnyTranslatedName(names) && (
            <p className="text-error text-sm">მიუთითეთ სახელი მინიმუმ ერთ ენაზე.</p>
          )}
          {error != null && <p className="text-error text-sm">ვერ შეინახა — გადაამოწმეთ ველები.</p>}
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="btn flex-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : isEditing ? 'შენახვა' : 'კატეგორიის შექმნა'}
          </button>
          <button type="button" onClick={close} className="btn bg-white/4 border-white/8 text-white/60 hover:text-white">
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryIconField({ category }: { category: CategoryResponse }) {
  const { mutate: updateCategory } = useUpdateCategory()

  function handleChange(icon: IconValue) {
    updateCategory({
      id: category.id,
      body: { ...namesOf(category), parentCategoryId: category.parentCategoryId, ...icon },
    })
  }

  return <IconPicker value={iconValueOf(category)} onChange={handleChange} />
}

function CategoryRow({
  category,
  indent,
  onEdit,
}: {
  category: CategoryResponse
  indent: boolean
  onEdit: () => void
}) {
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  function handleDelete() {
    if (!confirm(`წავშალო კატეგორია "${category.name}"?`)) return
    deleteCategory(category.id)
  }

  const hasDefaultOptions = defaultOptionsToStaged(category.defaultOptions).length > 0

  return (
    <div className={['flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5', indent ? 'ml-6' : ''].join(' ')}>
      <div className="min-w-0 flex-1 flex items-center gap-3">
        <CategoryIconField category={category} />
        <div className="min-w-0">
          <span className="text-sm font-medium text-white">{category.name}</span>
          <span className="text-white/25 text-xs ml-1.5">/{category.slug}</span>
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {hasDefaultOptions && (
          <span title="ნაგულისხმევი პარამეტრები დაყენებულია" className="w-6 h-6 flex items-center justify-center text-fuchsia-400/70">
            <SlidersIcon />
          </span>
        )}
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={onEdit} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function CategoryManager() {
  const { data: categories, isLoading } = useMyCategories()
  const [modal, setModal] = useState<'create' | CategoryResponse | null>(null)

  const topLevel = categories?.filter(c => !c.parentCategoryId) ?? []
  const childrenOf = (id: string) => categories?.filter(c => c.parentCategoryId === id) ?? []

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">კატეგორიები</h2>
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
      ) : categories && categories.length > 0 ? (
        <div className="flex flex-col gap-2">
          {topLevel.map(category => (
            <div key={category.id} className="flex flex-col gap-2">
              <CategoryRow category={category} indent={false} onEdit={() => setModal(category)} />
              {childrenOf(category.id).map(child => (
                <CategoryRow key={child.id} category={child} indent onEdit={() => setModal(child)} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">კატეგორიები ჯერ არ გაქვთ.</p>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'create' ? undefined : modal}
          categories={categories ?? []}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
