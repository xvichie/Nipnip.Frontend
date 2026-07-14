'use client'

import { useEffect, useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { parseThemeConfig } from '@/lib/store/theme-config'
import type { ShippingZone } from '@/lib/types/storefront'

export default function MerchantStoreDeliveryPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    setShippingZones(parsed.shippingZones)
    setFreeShippingThreshold(parsed.freeShippingThreshold)
  }, [store])

  function addZone() {
    setShippingZones(prev => [...prev, { id: crypto.randomUUID(), name: '', price: 0 }])
  }

  function updateZone(id: string, patch: Partial<ShippingZone>) {
    setShippingZones(prev => prev.map(z => (z.id === id ? { ...z, ...patch } : z)))
  }

  function removeZone(id: string) {
    setShippingZones(prev => prev.filter(z => z.id !== id))
  }

  function handleSave() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          shippingZones: shippingZones
            .filter(z => z.name.trim())
            .map(z => ({ ...z, name: z.name.trim(), price: Math.max(0, z.price) })),
          freeShippingThreshold: freeShippingThreshold != null && freeShippingThreshold > 0 ? freeShippingThreshold : null,
        }),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  if (isLoading || !store) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <>
    <div className="flex flex-col gap-8 max-w-2xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Delivery</h1>
        <p className="text-white/40 text-sm mt-1">Define where you deliver and how much you charge. Leave empty to skip shipping fees entirely.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Delivery areas</h2>
          <p className="text-white/40 text-xs mt-0.5">Buyers pick one of these at checkout.</p>
        </div>

        <div className="flex flex-col gap-2">
          {shippingZones.length === 0 ? (
            <p className="text-white/25 text-xs">No delivery areas yet — buyers won&apos;t be charged for shipping.</p>
          ) : (
            shippingZones.map(zone => (
              <div key={zone.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={zone.name}
                  onChange={e => updateZone(zone.id, { name: e.target.value })}
                  placeholder="e.g. Tbilisi"
                  className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
                <div className="relative shrink-0 w-32">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={zone.price}
                    onChange={e => updateZone(zone.id, { price: Math.max(0, Number(e.target.value)) })}
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">₾</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeZone(zone.id)}
                  aria-label="Remove delivery area"
                  className="btn btn-sm btn-square bg-white/4 border-white/8 text-white/40 hover:text-red-400 shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={addZone}
            className="btn btn-sm self-start gap-1.5 bg-white/4 border-white/8 text-white/60 hover:text-white"
          >
            + Add delivery area
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Free shipping</h2>
          <p className="text-white/40 text-xs mt-0.5">Waive the delivery fee once a buyer&apos;s order reaches this amount.</p>
        </div>
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Free shipping over</label>
          <div className="relative max-w-48">
            <input
              type="number"
              min="0"
              step="0.01"
              value={freeShippingThreshold ?? ''}
              onChange={e => setFreeShippingThreshold(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
              placeholder="No free shipping"
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">₾</span>
          </div>
          <p className="text-white/30 text-xs">Orders at or above this subtotal get free delivery, regardless of area. Leave empty to always charge the delivery fee.</p>
        </div>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 border-t border-white/10 bg-[#0b0b12]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {error && (
          <div className="flex-1 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            Failed to save changes.
          </div>
        )}
        {saved && (
          <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            Saved successfully
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 ${error || saved ? '' : 'w-full'}`}
        >
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
        </button>
      </div>
    </div>
    </>
  )
}
