'use client'

import { useState } from 'react'
import { useCreateQuickShipperOrder, useQuickShipperCustomFields, useQuickShipperFees } from '@/lib/queries/quickshipper'
import type { QuickShipperFeeOptionResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

interface QuickShipperOrderModalProps {
  orderId: string
  onClose: () => void
}

// One provider can offer several speed tiers, each its own priceId — the fees list is
// flattened to one selectable row per (provider, priceId) combination.
export function QuickShipperOrderModal({ orderId, onClose }: QuickShipperOrderModalProps) {
  const { data: fees, isLoading: feesLoading, isError: feesError } = useQuickShipperFees(orderId, true)
  const { data: customFields, isLoading: fieldsLoading } = useQuickShipperCustomFields(true)
  const { mutate: createOrder, isPending: creating, error: createError } = useCreateQuickShipperOrder()

  // No selection made yet defaults to the first active option — derived directly from the
  // fees response rather than synced into state via an effect, so there's no render lag
  // between the data arriving and a sensible default being selected.
  const [manualSelection, setSelected] = useState<QuickShipperFeeOptionResponse | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<number, string>>({})

  const defaultSelection = fees && fees.options.length > 0 ? (fees.options.find(o => o.isActive) ?? fees.options[0]) : null
  const selected = manualSelection ?? defaultSelection

  const requiredFieldsMissing = (customFields ?? []).some(f => !f.isOptional && !fieldValues[f.id]?.trim())
  const canSubmit = !!selected && !requiredFieldsMissing && !creating

  function handleCreate() {
    if (!selected) return
    createOrder(
      {
        orderId,
        body: {
          providerId: selected.providerId,
          priceId: selected.priceId,
          customFieldValues: (customFields ?? [])
            .filter(f => fieldValues[f.id]?.trim())
            .map(f => ({ id: f.id, value: fieldValues[f.id].trim(), type: f.type })),
        },
      },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">QuickShipper-ით გაგზავნა</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white" aria-label="დახურვა">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {feesLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : feesError ? (
          <div className="alert alert-error text-sm rounded-xl">მიწოდების ფასების ჩატვირთვა ვერ მოხერხდა.</div>
        ) : !fees || fees.options.length === 0 ? (
          <p className="text-white/40 text-sm">ამ მისამართისთვის ხელმისაწვდომი პროვაიდერი ვერ მოიძებნა.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">მიწოდების პროვაიდერი</p>
            {fees.options.map(option => {
              const key = `${option.providerId}-${option.priceId ?? ''}`
              const isSelected = selected?.providerId === option.providerId && selected?.priceId === option.priceId
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!option.isActive}
                  onClick={() => setSelected(option)}
                  className={[
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-40',
                    isSelected ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-white/10 bg-white/2 hover:bg-white/4',
                  ].join(' ')}
                >
                  {option.providerLogoUrl && (
                    <CImg src={option.providerLogoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{option.providerName}</p>
                    {option.deliverySpeedName && <p className="text-white/30 text-xs">{option.deliverySpeedName}</p>}
                  </div>
                  <p className="text-fuchsia-300 font-semibold text-sm shrink-0 whitespace-nowrap">
                    {option.price.toFixed(2)} {option.currency}
                  </p>
                </button>
              )
            })}
            {fees.distance > 0 && <p className="text-white/20 text-xs">მანძილი: {fees.distance.toFixed(1)} კმ</p>}
          </div>
        )}

        {!fieldsLoading && customFields && customFields.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">დამატებითი ინფორმაცია</p>
            {customFields.map(field => (
              <div key={field.id} className="flex flex-col gap-1">
                <label className="text-xs text-white/40">
                  {field.name}{!field.isOptional && ' *'}
                </label>
                {field.listValues && field.listValues.length > 0 ? (
                  <select
                    value={fieldValues[field.id] ?? ''}
                    onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="select select-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                  >
                    <option value="">—</option>
                    {field.listValues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fieldValues[field.id] ?? ''}
                    onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder ?? undefined}
                    className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                )}
                {field.description && <p className="text-white/20 text-[11px]">{field.description}</p>}
              </div>
            ))}
          </div>
        )}

        {createError && <div className="alert alert-error text-sm rounded-xl">{createError.message}</div>}

        <div className="flex items-center gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn btn-sm bg-white/4 border-white/8 text-white/50 hover:text-white">
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit}
            className="btn btn-sm bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
          >
            {creating ? <span className="loading loading-spinner loading-xs" /> : 'შეკვეთის შექმნა'}
          </button>
        </div>
      </div>
    </div>
  )
}
