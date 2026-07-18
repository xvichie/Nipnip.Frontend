'use client'

import { useState } from 'react'
import { useAdminCreators, useAdminToggleCreatorHighlight, useAdminToggleCreatorTest } from '@/lib/queries/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminCreatorsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminCreators(page)
  const { mutate: toggleHighlight, isPending: isToggling } = useAdminToggleCreatorHighlight()
  const { mutate: toggleTest, isPending: isTogglingTest } = useAdminToggleCreatorTest()

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      <div>
        <h1 className="text-2xl font-black tracking-tight">Creators</h1>
        <p className="text-white/40 text-sm mt-1">
          {data ? `${data.totalCount} total` : 'All creators including inactive'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load creators.</div>
          </div>
        ) : data!.items.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">No creators yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Instagram', 'TikTok', 'Featured', 'Test', 'Status', 'Created'].map((h, i) => (
                    <th
                      key={h}
                      className={[
                        'px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                        i >= 5 ? 'text-right' : 'text-left',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.items.map(c => (
                  <tr
                    key={c.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-white text-sm">{c.name}</span>
                      <span className="text-white/25 text-xs ml-1.5">@{c.slug}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/50 text-sm">
                      {c.instagramHandle ? `@${c.instagramHandle}` : <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-white/50 text-sm">
                      {c.tiktokHandle ? `@${c.tiktokHandle}` : <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleHighlight(c.id)}
                        disabled={isToggling}
                        className={[
                          'btn btn-xs border transition-colors disabled:opacity-40',
                          c.isHighlighted
                            ? 'bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-amber-300 hover:border-amber-500/25',
                        ].join(' ')}
                        title={c.isHighlighted ? 'Remove from featured' : 'Add to featured'}
                      >
                        {c.isHighlighted ? '✦ Featured' : '✦ Feature'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleTest(c.id)}
                        disabled={isTogglingTest}
                        className={[
                          'btn btn-xs border transition-colors disabled:opacity-40',
                          c.isTest
                            ? 'bg-sky-500/15 border-sky-500/25 text-sky-300 hover:bg-sky-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-sky-300 hover:border-sky-500/25',
                        ].join(' ')}
                        title={c.isTest ? 'Hidden from public directory unless viewed by the paired test merchant' : 'Mark as a test account'}
                      >
                        {c.isTest ? 'Test' : 'Mark test'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={[
                        'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium',
                        c.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-white/4 border-white/8 text-white/30',
                      ].join(' ')}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-white/40 text-xs whitespace-nowrap">
                      {formatDate(c.createdAt)}
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
