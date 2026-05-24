'use client'

import { useEffect, useRef, useState } from 'react'
import { useReportManualSale } from '@/lib/queries/conversions'
import { useLanguage } from '@/lib/i18n'

const CURRENCIES = ['GEL', 'USD', 'EUR']

export default function ReportSalePage() {
  const [creatorSlug, setCreatorSlug] = useState('')
  const [orderAmount, setOrderAmount] = useState('')
  const [orderId, setOrderId] = useState('')
  const [currency, setCurrency] = useState('GEL')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useLanguage()

  const { mutate, isPending, error } = useReportManualSale()

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(orderAmount)
    if (isNaN(amount) || amount <= 0) return

    mutate(
      {
        creatorSlug: creatorSlug.trim().replace(/^@/, ''),
        orderAmount: amount,
        orderId: orderId.trim() || null,
        currency,
      },
      {
        onSuccess: () => {
          showToast('success', `${t.reportSale.success} @${creatorSlug.trim()}`)
          setCreatorSlug('')
          setOrderAmount('')
          setOrderId('')
          setCurrency('GEL')
        },
        onError: () => {
          showToast('error', t.reportSale.error)
        },
      }
    )
  }

  const amountNum = parseFloat(orderAmount)
  const canSubmit = creatorSlug.trim().length > 0 && !isNaN(amountNum) && amountNum > 0 && !isPending

  return (
    <div className="flex flex-col gap-8 max-w-lg">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.reportSale.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.reportSale.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="fieldset gap-2">
            <label htmlFor="creator-slug" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.reportSale.creatorLabel} <span className="text-error">*</span>
            </label>
            <div className="flex">
              <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                @
              </span>
              <input
                id="creator-slug"
                type="text"
                value={creatorSlug}
                onChange={e => setCreatorSlug(e.target.value.replace(/^@/, ''))}
                className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-fuchsia-500/60 min-w-0"
                placeholder={t.reportSale.creatorPlaceholder}
                required
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="order-amount" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.reportSale.amountLabel} <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="order-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={orderAmount}
                onChange={e => setOrderAmount(e.target.value)}
                className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 tabular-nums min-w-0"
                placeholder={t.reportSale.amountPlaceholder}
                required
              />
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="select bg-white/4 border-white/10 text-white/70 focus:border-fuchsia-500/60 w-24 shrink-0"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="order-id" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.reportSale.orderIdLabel}
            </label>
            <input
              id="order-id"
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              placeholder={t.reportSale.orderIdPlaceholder}
              autoComplete="off"
            />
          </div>

          {canSubmit && (
            <div className="rounded-xl bg-fuchsia-500/[0.06] border border-fuchsia-500/20 px-4 py-3 flex items-center justify-between">
              <span className="text-white/50 text-sm">{t.reportSale.amountLabel}</span>
              <span className="text-fuchsia-400 font-semibold text-sm tabular-nums">
                {amountNum.toFixed(2)} {currency}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {t.reportSale.error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                {t.reportSale.submit}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

        </form>
      </div>

      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className={[
            'alert shadow-lg rounded-2xl text-sm gap-2 px-4 py-3',
            toast.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-error/15 border border-error/30 text-error',
          ].join(' ')}>
            {toast.type === 'success' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  )
}
