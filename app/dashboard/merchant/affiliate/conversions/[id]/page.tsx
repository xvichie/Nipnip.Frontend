'use client'

import { use } from 'react'
import Link from 'next/link'
import { useConversionById } from '@/lib/queries/conversions'
import { useLanguage } from '@/lib/i18n'
import type { ConversionStatus } from '@/lib/types'

const STATUS_CLASSES: Record<ConversionStatus, string> = {
  Pending:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Confirmed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Rejected:  'bg-red-500/10 border-red-500/20 text-red-400',
  Paid:      'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ka-GE', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ConversionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading, isError } = useConversionById(id)
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/merchant/affiliate/conversions"
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t.detail.backConversions}
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-white/40 text-sm font-mono truncate max-w-40">{id.slice(0, 8)}…</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="alert alert-error rounded-xl text-sm">{t.detail.notFound}</div>
      ) : data ? (
        <>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t.detail.title}</h1>
            <p className="text-white/40 text-sm mt-1">{formatDate(data.createdAt)}</p>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">

            <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t.detail.statusLabel}</span>
              <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[data.status] ?? ''}`}>
                {t.status[data.status] ?? data.status}
              </span>
            </div>

            <div className="px-6 py-6 border-b border-white/6 flex items-center justify-between gap-4">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t.detail.commission}</p>
                <p className="text-3xl font-black text-fuchsia-400 tabular-nums">
                  {(data.commissionAmount + data.merchantFeeAmount).toFixed(2)} {data.currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t.detail.saleAmount}</p>
                <p className="text-xl font-bold text-white/70 tabular-nums">
                  {data.orderAmount.toFixed(2)} {data.currency}
                </p>
              </div>
            </div>

            {[
              { label: t.detail.creator,     value: `${data.creatorName} (@${data.creatorSlug})` },
              { label: t.detail.orderId,     value: data.orderId },
              { label: t.detail.sourceLabel, value: t.sourceFull[data.source] ?? data.source },
              { label: 'ID',                 value: data.id, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="px-6 py-4 border-b border-white/4 last:border-0 flex items-start justify-between gap-4">
                <span className="text-white/40 text-sm shrink-0">{label}</span>
                <span className={`text-white/80 text-sm text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
