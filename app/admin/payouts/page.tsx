'use client'

import { useState } from 'react'
import { useAdminPayouts, useMarkPayoutSent, useRejectPayout } from '@/lib/queries/payouts'
import type { PayoutResponse, PayoutStatus } from '@/lib/types'

const STATUS_CONFIG: Record<PayoutStatus, { label: string; className: string }> = {
  Requested: { label: 'Requested', className: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  Sent:      { label: 'Sent',      className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  Rejected:  { label: 'Rejected',  className: 'bg-red-500/10 border-red-500/20 text-red-400' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function money(n: number, currency = 'GEL') {
  return `${n.toFixed(2)} ${currency}`
}

function MarkSentModal({
  payout,
  onClose,
}: {
  payout: PayoutResponse
  onClose: () => void
}) {
  const [amountSent, setAmountSent] = useState(String(payout.requestedAmount))
  const [notes, setNotes] = useState('')
  const { mutate, isPending, error } = useMarkPayoutSent()

  function submit() {
    const amount = parseFloat(amountSent)
    if (!amount || amount <= 0) return
    mutate({ id: payout.id, amountSent: amount, notes: notes || null }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-black">Mark as Sent</h2>
          <p className="text-white/40 text-sm mt-1">
            Sending to <span className="text-white/70">{payout.creatorName}</span>
            <span className="text-white/30 ml-1">@{payout.creatorSlug}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">
              Amount Sent ({payout.currency})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amountSent}
              onChange={e => setAmountSent(e.target.value)}
              className="input w-full bg-white/4 border-white/8 text-white"
            />
            <p className="text-white/30 text-xs mt-1">Requested: {money(payout.requestedAmount, payout.currency)}</p>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Transfer ID, bank note, etc."
              className="input w-full bg-white/4 border-white/8 text-white/80"
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-xl">
            {(error as Error).message}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn btn-ghost text-white/40 hover:text-white normal-case">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="btn bg-emerald-500 hover:bg-emerald-400 border-none text-white font-bold normal-case"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Confirm Sent'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('Requested')
  const [page, setPage] = useState(1)
  const [markingPayout, setMarkingPayout] = useState<PayoutResponse | null>(null)

  const { data, isLoading, isError } = useAdminPayouts(statusFilter || undefined, page)
  const { mutate: reject, isPending: rejecting } = useRejectPayout()

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  const FILTERS: Array<{ value: string; label: string }> = [
    { value: 'Requested', label: 'Requested' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Rejected', label: 'Rejected' },
    { value: '', label: 'All' },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-4xl">

      {markingPayout && (
        <MarkSentModal payout={markingPayout} onClose={() => setMarkingPayout(null)} />
      )}

      <div>
        <h1 className="text-2xl font-black tracking-tight">Payout Requests</h1>
        <p className="text-white/40 text-sm mt-1">
          Creator withdrawal requests — review and mark as sent after transferring.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={[
              'btn btn-sm normal-case',
              statusFilter === f.value
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
        {data && (
          <span className="ml-auto text-white/30 text-sm self-center tabular-nums">
            {data.totalCount} result{data.totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load payout requests.</div>
          </div>
        ) : !data?.items.length ? (
          <div className="py-20 text-center text-white/20 text-sm">
            No {statusFilter.toLowerCase() || ''} payout requests.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left">Creator</th>
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Requested</th>
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Sent</th>
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(p => {
                const cfg = STATUS_CONFIG[p.status]
                return (
                  <tr key={p.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{p.creatorName}</p>
                      <p className="text-white/30 text-xs">@{p.creatorSlug}</p>
                      {p.notes && <p className="text-white/40 text-xs mt-0.5 italic">{p.notes}</p>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-white font-semibold tabular-nums text-sm">
                        {money(p.requestedAmount, p.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.amountSent != null ? (
                        <span className="text-emerald-400 font-semibold tabular-nums text-sm">
                          {money(p.amountSent, p.currency)}
                        </span>
                      ) : (
                        <span className="text-white/20 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-white/50 text-sm whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.status === 'Requested' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setMarkingPayout(p)}
                            className="btn btn-xs bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 normal-case"
                          >
                            Mark Sent
                          </button>
                          <button
                            onClick={() => reject({ id: p.id })}
                            disabled={rejecting}
                            className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 normal-case"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {p.status === 'Sent' && p.paidAt && (
                        <span className="text-white/30 text-xs">{formatDate(p.paidAt)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
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
