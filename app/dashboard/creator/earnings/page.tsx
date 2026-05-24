'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyEarnings, useMyEarningsMonthly } from '@/lib/queries/conversions'
import { useLanguage } from '@/lib/i18n'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import type { ConversionStatus } from '@/lib/types'

const PAGE_SIZE = 20

const STATUS_CLASSES: Record<ConversionStatus, string> = {
  Pending:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Confirmed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Rejected:  'bg-red-500/10 border-red-500/20 text-red-400',
  Paid:      'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

function monthLabelFull(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function EarningsPage() {
  const [page, setPage] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const { data: monthly, isLoading: monthlyLoading } = useMyEarningsMonthly()
  const { data, isLoading, isError } = useMyEarnings(
    page,
    PAGE_SIZE,
    selectedMonth?.month,
    selectedMonth?.year,
  )

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

  const activeSummary = selectedMonth
    ? monthly?.find(m => m.year === selectedMonth.year && m.month === selectedMonth.month)
    : undefined

  // Chart data: chronological order (oldest first)
  const chartData = monthly
    ? [...monthly].reverse().map(m => ({
        label: monthLabel(m.year, m.month),
        value: m.totalEarnings,
        year: m.year,
        month: m.month,
      }))
    : []

  function selectMonth(year: number, month: number) {
    setSelectedMonth(prev =>
      prev?.year === year && prev?.month === month ? null : { year, month }
    )
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.earnings.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.earnings.subtitle}</p>
      </div>

      {/* Chart card */}
      <div className="rounded-2xl border border-white/7 bg-white/2 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">
            {t.earnings.monthlyBreakdown}
          </p>
          {selectedMonth && (
            <button
              onClick={() => { setSelectedMonth(null); setPage(1) }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {t.earnings.allTime} ×
            </button>
          )}
        </div>

        {monthlyLoading ? (
          <div className="skeleton h-35 rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-35 flex items-center justify-center text-white/15 text-sm">
            {t.earnings.noEarnings}
          </div>
        ) : (
          <MonthlyBarChart
            data={chartData}
            accentColor="#8b5cf6"
            accentDimColor="rgba(139,92,246,0.18)"
            selectedYear={selectedMonth?.year}
            selectedMonth={selectedMonth?.month}
            onSelect={selectMonth}
            currency="₾"
          />
        )}

        {/* Month pills below chart */}
        {!monthlyLoading && chartData.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            <button
              onClick={() => { setSelectedMonth(null); setPage(1) }}
              className={[
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                !selectedMonth
                  ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                  : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
              ].join(' ')}
            >
              {t.earnings.allTime}
            </button>
            {[...monthly!].reverse().map(m => {
              const active = selectedMonth?.year === m.year && selectedMonth?.month === m.month
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => selectMonth(m.year, m.month)}
                  className={[
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    active
                      ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                      : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
                  ].join(' ')}
                >
                  {monthLabel(m.year, m.month)}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly summary card */}
      {activeSummary && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-6 py-5 flex items-center justify-between gap-6">
          <div>
            <p className="text-violet-400/60 text-xs uppercase tracking-widest mb-1">
              {monthLabelFull(activeSummary.year, activeSummary.month)}
            </p>
            <p className="text-3xl font-black tabular-nums text-violet-300">
              {activeSummary.totalEarnings.toFixed(2)} ₾
            </p>
            <p className="text-white/30 text-xs mt-1">
              {activeSummary.count} {t.earnings.monthlySales} · {t.earnings.monthlyEarned}
            </p>
          </div>
          <div className="text-violet-400/20">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
              <rect x="3" y="9" width="30" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 16h30" stroke="currentColor" strokeWidth="2"/>
              <circle cx="27" cy="22" r="2" fill="currentColor"/>
              <path d="M9 5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* Transaction table */}
      <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">

        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            {t.earnings.history}
          </h2>
          {data && (
            <span className="text-white/25 text-xs tabular-nums">
              {data.totalCount} {t.common.records}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">{t.earnings.loadError}</div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-white/20 text-sm">{t.earnings.noEarnings}</p>
            <p className="text-white/15 text-xs">{t.earnings.noEarningsHint}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left whitespace-nowrap">{t.earnings.colDate}</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left whitespace-nowrap">{t.earnings.colMerchant}</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">{t.earnings.colOrder}</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">{t.earnings.colCommission}</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">{t.earnings.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(entry => {
                  const { date, time } = formatDateTime(entry.createdAt)
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => router.push(`/dashboard/creator/earnings/${entry.id}`)}
                      className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-white/60 text-sm">{date}</p>
                        <p className="text-white/25 text-xs">{time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white text-sm">{entry.merchantName}</span>
                        <span className="text-white/25 text-xs ml-1.5">/{entry.merchantSlug}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-white/60 text-sm tabular-nums whitespace-nowrap">
                        {entry.orderAmount.toFixed(2)} {entry.currency}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums whitespace-nowrap">
                        <span className="text-violet-400 font-semibold text-sm">
                          +{entry.creatorEarnings.toFixed(2)} {entry.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[entry.status] ?? STATUS_CLASSES.Pending}`}>
                          {t.status[entry.status] ?? entry.status}
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
            {t.common.prev}
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            {t.common.next}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

    </div>
  )
}
