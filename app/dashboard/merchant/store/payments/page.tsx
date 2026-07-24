'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { useFlittStatus } from '@/lib/queries/flitt'
import { useTbcStatus } from '@/lib/queries/tbc'
import { useCityPayStatus } from '@/lib/queries/citypay'
import { SoonBadge } from '@/components/dashboard/store/SoonBadge'
import { BetaBadge } from '@/components/dashboard/store/BetaBadge'
import { parseThemeConfig } from '@/lib/store/theme-config'

export default function MerchantStorePaymentsPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const { data: flittStatus } = useFlittStatus()
  const flittConnected = flittStatus?.isConnected ?? false

  const { data: tbcStatus } = useTbcStatus()
  const tbcConnected = tbcStatus?.isConnected ?? false

  const { data: cityPayStatus } = useCityPayStatus()
  const cityPayConnected = cityPayStatus?.isConnected ?? false

  const [codEnabled, setCodEnabled] = useState(true)
  const [codNotes, setCodNotes] = useState('')
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true)
  const [bankTransferNotes, setBankTransferNotes] = useState('')
  const [flittEnabled, setFlittEnabled] = useState(false)
  const [tbcEnabled, setTbcEnabled] = useState(false)
  const [bogEnabled, setBogEnabled] = useState(false)
  const [cityPayEnabled, setCityPayEnabled] = useState(false)
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setCodEnabled(parsed.codEnabled)
    setCodNotes(parsed.codNotes)
    setBankTransferEnabled(parsed.bankTransferEnabled)
    setBankTransferNotes(parsed.bankTransferNotes)
    setFlittEnabled(parsed.flittEnabled)
    setTbcEnabled(parsed.tbcEnabled)
    setBogEnabled(parsed.bogEnabled)
    setCityPayEnabled(parsed.cityPayEnabled)
  }

  const enabledCount = [codEnabled, bankTransferEnabled, flittEnabled, tbcEnabled, bogEnabled, cityPayEnabled].filter(Boolean).length
  const isLastEnabled = enabledCount <= 1

  function handleSave() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          codEnabled,
          codNotes,
          bankTransferEnabled,
          bankTransferNotes,
          flittEnabled,
          tbcEnabled,
          bogEnabled,
          cityPayEnabled,
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
        <h1 className="text-2xl font-black tracking-tight">გადახდები</h1>
        <p className="text-white/40 text-sm mt-1">აირჩიეთ, რომელი გადახდის მეთოდები შეუძლიათ არჩიონ მყიდველებმა შეკვეთისას.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">გადახდა მიტანისას</h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი იხდის ნაღდი ფულით შეკვეთის მიღებისას.</p>
          </div>
          <input
            type="checkbox"
            checked={codEnabled}
            disabled={codEnabled && isLastEnabled}
            onChange={e => setCodEnabled(e.target.checked)}
            className={`toggle toggle-sm ${codEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {codEnabled && isLastEnabled && (
          <p className="text-white/30 text-xs -mt-2">მინიმუმ ერთი გადახდის მეთოდი უნდა დარჩეს ჩართული.</p>
        )}
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მყიდველისთვის ნაჩვენები შენიშვნა</label>
          <textarea
            value={codNotes}
            onChange={e => setCodNotes(e.target.value)}
            placeholder="მაგ. გთხოვთ, კურიერისთვის მოამზადოთ ზუსტი თანხა."
            rows={3}
            className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">საბანკო გადარიცხვა</h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი გადარიცხავს თანხას თქვენს საბანკო ანგარიშზე.</p>
          </div>
          <input
            type="checkbox"
            checked={bankTransferEnabled}
            disabled={bankTransferEnabled && isLastEnabled}
            onChange={e => setBankTransferEnabled(e.target.checked)}
            className={`toggle toggle-sm ${bankTransferEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {bankTransferEnabled && isLastEnabled && (
          <p className="text-white/30 text-xs -mt-2">მინიმუმ ერთი გადახდის მეთოდი უნდა დარჩეს ჩართული.</p>
        )}
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მყიდველისთვის ნაჩვენები შენიშვნა</label>
          <textarea
            value={bankTransferNotes}
            onChange={e => setBankTransferNotes(e.target.value)}
            placeholder="მაგ. ბანკი: TBC, ანგარიშის მფლობელი: თქვენი მაღაზია შპს, IBAN: GE00TB0000000000000000"
            rows={4}
            className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">ბარათით გადახდა (Flitt)</h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი იხდის ბარათით უსაფრთხო გადახდის გვერდზე.</p>
          </div>
          <input
            type="checkbox"
            checked={flittEnabled}
            disabled={!flittConnected || (flittEnabled && isLastEnabled)}
            onChange={e => setFlittEnabled(e.target.checked)}
            className={`toggle toggle-sm ${flittEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {flittEnabled && isLastEnabled && (
          <p className="text-white/30 text-xs -mt-2">მინიმუმ ერთი გადახდის მეთოდი უნდა დარჩეს ჩართული.</p>
        )}
        {!flittConnected && (
          <p className="text-white/30 text-xs -mt-2">
            დააკავშირეთ თქვენი Flitt ანგარიში{' '}
            <Link href="/dashboard/merchant/store/integrations" className="underline underline-offset-2 hover:text-white/60">
              ინტეგრაციებში
            </Link>{' '}
            ამის ჩასართავად.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">ბარათით გადახდა (TBC)</h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი იხდის ბარათით უსაფრთხო TBC-ის გადახდის გვერდზე.</p>
          </div>
          <input
            type="checkbox"
            checked={tbcEnabled}
            disabled={!tbcConnected || (tbcEnabled && isLastEnabled)}
            onChange={e => setTbcEnabled(e.target.checked)}
            className={`toggle toggle-sm ${tbcEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {tbcEnabled && isLastEnabled && (
          <p className="text-white/30 text-xs -mt-2">მინიმუმ ერთი გადახდის მეთოდი უნდა დარჩეს ჩართული.</p>
        )}
        {!tbcConnected && (
          <p className="text-white/30 text-xs -mt-2">
            დააკავშირეთ თქვენი TBC ანგარიში{' '}
            <Link href="/dashboard/merchant/store/integrations" className="underline underline-offset-2 hover:text-white/60">
              ინტეგრაციებში
            </Link>{' '}
            ამის ჩასართავად.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4 opacity-60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              ბარათით გადახდა (საქართველოს ბანკი)
              <SoonBadge />
            </h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი იხდის ბარათით უსაფრთხო BOG-ის გადახდის გვერდზე — მალე.</p>
          </div>
          <input type="checkbox" checked={false} disabled className="toggle toggle-sm toggle-error" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              გადახდა კრიპტოვალუტით (CityPay)
              <BetaBadge />
            </h2>
            <p className="text-white/40 text-xs mt-0.5">მყიდველი იხდის Bitcoin-ით ან სხვა კრიპტოვალუტით უსაფრთხო გადახდის გვერდზე.</p>
          </div>
          <input
            type="checkbox"
            checked={cityPayEnabled}
            disabled={!cityPayConnected || (cityPayEnabled && isLastEnabled)}
            onChange={e => setCityPayEnabled(e.target.checked)}
            className={`toggle toggle-sm ${cityPayEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {cityPayEnabled && isLastEnabled && (
          <p className="text-white/30 text-xs -mt-2">მინიმუმ ერთი გადახდის მეთოდი უნდა დარჩეს ჩართული.</p>
        )}
        {!cityPayConnected && (
          <p className="text-white/30 text-xs -mt-2">
            დააკავშირეთ თქვენი CityPay ანგარიში{' '}
            <Link href="/dashboard/merchant/store/integrations" className="underline underline-offset-2 hover:text-white/60">
              ინტეგრაციებში
            </Link>{' '}
            ამის ჩასართავად.
          </p>
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
