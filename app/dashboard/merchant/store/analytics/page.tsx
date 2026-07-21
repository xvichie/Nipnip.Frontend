'use client'

import { useState } from 'react'
import { useStoreAnalytics } from '@/lib/queries/analytics'
import { useLanguage } from '@/lib/i18n'

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '—'
  return `${Math.round((numerator / denominator) * 100)}%`
}

export default function StoreAnalyticsPage() {
  const { t } = useLanguage()
  const [days, setDays] = useState(30)

  const PRESETS = [
    { label: t.merchantDashboard.days7, days: 7 },
    { label: t.merchantDashboard.days30, days: 30 },
    { label: t.merchantDashboard.days90, days: 90 },
  ]

  const { data, isLoading, isError } = useStoreAnalytics(days)

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.storeAnalytics.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.storeAnalytics.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.days}
            onClick={() => setDays(preset.days)}
            className={[
              'btn btn-sm normal-case',
              days === preset.days
                ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                : 'bg-white/4 border-white/8 text-white/60 hover:text-white hover:bg-white/8',
            ].join(' ')}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="alert alert-error text-sm rounded-2xl">{t.storeAnalytics.statsError}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t.storeAnalytics.visits}
              value={data!.visits.toLocaleString()}
              color="text-sky-400 bg-sky-400/10"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              }
            />
            <StatCard
              label={t.storeAnalytics.pageViews}
              value={data!.pageViews.toLocaleString()}
              color="text-violet-400 bg-violet-400/10"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <rect x="3" y="2.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 6.5h6M6 9.5h6M6 12.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <StatCard
              label={t.storeAnalytics.productViews}
              value={data!.productViews.toLocaleString()}
              color="text-amber-400 bg-amber-400/10"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M3 6l6-3.5L15 6v6l-6 3.5L3 12V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M3 6l6 3.5L15 6M9 9.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              }
            />
            <StatCard
              label={t.storeAnalytics.orders}
              value={data!.orders.toLocaleString()}
              color="text-emerald-400 bg-emerald-400/10"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 9l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t.storeAnalytics.funnelTitle}</h2>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <FunnelStage label={t.storeAnalytics.funnelVisits} value={data!.visits} of={data!.visits} />
              <FunnelArrow rate={pct(data!.productViews, data!.visits)} />
              <FunnelStage label={t.storeAnalytics.funnelProductViews} value={data!.productViews} of={data!.visits} />
              <FunnelArrow rate={pct(data!.orders, data!.productViews)} />
              <FunnelStage label={t.storeAnalytics.funnelOrders} value={data!.orders} of={data!.visits} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t.storeAnalytics.topPagesTitle}</h2>
              </div>
              {data!.topPages.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-white/20 text-sm">{t.storeAnalytics.noTopPages}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-widest">{t.storeAnalytics.tablePath}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/30 uppercase tracking-widest">{t.storeAnalytics.tableViews}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.topPages.map(p => (
                      <tr key={p.path} className="border-b border-white/4 last:border-0">
                        <td className="px-6 py-3.5 text-white/70 text-sm font-mono truncate max-w-0">{p.path}</td>
                        <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums">{p.views.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t.storeAnalytics.sourcesTitle}</h2>
              </div>
              {data!.sources.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-white/20 text-sm">{t.storeAnalytics.noSources}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-widest">{t.storeAnalytics.tableSource}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/30 uppercase tracking-widest">{t.storeAnalytics.tableVisits}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.sources.map(s => (
                      <tr key={s.source} className="border-b border-white/4 last:border-0">
                        <td className="px-6 py-3.5 text-white/70 text-sm">{s.source === 'Direct' ? t.storeAnalytics.direct : s.source}</td>
                        <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums">{s.visits.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function FunnelStage({ label, value, of }: { label: string; value: number; of: number }) {
  return (
    <div className="flex-1 rounded-xl border border-white/8 bg-white/2 px-5 py-4 flex flex-col gap-1">
      <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black tabular-nums">{value.toLocaleString()}</p>
      <p className="text-white/25 text-xs">{pct(value, of)}</p>
    </div>
  )
}

function FunnelArrow({ rate }: { rate: string }) {
  return (
    <div className="flex sm:flex-col items-center justify-center gap-1 px-1 shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-white/20 rotate-90 sm:rotate-0">
        <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-white/30 text-[11px] tabular-nums">{rate}</span>
    </div>
  )
}
