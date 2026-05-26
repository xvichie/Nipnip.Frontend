'use client'

import { useMemo, useState } from 'react'
import { useAdminConversions } from '@/lib/queries/admin'
import type { ConversionSource, ConversionStatus } from '@/lib/types'

const STATUS_CONFIG: Record<ConversionStatus, { label: string; className: string }> = {
  Pending:   { label: 'Pending',   className: 'bg-amber-500/10 border-amber-500/20 text-amber-400'       },
  Confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  Rejected:  { label: 'Rejected',  className: 'bg-red-500/10 border-red-500/20 text-red-400'             },
  Paid:      { label: 'Paid',      className: 'bg-violet-500/10 border-violet-500/20 text-violet-400'    },
}

const SOURCE_CONFIG: Record<ConversionSource, { label: string; className: string }> = {
  ManualReport:      { label: 'Manual',  className: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' },
  JsSnippet:         { label: 'JS',      className: 'bg-sky-500/10 border-sky-500/20 text-sky-400'             },
  WooCommercePlugin: { label: 'WooC.',   className: 'bg-orange-500/10 border-orange-500/20 text-orange-400'    },
  Api:               { label: 'API',     className: 'bg-slate-500/10 border-slate-500/20 text-slate-400'       },
}

function toLocalDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminConversionsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAdminConversions({ from, to, page })

  const today = toLocalDate(new Date())

  function applyPreset(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFrom(toLocalDate(start))
    setTo(toLocalDate(end))
    setPage(1)
  }

  const filtered = useMemo(() => {
    if (!data?.items || !search.trim()) return data?.items ?? []
    const q = search.toLowerCase()
    return data.items.filter(
      c =>
        c.merchantName.toLowerCase().includes(q) ||
        c.merchantSlug.toLowerCase().includes(q) ||
        c.creatorName.toLowerCase().includes(q) ||
        c.creatorSlug.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q)
    )
  }, [data, search])

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  const HEADERS = ['Date', 'Merchant', 'Creator', 'Order', 'Merch. Pays', 'Creator Gets', 'NipNip ← Merch', 'NipNip ← Creator', 'NipNip Total', 'Source', 'Status']

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">

      <div>
        <h1 className="text-2xl font-black tracking-tight">Conversions</h1>
        <p className="text-white/40 text-sm mt-1">
          {data ? `${data.totalCount} total` : 'All platform conversions'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map(days => (
          <button
            key={days}
            onClick={() => applyPreset(days)}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white hover:bg-white/8 normal-case"
          >
            {days}d
          </button>
        ))}
        <input
          type="date"
          max={today}
          value={from}
          onChange={e => { setFrom(e.target.value); setPage(1) }}
          className="input input-sm bg-white/4 border-white/8 text-white/70 scheme-dark w-36"
        />
        <span className="text-white/30 text-sm select-none">–</span>
        <input
          type="date"
          max={today}
          value={to}
          onChange={e => { setTo(e.target.value); setPage(1) }}
          className="input input-sm bg-white/4 border-white/8 text-white/70 scheme-dark w-36"
        />
        {(from || to) && (
          <button
            onClick={() => { setFrom(''); setTo(''); setPage(1) }}
            className="btn btn-sm btn-ghost text-white/40 hover:text-white normal-case"
          >
            Clear
          </button>
        )}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input input-sm bg-white/4 border-white/8 text-white/70 w-48 ml-auto"
          placeholder="Search merchant / creator…"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load conversions.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">No conversions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  {HEADERS.map((h, i) => (
                    <th
                      key={h}
                      className={[
                        'px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                        i >= 3 ? 'text-right' : 'text-left',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const status = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.Pending
                  const source = SOURCE_CONFIG[c.source] ?? SOURCE_CONFIG.Api
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5 text-white/50 text-sm whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-white text-sm font-medium">{c.merchantName}</span>
                        <span className="text-white/25 text-xs ml-1.5">/{c.merchantSlug}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-white/70 text-sm">{c.creatorName}</span>
                        <span className="text-white/25 text-xs ml-1.5">@{c.creatorSlug}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-white/60 text-sm tabular-nums whitespace-nowrap">
                        {c.orderAmount.toFixed(2)} {c.currency}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                        <span className="text-fuchsia-300 text-sm">
                          {(c.commissionAmount + c.merchantFeeAmount).toFixed(2)} {c.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                        <span className="text-violet-300 text-sm">
                          {c.creatorEarnings.toFixed(2)} {c.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                        <span className="text-amber-400 text-sm">
                          +{c.merchantFeeAmount.toFixed(2)} {c.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                        <span className="text-amber-300 text-sm">
                          +{c.creatorFeeAmount.toFixed(2)} {c.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                        <span className="text-emerald-400 font-semibold text-sm">
                          +{(c.merchantFeeAmount + c.creatorFeeAmount).toFixed(2)} {c.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${source.className}`}>
                          {source.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
