'use client'

import { useState } from 'react'
import { useAvailableBalance, useMyPayouts, useRequestPayout } from '@/lib/queries/payouts'
import type { PayoutStatus } from '@/lib/types'

const MIN_PAYOUT = 50

const STATUS_CONFIG: Record<PayoutStatus, { label: string; className: string }> = {
  Requested: { label: 'Pending',  className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  Sent:      { label: 'Sent',     className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  Rejected:  { label: 'Rejected', className: 'bg-red-500/10 border-red-500/20 text-red-400' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function money(n: number, currency = 'GEL') {
  return `${n.toFixed(2)} ${currency}`
}

export default function CreatorPayoutsPage() {
  const [amount, setAmount] = useState('')
  const [page, setPage] = useState(1)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: balanceData, isLoading: balanceLoading } = useAvailableBalance()
  const { data, isLoading, isError } = useMyPayouts(page)
  const { mutate: request, isPending, error } = useRequestPayout()

  const available = balanceData?.availableBalance ?? 0
  const totalPages = data ? Math.ceil(data.totalCount / 20) : 1

  const amountNum = parseFloat(amount) || 0
  const amountError =
    amount && amountNum < MIN_PAYOUT
      ? `Minimum payout is ${MIN_PAYOUT} GEL`
      : amount && amountNum > available
      ? `Amount exceeds available balance (${money(available)})`
      : null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountNum || amountError) return
    request(
      { amount: amountNum, currency: 'GEL' },
      {
        onSuccess: () => {
          setAmount('')
          setSuccessMsg('Payout request submitted! We will transfer your earnings shortly.')
          setTimeout(() => setSuccessMsg(''), 5000)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      <div>
        <h1 className="text-2xl font-black tracking-tight">Payouts</h1>
        <p className="text-white/40 text-sm mt-1">
          Request a withdrawal of your earned commissions.
        </p>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/4 p-6 flex items-center justify-between">
        <div>
          <p className="text-violet-400/60 text-xs uppercase tracking-widest mb-1">Available to Withdraw</p>
          {balanceLoading ? (
            <div className="skeleton h-10 w-32 rounded-lg" />
          ) : (
            <p className="text-4xl font-black tabular-nums text-violet-300">
              {money(available)}
            </p>
          )}
          <p className="text-white/25 text-xs mt-2">Minimum withdrawal: {MIN_PAYOUT} GEL</p>
        </div>
        <div className="text-violet-400/20">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="12" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 19h32" stroke="currentColor" strokeWidth="2"/>
            <circle cx="28" cy="25" r="2" fill="currentColor"/>
            <path d="M10 7h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Request form */}
      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <h2 className="text-sm font-bold mb-4">Request Payout</h2>

        {successMsg && (
          <div className="alert alert-success text-sm rounded-xl mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">
              Amount (GEL)
            </label>
            <div className="relative">
              <input
                type="number"
                min={MIN_PAYOUT}
                max={available}
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min ${MIN_PAYOUT} GEL`}
                className={[
                  'input w-full bg-white/4 border text-white pr-20',
                  amountError ? 'border-red-500/40' : 'border-white/8',
                ].join(' ')}
                disabled={available < MIN_PAYOUT}
              />
              <button
                type="button"
                onClick={() => setAmount(available.toFixed(2))}
                disabled={available < MIN_PAYOUT}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/70 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
              >
                Max
              </button>
            </div>
            {amountError && (
              <p className="text-red-400 text-xs mt-1.5">{amountError}</p>
            )}
            {available < MIN_PAYOUT && !balanceLoading && (
              <p className="text-white/30 text-xs mt-1.5">
                You need at least {MIN_PAYOUT} GEL to request a payout.
              </p>
            )}
          </div>

          {error && (
            <div className="alert alert-error text-sm rounded-xl">
              {(error as Error).message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !!amountError || !amountNum || available < MIN_PAYOUT}
            className="btn bg-violet-500 hover:bg-violet-400 border-none text-white font-bold normal-case self-start"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Request Payout'}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-bold mb-4">Payout History</h2>

        <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
          {isLoading ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : isError ? (
            <div className="p-6">
              <div className="alert alert-error text-sm rounded-xl">Failed to load payout history.</div>
            </div>
          ) : !data?.items.length ? (
            <div className="py-16 text-center text-white/20 text-sm">No payout requests yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left">Date</th>
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Requested</th>
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Received</th>
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(p => {
                  const cfg = STATUS_CONFIG[p.status]
                  return (
                    <tr key={p.id} className="border-b border-white/4 last:border-0">
                      <td className="px-5 py-4 text-white/50 text-sm whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right text-white text-sm font-medium tabular-nums">
                        {money(p.requestedAmount, p.currency)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {p.amountSent != null ? (
                          <span className="text-emerald-400 font-semibold text-sm">
                            {money(p.amountSent, p.currency)}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                            {cfg.label}
                          </span>
                          {p.notes && (
                            <span className="text-white/30 text-xs max-w-[160px] text-right">{p.notes}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Prev
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

    </div>
  )
}
