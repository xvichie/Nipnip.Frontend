'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminMerchants, useAdminDeactivateMerchant, useAdminToggleMerchantHighlight } from '@/lib/queries/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminMerchantsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminMerchants(page)
  const { mutate: deactivate, isPending: isDeactivating } = useAdminDeactivateMerchant()
  const { mutate: toggleHighlight, isPending: isToggling } = useAdminToggleMerchantHighlight()

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  function handleDeactivate(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"? This will hide them from the public marketplace.`)) return
    deactivate(id)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Merchants</h1>
          <p className="text-white/40 text-sm mt-1">
            {data ? `${data.totalCount} total` : 'All merchants including inactive'}
          </p>
        </div>
        <Link
          href="/admin/merchants/new"
          className="btn btn-sm gap-2 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          New Merchant
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load merchants.</div>
          </div>
        ) : data!.items.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">No merchants yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Commission', 'Balance', 'API Key', 'Status', 'Featured', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        'px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                        i >= 6 ? 'text-right' : 'text-left',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.items.map(m => (
                  <tr
                    key={m.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-white text-sm">{m.name}</span>
                      <span className="text-white/25 text-xs ml-1.5">/{m.slug}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm tabular-nums">
                      {m.commissionPercent}%
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm tabular-nums">
                      {m.balance.toFixed(2)} ₾
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-white/25 truncate max-w-[120px] block">
                        {m.apiKey}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={[
                        'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium',
                        m.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/30',
                      ].join(' ')}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleHighlight(m.id)}
                        disabled={isToggling}
                        className={[
                          'btn btn-xs border transition-colors disabled:opacity-40',
                          m.isHighlighted
                            ? 'bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-amber-300 hover:border-amber-500/25',
                        ].join(' ')}
                        title={m.isHighlighted ? 'Remove from featured' : 'Add to featured'}
                      >
                        {m.isHighlighted ? '✦ Featured' : '✦ Feature'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right text-white/40 text-xs whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/merchants/${m.id}/edit`}
                          className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/merchants/${m.id}/store`}
                          className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white"
                        >
                          Store
                        </Link>
                        {m.isActive && (
                          <button
                            onClick={() => handleDeactivate(m.id, m.name)}
                            disabled={isDeactivating}
                            className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
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
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
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
