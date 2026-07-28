'use client'

import { useState } from 'react'
import {
  useCreateProductOption,
  useCreateProductOptionValue,
  useDeleteProductOption,
  useDeleteProductOptionValue,
  useUpdateProductOption,
  useUpdateProductOptionValue,
} from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { CheckIcon, EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import type { ProductOptionResponse, ProductOptionValueResponse } from '@/lib/types/storefront'
import { sortOptionValueObjects } from '@/lib/sortOptionValues'
import { TranslatedField, hasAnyTranslatedValue, type TranslatedFieldValue } from './TranslatedField'

const EMPTY_TRANSLATED: TranslatedFieldValue = { ka: '', en: '', ru: '' }
const NAME_PLACEHOLDERS = { ka: 'სახელი ქართულად (მაგ. ზომა)', en: 'Name in English (e.g. Size)', ru: 'Название на русском' }
const VALUE_PLACEHOLDERS = { ka: 'ქართულად', en: 'In English', ru: 'На русском' }

function namesOf(option: ProductOptionResponse): TranslatedFieldValue {
  return { ka: option.nameKa ?? '', en: option.nameEn ?? '', ru: option.nameRu ?? '' }
}

function valueNamesOf(value: ProductOptionValueResponse): TranslatedFieldValue {
  return { ka: value.valueKa ?? '', en: value.valueEn ?? '', ru: value.valueRu ?? '' }
}

function ValueChip({
  productId,
  optionId,
  value,
}: {
  productId: string
  optionId: string
  value: ProductOptionValueResponse
}) {
  const { mutate: updateValue, isPending } = useUpdateProductOptionValue(productId, optionId)
  const { mutate: deleteValue } = useDeleteProductOptionValue(productId, optionId)
  const [editing, setEditing] = useState(false)
  const [translations, setTranslations] = useState<TranslatedFieldValue>(() => valueNamesOf(value))
  const hasTranslations = !!(value.valueKa || value.valueEn || value.valueRu)

  function startEditing() {
    setTranslations(valueNamesOf(value))
    setEditing(true)
  }

  function handleSave() {
    updateValue(
      { valueId: value.id, body: { valueKa: translations.ka.trim() || null, valueEn: translations.en.trim() || null, valueRu: translations.ru.trim() || null } },
      { onSuccess: () => setEditing(false) }
    )
  }

  if (editing) {
    return (
      <div className="w-full rounded-lg border border-fuchsia-500/30 bg-white/2 px-3 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">{value.value}</span>
          <div className="flex gap-1">
            <IconButton
              icon={isPending ? <span className="loading loading-spinner loading-xs" /> : <CheckIcon />}
              label="შენახვა"
              onClick={handleSave}
              disabled={isPending}
              variant="accent"
            />
            <IconButton icon={<XIcon />} label="გაუქმება" onClick={() => setEditing(false)} />
          </div>
        </div>
        <TranslatedField
          value={translations}
          onChange={setTranslations}
          placeholders={VALUE_PLACEHOLDERS}
          className="input input-xs w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-xs text-white/70">
      <button type="button" onClick={startEditing} className="flex items-center gap-1 hover:text-white transition-colors" title="თარგმანის რედაქტირება">
        {value.value}
        <span className={`w-1.5 h-1.5 rounded-full ${hasTranslations ? 'bg-emerald-400' : 'bg-white/15'}`} />
      </button>
      <button
        type="button"
        onClick={() => deleteValue(value.id)}
        aria-label="წაშლა"
        data-tip="წაშლა"
        className="tooltip tooltip-top text-white/30 hover:text-red-400"
      >
        <XIcon className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

function OptionRow({ productId, option }: { productId: string; option: ProductOptionResponse }) {
  const { mutate: createValue, isPending } = useCreateProductOptionValue(productId, option.id)
  const { mutate: updateOption, isPending: isSavingName } = useUpdateProductOption(productId, option.id)
  const { mutate: deleteOption } = useDeleteProductOption(productId)
  const [value, setValue] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [names, setNames] = useState<TranslatedFieldValue>(() => namesOf(option))

  function handleAddValue(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    createValue({ value: value.trim() }, { onSuccess: () => setValue('') })
  }

  function startEditingName() {
    setNames(namesOf(option))
    setEditingName(true)
  }

  function handleSaveName() {
    if (!hasAnyTranslatedValue(names)) return
    updateOption(
      { nameKa: names.ka.trim() || null, nameEn: names.en.trim() || null, nameRu: names.ru.trim() || null },
      { onSuccess: () => setEditingName(false) }
    )
  }

  return (
    <div className="rounded-xl bg-white/2 border border-white/5 px-4 py-3 flex flex-col gap-2">
      {editingName ? (
        <div className="flex flex-col gap-2">
          <TranslatedField
            value={names}
            onChange={setNames}
            placeholders={NAME_PLACEHOLDERS}
            className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            autoFocus
          />
          {!hasAnyTranslatedValue(names) && (
            <p className="text-error text-xs">მიუთითეთ სახელი მინიმუმ ერთ ენაზე.</p>
          )}
          <div className="flex gap-1.5">
            <IconButton
              icon={isSavingName ? <span className="loading loading-spinner loading-xs" /> : <CheckIcon />}
              label="შენახვა"
              onClick={handleSaveName}
              disabled={isSavingName || !hasAnyTranslatedValue(names)}
              variant="accent"
            />
            <IconButton icon={<XIcon />} label="გაუქმება" onClick={() => setEditingName(false)} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{option.name}</span>
          <div className="flex gap-1">
            <IconButton icon={<EditIcon />} label="თარგმანის რედაქტირება" onClick={startEditingName} />
            <IconButton
              icon={<TrashIcon />}
              label="პარამეტრის წაშლა"
              onClick={() => { if (confirm(`წავშალო პარამეტრი „${option.name}“?`)) deleteOption(option.id) }}
              variant="danger"
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {sortOptionValueObjects(option.values).map(v => (
          <ValueChip key={v.id} productId={productId} optionId={option.id} value={v} />
        ))}
      </div>
      <form onSubmit={handleAddValue} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="ახალი მნიშვნელობა (მაგ. Large)"
          className="input input-xs flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <IconButton
          icon={<PlusIcon />}
          label="დამატება"
          type="submit"
          disabled={isPending || !value.trim()}
          variant="accent"
        />
      </form>
    </div>
  )
}

export function ProductOptionsManager({ productId, options }: { productId: string; options: ProductOptionResponse[] }) {
  const { mutate: createOption, isPending, error } = useCreateProductOption(productId)
  const [names, setNames] = useState<TranslatedFieldValue>(EMPTY_TRANSLATED)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasAnyTranslatedValue(names)) return
    createOption(
      { nameKa: names.ka.trim() || null, nameEn: names.en.trim() || null, nameRu: names.ru.trim() || null },
      { onSuccess: () => setNames(EMPTY_TRANSLATED) }
    )
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">პარამეტრები</h2>

      {options.length > 0 ? (
        <div className="flex flex-col gap-3">
          {options.map(option => (
            <OptionRow key={option.id} productId={productId} option={option} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">პარამეტრები ჯერ არ არის (მაგ. ზომა, ფერი).</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-start gap-3 pt-2 border-t border-white/5">
        <TranslatedField
          value={names}
          onChange={setNames}
          placeholders={NAME_PLACEHOLDERS}
          className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <button
          type="submit"
          disabled={isPending || !hasAnyTranslatedValue(names)}
          className="btn btn-sm gap-1.5 shrink-0 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 text-white disabled:opacity-40"
        >
          <PlusIcon /> დამატება
        </button>
      </form>
      {error && <p className="text-error text-xs">პარამეტრის შექმნა ვერ მოხერხდა.</p>}
    </div>
  )
}
