'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { useFlittStatus } from '@/lib/queries/flitt'
import { parseThemeConfig } from '@/lib/store/theme-config'

export default function MerchantStorePaymentsPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const { data: flittStatus } = useFlittStatus()
  const flittConnected = flittStatus?.isConnected ?? false

  const [codEnabled, setCodEnabled] = useState(true)
  const [codNotes, setCodNotes] = useState('')
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true)
  const [bankTransferNotes, setBankTransferNotes] = useState('')
  const [flittEnabled, setFlittEnabled] = useState(false)
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once from the
  // fetched store, which arrives async, so there's no lazy-initializer moment to hook into.
  const [prevStore, setPrevStore] = useState(store)
  if (store && store !== prevStore) {
    setPrevStore(store)
    const parsed = parseThemeConfig(store.themeConfig)
    setCodEnabled(parsed.codEnabled)
    setCodNotes(parsed.codNotes)
    setBankTransferEnabled(parsed.bankTransferEnabled)
    setBankTransferNotes(parsed.bankTransferNotes)
    setFlittEnabled(parsed.flittEnabled)
  }

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
        <h1 className="text-2xl font-black tracking-tight">Payments</h1>
        <p className="text-white/40 text-sm mt-1">Choose which payment methods buyers can pick at checkout.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Cash on delivery</h2>
            <p className="text-white/40 text-xs mt-0.5">Buyer pays in cash when the order arrives.</p>
          </div>
          <input
            type="checkbox"
            checked={codEnabled}
            disabled={codEnabled && !bankTransferEnabled && !flittEnabled}
            onChange={e => setCodEnabled(e.target.checked)}
            className={`toggle toggle-sm ${codEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {codEnabled && !bankTransferEnabled && !flittEnabled && (
          <p className="text-white/30 text-xs -mt-2">At least one payment method must stay enabled.</p>
        )}
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Notes shown to buyer</label>
          <textarea
            value={codNotes}
            onChange={e => setCodNotes(e.target.value)}
            placeholder="e.g. Please have the exact amount ready for the courier."
            rows={3}
            className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Bank transfer</h2>
            <p className="text-white/40 text-xs mt-0.5">Buyer transfers payment to your bank account.</p>
          </div>
          <input
            type="checkbox"
            checked={bankTransferEnabled}
            disabled={bankTransferEnabled && !codEnabled && !flittEnabled}
            onChange={e => setBankTransferEnabled(e.target.checked)}
            className={`toggle toggle-sm ${bankTransferEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {bankTransferEnabled && !codEnabled && !flittEnabled && (
          <p className="text-white/30 text-xs -mt-2">At least one payment method must stay enabled.</p>
        )}
        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Notes shown to buyer</label>
          <textarea
            value={bankTransferNotes}
            onChange={e => setBankTransferNotes(e.target.value)}
            placeholder="e.g. Bank: TBC, Account holder: Your Store LLC, IBAN: GE00TB0000000000000000"
            rows={4}
            className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Card payments (Flitt)</h2>
            <p className="text-white/40 text-xs mt-0.5">Buyer pays by card on a secure hosted checkout page.</p>
          </div>
          <input
            type="checkbox"
            checked={flittEnabled}
            disabled={!flittConnected || (flittEnabled && !codEnabled && !bankTransferEnabled)}
            onChange={e => setFlittEnabled(e.target.checked)}
            className={`toggle toggle-sm ${flittEnabled ? 'toggle-success' : 'toggle-error'}`}
          />
        </div>
        {flittEnabled && !codEnabled && !bankTransferEnabled && (
          <p className="text-white/30 text-xs -mt-2">At least one payment method must stay enabled.</p>
        )}
        {!flittConnected && (
          <p className="text-white/30 text-xs -mt-2">
            Connect your Flitt account under{' '}
            <Link href="/dashboard/merchant/store/integrations" className="underline underline-offset-2 hover:text-white/60">
              Integrations
            </Link>{' '}
            to enable this.
          </p>
        )}
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
