'use client'

import { useEffect, useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, parseThemeConfig } from '@/lib/store/theme-config'
import { TranslatedField } from '@/components/dashboard/store/TranslatedField'
import type { ShippingZone } from '@/lib/types/storefront'

export default function MerchantStoreDeliveryPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)
  const [pickupEnabled, setPickupEnabled] = useState(DEFAULT_THEME_CONFIG.pickupEnabled)
  const [pickupAddress, setPickupAddress] = useState(DEFAULT_THEME_CONFIG.pickupAddress)
  const [pickupInstructions, setPickupInstructions] = useState(DEFAULT_THEME_CONFIG.pickupInstructions)
  const [textTranslations, setTextTranslations] = useState(DEFAULT_THEME_CONFIG.translations)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    setShippingZones(parsed.shippingZones)
    setFreeShippingThreshold(parsed.freeShippingThreshold)
    setPickupEnabled(parsed.pickupEnabled)
    setPickupAddress(parsed.pickupAddress)
    setPickupInstructions(parsed.pickupInstructions)
    setTextTranslations(parsed.translations)
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
    // Merge with the freshest saved translations rather than overwriting wholesale — this page
    // only edits pickupInstructions; the rest (owned by other settings pages) must survive even
    // though this save resends the full ThemeConfig object.
    const mergedTranslations = {
      en: { ...parsed.translations.en, pickupInstructions: textTranslations.en?.pickupInstructions },
      ru: { ...parsed.translations.ru, pickupInstructions: textTranslations.ru?.pickupInstructions },
    }
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          translations: mergedTranslations,
          shippingZones: shippingZones
            .filter(z => z.name.trim())
            .map(z => ({ ...z, name: z.name.trim(), price: Math.max(0, z.price) })),
          freeShippingThreshold: freeShippingThreshold != null && freeShippingThreshold > 0 ? freeShippingThreshold : null,
          pickupEnabled,
          pickupAddress: pickupAddress.trim() || undefined,
          pickupInstructions: pickupInstructions.trim() || undefined,
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
        <h1 className="text-2xl font-black tracking-tight">მიწოდება</h1>
        <p className="text-white/40 text-sm mt-1">განსაზღვრეთ, სად ჩააბარებთ და რამდენს ჩამოართმევთ. ცარიელი დატოვების შემთხვევაში მიწოდების საფასური საერთოდ არ დაერიცხება.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">მიწოდების ზონები</h2>
          <p className="text-white/40 text-xs mt-0.5">მყიდველები ერთ-ერთს ირჩევენ შეკვეთისას.</p>
        </div>

        <div className="flex flex-col gap-2">
          {shippingZones.length === 0 ? (
            <p className="text-white/25 text-xs">მიწოდების ზონები ჯერ არ არის — მყიდველებს მიწოდების საფასური არ დაერიცხებათ.</p>
          ) : (
            shippingZones.map(zone => (
              <div key={zone.id} className="flex items-end gap-2">
                <TranslatedField
                  value={{ ka: zone.name, en: zone.translations?.en ?? '', ru: zone.translations?.ru ?? '' }}
                  onChange={value => updateZone(zone.id, {
                    name: value.ka,
                    translations: { en: value.en.trim() || undefined, ru: value.ru.trim() || undefined },
                  })}
                  placeholders={{ ka: 'მაგ. თბილისი', en: 'e.g. Tbilisi', ru: 'Например: Тбилиси' }}
                  className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
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
                  aria-label="მიწოდების ზონის წაშლა"
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
            + მიწოდების ზონის დამატება
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">უფასო მიწოდება</h2>
          <p className="text-white/40 text-xs mt-0.5">გააუქმეთ მიწოდების საფასური, როცა მყიდველის შეკვეთა ამ თანხას მიაღწევს.</p>
        </div>
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">უფასო მიწოდება ამ თანხაზე მეტისთვის</label>
          <div className="relative max-w-48">
            <input
              type="number"
              min="0"
              step="0.01"
              value={freeShippingThreshold ?? ''}
              onChange={e => setFreeShippingThreshold(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
              placeholder="უფასო მიწოდება არ არის"
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs pointer-events-none">₾</span>
          </div>
          <p className="text-white/30 text-xs">ამ ან მეტი ჯამის შეკვეთები იღებენ უფასო მიწოდებას, ზონის მიუხედავად. ცარიელი დატოვების შემთხვევაში მიწოდების საფასური ყოველთვის დაერიცხება.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">თვითგატანა</h2>
            <p className="text-white/30 text-xs mt-1">აძლევს მყიდველებს საშუალებას, პირადად წაიღონ შეკვეთა მიწოდების ნაცვლად, მიწოდების საფასურის გარეშე.</p>
          </div>
          <input
            type="checkbox"
            checked={pickupEnabled}
            onChange={e => setPickupEnabled(e.target.checked)}
            className={`toggle toggle-sm shrink-0 ${pickupEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </label>

        {pickupEnabled && (
          <>
            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">გატანის მისამართი</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                placeholder="ვაჟა-ფშაველას გამზ. 71, თბილისი"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>
            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">გატანის ინსტრუქციები (სურვილისამებრ)</label>
              <TranslatedField
                value={{ ka: pickupInstructions, en: textTranslations.en?.pickupInstructions ?? '', ru: textTranslations.ru?.pickupInstructions ?? '' }}
                onChange={v => {
                  setPickupInstructions(v.ka)
                  setTextTranslations(prev => ({
                    en: { ...prev.en, pickupInstructions: v.en.trim() || undefined },
                    ru: { ...prev.ru, pickupInstructions: v.ru.trim() || undefined },
                  }))
                }}
                multiline
                rows={2}
                placeholders={{
                  ka: 'ღიაა 10:00–19:00, დარეკეთ ზარით გვერდით კარზე',
                  en: 'Open 10am-7pm, ring the side-door bell',
                  ru: 'Открыто с 10:00 до 19:00, звоните в звонок у боковой двери',
                }}
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
            </div>
          </>
        )}
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 border-t border-white/10 bg-[#0b0b12]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {error && (
          <div className="flex-1 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ცვლილებების შენახვა ვერ მოხერხდა.
          </div>
        )}
        {saved && (
          <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            წარმატებით შეინახა
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 ${error || saved ? '' : 'w-full'}`}
        >
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'შენახვა'}
        </button>
      </div>
    </div>
    </>
  )
}
