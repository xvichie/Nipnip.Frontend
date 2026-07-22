'use client'

import { useState } from 'react'
import { useCreateCategory, useDeleteCategory, useMyCategories, useUpdateCategory } from '@/lib/queries/storefront-admin'
import { IconPicker, type IconValue } from './IconPicker'
import { StagedOptionsEditor, type StagedOption } from './StagedOptionsEditor'
import { defaultOptionsToStaged, stagedToDefaultOptionsJson } from '@/lib/store/category-default-options'
import type { CategoryResponse } from '@/lib/types/storefront'

function iconValueOf(category: CategoryResponse): IconValue {
  return { iconUrl: category.iconUrl, iconKey: category.iconKey, iconEmoji: category.iconEmoji }
}

function CategoryIconField({ category }: { category: CategoryResponse }) {
  const { mutate: updateCategory } = useUpdateCategory()

  function handleChange(icon: IconValue) {
    updateCategory({
      id: category.id,
      body: { name: category.name, parentCategoryId: category.parentCategoryId, ...icon },
    })
  }

  return <IconPicker value={iconValueOf(category)} onChange={handleChange} />
}

function CategoryDefaultOptionsPanel({ category }: { category: CategoryResponse }) {
  const { mutate: updateCategory, isPending, error } = useUpdateCategory()
  const [staged, setStaged] = useState<StagedOption[]>(() => defaultOptionsToStaged(category.defaultOptions))
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateCategory(
      { id: category.id, body: { name: category.name, parentCategoryId: category.parentCategoryId, defaultOptions: stagedToDefaultOptionsJson(staged) } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) } }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/30 text-xs">
        დაემატება ავტომატურად ახალ პროდუქტს ამ კატეგორიაში — ხელით მაინც შეიცვლება.
      </p>
      <StagedOptionsEditor options={staged} onChange={setStaged} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn btn-xs bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 text-white disabled:opacity-40"
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : 'ნაგულისხმევი პარამეტრების შენახვა'}
        </button>
        {saved && <span className="text-emerald-400 text-xs">შენახულია</span>}
        {error && <span className="text-error text-xs">ვერ შეინახა</span>}
      </div>
    </div>
  )
}

function CategoryRow({
  category,
  indent,
  allCategories,
}: {
  category: CategoryResponse
  indent: boolean
  allCategories: CategoryResponse[]
}) {
  const { mutate: updateCategory, isPending: isSaving } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const [isEditing, setIsEditing] = useState(false)
  const [showDefaultOptions, setShowDefaultOptions] = useState(false)
  const [name, setName] = useState(category.name)
  const [parentCategoryId, setParentCategoryId] = useState(category.parentCategoryId ?? '')
  const [icon, setIcon] = useState<IconValue>(iconValueOf(category))

  function startEditing() {
    setName(category.name)
    setParentCategoryId(category.parentCategoryId ?? '')
    setIcon(iconValueOf(category))
    setIsEditing(true)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    updateCategory(
      { id: category.id, body: { name: trimmed, parentCategoryId: parentCategoryId || null, ...icon } },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  function handleDelete() {
    if (!confirm(`წავშალო კატეგორია "${category.name}"?`)) return
    deleteCategory(category.id)
  }

  const selectableParents = allCategories.filter(c => c.id !== category.id && c.parentCategoryId !== category.id)

  if (isEditing) {
    return (
      <div
        className={[
          'flex flex-col gap-2 rounded-xl bg-white/2 border border-fuchsia-500/30 px-4 py-3',
          indent ? 'ml-6' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <IconPicker value={icon} onChange={setIcon} />
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-xs bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 flex-1"
          />
        </div>
        <select
          value={parentCategoryId}
          onChange={e => setParentCategoryId(e.target.value)}
          className="select select-xs bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        >
          <option value="">მშობელი კატეგორია არ არის</option>
          {selectableParents.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="btn btn-xs bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isSaving ? <span className="loading loading-spinner loading-xs" /> : 'შენახვა'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white"
          >
            გაუქმება
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={['flex flex-col gap-2', indent ? 'ml-6' : ''].join(' ')}>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <CategoryIconField category={category} />
          <div className="min-w-0">
            <span className="text-sm font-medium text-white">{category.name}</span>
            <span className="text-white/25 text-xs ml-1.5">/{category.slug}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDefaultOptions(v => !v)}
            className={[
              'btn btn-xs',
              showDefaultOptions
                ? 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300'
                : 'bg-white/4 border-white/10 text-white/60 hover:text-white',
            ].join(' ')}
          >
            ნაგულისხმევი პარამეტრები
          </button>
          <button
            type="button"
            onClick={startEditing}
            className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white"
          >
            რედაქტირება
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
          >
            წაშლა
          </button>
        </div>
      </div>
      {showDefaultOptions && <CategoryDefaultOptionsPanel category={category} />}
    </div>
  )
}

export function CategoryManager() {
  const { data: categories, isLoading } = useMyCategories()
  const { mutate: createCategory, isPending: isCreating, error: createError } = useCreateCategory()

  const [name, setName] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [icon, setIcon] = useState<IconValue>({ iconUrl: null, iconKey: null, iconEmoji: null })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createCategory(
      { name: name.trim(), parentCategoryId: parentCategoryId || null, ...icon },
      { onSuccess: () => { setName(''); setParentCategoryId(''); setIcon({ iconUrl: null, iconKey: null, iconEmoji: null }) } }
    )
  }

  const topLevel = categories?.filter(c => !c.parentCategoryId) ?? []
  const childrenOf = (id: string) => categories?.filter(c => c.parentCategoryId === id) ?? []

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">კატეგორიები</h2>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : categories && categories.length > 0 ? (
        <div className="flex flex-col gap-2">
          {topLevel.map(category => (
            <div key={category.id} className="flex flex-col gap-2">
              <CategoryRow category={category} indent={false} allCategories={categories} />
              {childrenOf(category.id).map(child => (
                <CategoryRow key={child.id} category={child} indent allCategories={categories} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">კატეგორიები ჯერ არ გაქვთ.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <IconPicker value={icon} onChange={setIcon} />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ახალი კატეგორიის სახელი"
            className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 flex-1"
            required
          />
        </div>
        {categories && categories.length > 0 && (
          <select
            value={parentCategoryId}
            onChange={e => setParentCategoryId(e.target.value)}
            className="select select-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
          >
            <option value="">მშობელი კატეგორია არ არის</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        )}
        {createError && <p className="text-error text-xs">კატეგორიის შექმნა ვერ მოხერხდა.</p>}
        <button
          type="submit"
          disabled={isCreating || !name.trim()}
          className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isCreating ? <span className="loading loading-spinner loading-xs" /> : 'კატეგორიის დამატება'}
        </button>
      </form>
    </div>
  )
}
