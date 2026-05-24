'use client'

import { useState } from 'react'
import { useCreatorDashboard } from '@/lib/queries/creators'
import { useLanguage } from '@/lib/i18n'

function toLocalIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function CreatorDashboardPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { t } = useLanguage()

  const PRESETS = [
    { label: t.creatorDashboard.days7, days: 7 },
    { label: t.creatorDashboard.days30, days: 30 },
    { label: t.creatorDashboard.days90, days: 90 },
  ]

  const fromISO = from ? new Date(from).toISOString() : undefined
  const toISO = to ? new Date(`${to}T23:59:59`).toISOString() : undefined

  const { data, isLoading, isError } = useCreatorDashboard(fromISO, toISO)

  const today = toLocalIsoDate(new Date())

  function applyPreset(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFrom(toLocalIsoDate(start))
    setTo(toLocalIsoDate(end))
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.creatorDashboard.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.creatorDashboard.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => applyPreset(days)}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white hover:bg-white/8 normal-case"
          >
            {label}
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="date"
            max={today}
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="input input-sm bg-white/4 border-white/8 text-white/70 scheme-dark w-36"
          />
          <span className="text-white/30 text-sm select-none">–</span>
          <input
            type="date"
            max={today}
            value={to}
            onChange={e => setTo(e.target.value)}
            className="input input-sm bg-white/4 border-white/8 text-white/70 scheme-dark w-36"
          />
        </div>
        {(from || to) && (
          <button
            onClick={() => { setFrom(''); setTo('') }}
            className="btn btn-sm btn-ghost text-white/40 hover:text-white normal-case"
          >
            {t.common.clear}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="alert alert-error text-sm rounded-2xl">
          {t.creatorDashboard.statsError}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t.creatorDashboard.clicks}
            value={data!.totalClicks.toLocaleString()}
            color="text-sky-400 bg-sky-400/10"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M5 3.5 15 9l-5 1.5L8.5 15 5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            }
          />
          <StatCard
            label={t.creatorDashboard.conversions}
            value={data!.totalConversions.toLocaleString()}
            color="text-emerald-400 bg-emerald-400/10"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 9l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <StatCard
            label={t.creatorDashboard.earnings}
            value={`${data!.totalEarned.toFixed(2)} ₾`}
            color="text-violet-400 bg-violet-400/10"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 8.5h14" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="13" cy="12" r="1" fill="currentColor"/>
                <path d="M5 3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t.creatorDashboard.topMerchants}</h2>
        </div>

        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : isError ? null : data!.topMerchants.length === 0 ? (
          <div className="px-6 py-16 text-center flex flex-col items-center gap-2">
            <p className="text-white/20 text-sm">{t.creatorDashboard.noMerchants}</p>
            <p className="text-white/15 text-xs">{t.creatorDashboard.noMerchantsHint}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[t.creatorDashboard.tableNum, t.creatorDashboard.tableMerchant, t.creatorDashboard.tableClicks, t.creatorDashboard.tableConversions, t.creatorDashboard.tableCommission].map((h, i) => (
                    <th
                      key={h}
                      className={[
                        'px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest',
                        i === 0 ? 'text-left w-10' : i === 1 ? 'text-left' : 'text-right',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.topMerchants.map((m, i) => (
                  <tr key={m.merchantId} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white/25 font-mono text-sm">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white text-sm">{m.merchantName}</span>
                      <span className="text-white/25 text-xs ml-2">/{m.merchantSlug}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-white/60 text-sm tabular-nums">{m.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-white/60 text-sm tabular-nums">{m.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      <span className="text-violet-400 font-semibold text-sm">{m.commissionEarned.toFixed(2)} ₾</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  )
}
