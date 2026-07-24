'use client'

import { useState } from 'react'
import {
  useCreateDiscountCode,
  useDeleteDiscountCode,
  useMyDiscountCodes,
  useUpdateDiscountCode,
} from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { CheckIcon, EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import type { DiscountCodeType, StoreDiscountCodeResponse } from '@/lib/types/storefront'

const inputClass = 'input input-xs bg-neutral-900 border-white/10 focus:border-fuchsia-500/60'

function formatValue(type: DiscountCodeType, value: number) {
  return type === 'Percentage' ? `${value}%` : `₾${value.toFixed(2)}`
}

function DiscountCodeRow({ code }: { code: StoreDiscountCodeResponse }) {
  const { mutate: updateCode, isPending: isSaving, error: updateError } = useUpdateDiscountCode()
  const { mutate: deleteCode, isPending: isDeleting } = useDeleteDiscountCode()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    code: code.code,
    type: code.type,
    value: String(code.value),
    minOrderAmount: code.minOrderAmount != null ? String(code.minOrderAmount) : '',
    maxUses: code.maxUses != null ? String(code.maxUses) : '',
    expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : '',
  })

  function startEditing() {
    setForm({
      code: code.code,
      type: code.type,
      value: String(code.value),
      minOrderAmount: code.minOrderAmount != null ? String(code.minOrderAmount) : '',
      maxUses: code.maxUses != null ? String(code.maxUses) : '',
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : '',
    })
    setIsEditing(true)
  }

  function handleSave() {
    const trimmedCode = form.code.trim()
    const value = Number(form.value)
    if (!trimmedCode || !Number.isFinite(value) || value <= 0) return

    updateCode(
      {
        id: code.id,
        body: {
          code: trimmedCode,
          type: form.type,
          value,
          minOrderAmount: form.minOrderAmount.trim() ? Number(form.minOrderAmount) : null,
          maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          isActive: code.isActive,
        },
      },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  function toggleActive() {
    updateCode({
      id: code.id,
      body: {
        code: code.code,
        type: code.type,
        value: code.value,
        minOrderAmount: code.minOrderAmount,
        maxUses: code.maxUses,
        expiresAt: code.expiresAt,
        isActive: !code.isActive,
      },
    })
  }

  function handleDelete() {
    if (!confirm(`წავშალო კოდი "${code.code}"?`)) return
    deleteCode(code.id)
  }

  const isExpired = code.expiresAt != null && new Date(code.expiresAt) < new Date()
  const isExhausted = code.maxUses != null && code.usesCount >= code.maxUses

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-white/2 border border-fuchsia-500/30 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input
            autoFocus
            type="text"
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
            className={`${inputClass} col-span-2 sm:col-span-1`}
          />
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as DiscountCodeType }))}
            className={inputClass}
          >
            <option value="Percentage">პროცენტი</option>
            <option value="FixedAmount">ფიქსირებული თანხა</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
            placeholder={form.type === 'Percentage' ? '20' : '10.00'}
            className={inputClass}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount}
            onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
            placeholder="მინ. შეკვეთა (არასავალდებულო)"
            className={inputClass}
          />
          <input
            type="number"
            min="1"
            step="1"
            value={form.maxUses}
            onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
            placeholder="მაქს. გამოყენება (არასავალდებულო)"
            className={inputClass}
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
            className={inputClass}
          />
        </div>
        {updateError && <p className="text-error text-xs">კოდის შენახვა ვერ მოხერხდა.</p>}
        <div className="flex gap-1.5 pt-1">
          <IconButton
            icon={isSaving ? <span className="loading loading-spinner loading-xs" /> : <CheckIcon />}
            label="შენახვა"
            onClick={handleSave}
            disabled={isSaving}
            variant="accent"
          />
          <IconButton icon={<XIcon />} label="გაუქმება" onClick={() => setIsEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono font-semibold text-white">{code.code}</span>
          <span className="text-fuchsia-300 text-xs">{formatValue(code.type, code.value)} ფასდაკლება</span>
          {!code.isActive && <span className="badge badge-xs bg-white/10 border-none text-white/40">გამორთული</span>}
          {isExpired && <span className="badge badge-xs bg-red-500/15 border-none text-red-400">ვადაგასული</span>}
          {isExhausted && <span className="badge badge-xs bg-amber-500/15 border-none text-amber-400">ამოწურული</span>}
        </div>
        <div className="text-white/30 text-xs mt-0.5 flex gap-2 flex-wrap">
          <span>გამოყენებულია {code.usesCount}{code.maxUses != null ? ` / ${code.maxUses}` : ''} ჯერ</span>
          {code.minOrderAmount != null && <span>· მინ. შეკვეთა ₾{code.minOrderAmount.toFixed(2)}</span>}
          {code.expiresAt && <span>· ვადა {new Date(code.expiresAt).toLocaleDateString()}</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <input
          type="checkbox"
          checked={code.isActive}
          onChange={toggleActive}
          className={`toggle toggle-xs ${code.isActive ? 'toggle-success' : ''}`}
          title="აქტიური"
        />
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={startEditing} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function DiscountCodeManager() {
  const { data: codes, isLoading } = useMyDiscountCodes()
  const { mutate: createCode, isPending: isCreating, error: createError } = useCreateDiscountCode()

  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountCodeType>('Percentage')
  const [value, setValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim()
    const numericValue = Number(value)
    if (!trimmedCode || !Number.isFinite(numericValue) || numericValue <= 0) return

    createCode(
      {
        code: trimmedCode,
        type,
        value: numericValue,
        minOrderAmount: minOrderAmount.trim() ? Number(minOrderAmount) : null,
        maxUses: maxUses.trim() ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          setCode('')
          setValue('')
          setMinOrderAmount('')
          setMaxUses('')
          setExpiresAt('')
        },
      }
    )
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ფასდაკლების კოდები</h2>
        <p className="text-white/30 text-xs mt-1">
          შექმენით პრომო-კოდები, რომლებსაც მომხმარებლები გადახდისას შეიყვანენ — ცალკეა შემქმნელების აფილიატო კოდებისგან.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : codes && codes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {codes.map(c => (
            <DiscountCodeRow key={c.id} code={c} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ფასდაკლების კოდები ჯერ არ გაქვთ.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            className={`${inputClass} input-sm col-span-2 sm:col-span-1`}
            required
          />
          <select
            value={type}
            onChange={e => setType(e.target.value as DiscountCodeType)}
            className={`${inputClass} input-sm`}
          >
            <option value="Percentage">პროცენტი</option>
            <option value="FixedAmount">ფიქსირებული თანხა</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={type === 'Percentage' ? 'მაგ. 20' : 'მაგ. 10.00'}
            className={`${inputClass} input-sm`}
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={minOrderAmount}
            onChange={e => setMinOrderAmount(e.target.value)}
            placeholder="მინ. შეკვეთა (არასავალდებულო)"
            className={`${inputClass} input-sm`}
          />
          <input
            type="number"
            min="1"
            step="1"
            value={maxUses}
            onChange={e => setMaxUses(e.target.value)}
            placeholder="მაქს. გამოყენება (არასავალდებულო)"
            className={`${inputClass} input-sm`}
          />
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className={`${inputClass} input-sm`}
          />
        </div>
        {createError && <p className="text-error text-xs">კოდის შექმნა ვერ მოხერხდა — შეამოწმეთ, ხომ არ გამეორდა კოდი.</p>}
        <button
          type="submit"
          disabled={isCreating || !code.trim() || !value.trim()}
          className="btn btn-sm gap-1.5 self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isCreating ? <span className="loading loading-spinner loading-xs" /> : <><PlusIcon /> კოდის დამატება</>}
        </button>
      </form>
    </div>
  )
}
