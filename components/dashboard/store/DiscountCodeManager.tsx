'use client'

import { useState } from 'react'
import {
  useCreateDiscountCode,
  useDeleteDiscountCode,
  useMyDiscountCodes,
  useUpdateDiscountCode,
} from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { useAnimatedModal } from '@/lib/useAnimatedModal'
import type { DiscountCodeType, StoreDiscountCodeResponse } from '@/lib/types/storefront'

function formatValue(type: DiscountCodeType, value: number) {
  return type === 'Percentage' ? `${value}%` : `₾${value.toFixed(2)}`
}

interface DiscountCodeForm {
  code: string
  type: DiscountCodeType
  value: string
  minOrderAmount: string
  maxUses: string
  expiresAt: string
  isActive: boolean
}

function formOf(code: StoreDiscountCodeResponse): DiscountCodeForm {
  return {
    code: code.code,
    type: code.type,
    value: String(code.value),
    minOrderAmount: code.minOrderAmount != null ? String(code.minOrderAmount) : '',
    maxUses: code.maxUses != null ? String(code.maxUses) : '',
    expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : '',
    isActive: code.isActive,
  }
}

const TYPE_OPTIONS: { value: DiscountCodeType; label: string }[] = [
  { value: 'Percentage', label: 'პროცენტი' },
  { value: 'FixedAmount', label: 'ფიქსირებული თანხა' },
]

function DiscountCodeModal({
  code: existingCode,
  onClose,
}: {
  code?: StoreDiscountCodeResponse
  onClose: () => void
}) {
  const isEditing = !!existingCode
  const { closing, close } = useAnimatedModal(onClose)
  const { mutate: createCode, isPending: isCreating, error: createError } = useCreateDiscountCode()
  const { mutate: updateCode, isPending: isSaving, error: updateError } = useUpdateDiscountCode()

  const [form, setForm] = useState<DiscountCodeForm>(
    existingCode ? formOf(existingCode) : { code: '', type: 'Percentage', value: '', minOrderAmount: '', maxUses: '', expiresAt: '', isActive: true }
  )

  const isPending = isCreating || isSaving
  const error = createError ?? updateError
  const numericValue = Number(form.value)
  const canSubmit = !!form.code.trim() && Number.isFinite(numericValue) && numericValue > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const body = {
      code: form.code.trim(),
      type: form.type,
      value: numericValue,
      minOrderAmount: form.minOrderAmount.trim() ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    }
    if (isEditing) {
      updateCode({ id: existingCode.id, body: { ...body, isActive: form.isActive } }, { onSuccess: close })
    } else {
      createCode(body, { onSuccess: close })
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={close} />
      <div className={`relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh] ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{isEditing ? 'კოდის რედაქტირება' : 'ახალი ფასდაკლების კოდი'}</h3>
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
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">კოდი</label>
            <input
              autoFocus
              type="text"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="SUMMER20"
              className="input w-full font-mono font-semibold tracking-wide bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              required
            />
            <p className="text-white/25 text-xs mt-1">მომხმარებელი ამ კოდს გადახდისას შეიყვანს.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">ტიპი</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                  className={[
                    'rounded-lg border px-3 py-2.5 text-sm font-medium text-center transition-colors',
                    form.type === opt.value
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                      : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">ოდენობა</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'Percentage' ? '20' : '10.00'}
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 pr-10"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
                {form.type === 'Percentage' ? '%' : '₾'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
                მინ. შეკვეთა <span className="text-white/25 normal-case">(არასავალდებულო)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                  placeholder="არ არის"
                  className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">₾</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
                მაქს. გამოყენება <span className="text-white/25 normal-case">(არასავალდებულო)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="ულიმიტო"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              ვადის გასვლა <span className="text-white/25 normal-case">(არასავალდებულო)</span>
            </label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            />
          </div>

          {isEditing && (
            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-3 cursor-pointer">
              <span className="text-sm text-white/70">აქტიურია</span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className={`toggle toggle-sm ${form.isActive ? 'toggle-success' : ''}`}
              />
            </label>
          )}

          {error != null && (
            <p className="text-error text-sm">
              ვერ შეინახა — შეამოწმეთ ველები{!isEditing && ', ხომ არ გამეორდა კოდი'}.
            </p>
          )}
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="btn flex-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : isEditing ? 'შენახვა' : 'კოდის შექმნა'}
          </button>
          <button type="button" onClick={close} className="btn bg-white/4 border-white/8 text-white/60 hover:text-white">
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  )
}

function DiscountCodeRow({ code, onEdit }: { code: StoreDiscountCodeResponse; onEdit: () => void }) {
  const { mutate: updateCode } = useUpdateDiscountCode()
  const { mutate: deleteCode, isPending: isDeleting } = useDeleteDiscountCode()

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

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-3">
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
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="checkbox"
          checked={code.isActive}
          onChange={toggleActive}
          className={`toggle toggle-sm ${code.isActive ? 'toggle-success' : ''}`}
          title="აქტიური"
        />
        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={onEdit} />
        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleDelete} disabled={isDeleting} variant="danger" />
      </div>
    </div>
  )
}

export function DiscountCodeManager() {
  const { data: codes, isLoading } = useMyDiscountCodes()
  const [modal, setModal] = useState<'create' | StoreDiscountCodeResponse | null>(null)

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ფასდაკლების კოდები</h2>
          <p className="text-white/30 text-xs mt-1">
            შექმენით პრომო-კოდები, რომლებსაც მომხმარებლები გადახდისას შეიყვანენ — ცალკეა შემქმნელების აფილიატო კოდებისგან.
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
      ) : codes && codes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {codes.map(c => (
            <DiscountCodeRow key={c.id} code={c} onEdit={() => setModal(c)} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">ფასდაკლების კოდები ჯერ არ გაქვთ.</p>
      )}

      {modal && (
        <DiscountCodeModal
          code={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
