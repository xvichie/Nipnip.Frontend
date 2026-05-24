'use client'

import Link from 'next/link'
import { useAdminStats, useAdminPayoutSummary } from '@/lib/queries/admin'

function fmt(n: number) { return n.toLocaleString() }
function money(n: number, currency = 'GEL') { return `${n.toFixed(2)} ${currency}` }

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminStats()
  const { data: payouts, isLoading: payoutsLoading } = useAdminPayoutSummary()

  const statCards = [
    {
      label: 'Merchants',
      value: data?.totalMerchants ?? 0,
      format: fmt,
      color: 'text-fuchsia-400 bg-fuchsia-400/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M2 7.5h14M3.5 2.5h11l1.5 5H2L3.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M2 7.5v8h14v-8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Creators',
      value: data?.totalCreators ?? 0,
      format: fmt,
      color: 'text-violet-400 bg-violet-400/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Total Conversions',
      value: data?.totalConversions ?? 0,
      format: fmt,
      color: 'text-sky-400 bg-sky-400/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 9l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Commission Volume',
      value: data?.totalCommissionVolume ?? 0,
      format: (n: number) => money(n),
      color: 'text-amber-400 bg-amber-400/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 8.5h14" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="13" cy="12" r="1" fill="currentColor"/>
          <path d="M5 3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-5xl">

      <div>
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="text-white/40 text-sm mt-1">Platform-wide statistics</p>
      </div>

      {isError && (
        <div className="alert alert-error text-sm rounded-2xl">Failed to load stats.</div>
      )}

      {/* Base stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, format, color, icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/2 p-6 flex flex-col gap-4"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{label}</p>
              {isLoading ? (
                <div className="skeleton h-9 w-20 rounded-lg" />
              ) : (
                <p className="text-3xl font-black tabular-nums">{format(value)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Platform earnings */}
      <div>
        <h2 className="text-base font-bold tracking-tight mb-4">Platform Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/4 p-6 flex flex-col gap-3">
            <p className="text-emerald-400/60 text-xs uppercase tracking-widest">Total Platform Earnings</p>
            {isLoading ? (
              <div className="skeleton h-10 w-28 rounded-lg" />
            ) : (
              <p className="text-4xl font-black tabular-nums text-emerald-400">
                {money(data?.totalPlatformEarnings ?? 0)}
              </p>
            )}
            <p className="text-white/30 text-xs">All-time (creator fee + merchant fee)</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/4 p-6 flex flex-col gap-3">
            <p className="text-amber-400/60 text-xs uppercase tracking-widest">Pending Creator Payouts</p>
            {isLoading ? (
              <div className="skeleton h-10 w-28 rounded-lg" />
            ) : (
              <p className="text-4xl font-black tabular-nums text-amber-400">
                {money(data?.pendingCreatorPayouts ?? 0)}
              </p>
            )}
            <p className="text-white/30 text-xs">
              Confirmed conversions not yet paid out —{' '}
              <Link href="/admin/payouts" className="text-amber-400/70 hover:text-amber-300 underline underline-offset-2">
                see breakdown
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Top creator payouts preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight">Pending Transfers</h2>
          <Link
            href="/admin/payouts"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden">
          {payoutsLoading ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : !payouts?.creators.length ? (
            <div className="py-12 text-center text-white/20 text-sm">No pending payouts.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left">Creator</th>
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">Conversions</th>
                  <th className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right">To Transfer</th>
                </tr>
              </thead>
              <tbody>
                {payouts.creators.slice(0, 5).map(c => (
                  <tr key={c.creatorId} className="border-b border-white/4 last:border-0">
                    <td className="px-5 py-3.5">
                      <span className="text-white text-sm font-medium">{c.creatorName}</span>
                      <span className="text-white/25 text-xs ml-1.5">@{c.creatorSlug}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-white/50 text-sm tabular-nums">
                      {c.conversions}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-emerald-400 font-semibold text-sm tabular-nums">
                        {money(c.totalEarnings, c.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
