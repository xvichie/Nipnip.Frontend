'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminMerchants, useAdminDeactivateMerchant, useAdminDeleteMerchantPermanently, useAdminToggleMerchantHighlight, useAdminToggleMerchantFeatureStore, useAdminToggleMerchantTest } from '@/lib/queries/admin'
import { useImpersonate } from '@/hooks/useImpersonate'
import { EditIcon, FlaskIcon, GlobeIcon, LoginIcon, PlusIcon, PowerIcon, StarIcon, StoreIcon, TrashIcon } from '@/components/ui/icons'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// Icon-only action button matching IconButton's daisyUI tooltip shape, but with per-call color
// control (the row has amber/red/neutral actions that don't map cleanly onto IconButton's fixed
// variants).
function RowIconButton({
  label, onClick, href, disabled, loading, className, children,
}: {
  label: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  loading?: boolean
  className: string
  children: React.ReactNode
}) {
  const cls = ['tooltip tooltip-top btn btn-xs btn-square disabled:opacity-40 transition-colors', className].join(' ')
  if (href) {
    return (
      <Link href={href} aria-label={label} data-tip={label} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} data-tip={label} className={cls}>
      {loading ? <span className="loading loading-spinner loading-xs" /> : children}
    </button>
  )
}

export default function AdminMerchantsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminMerchants(page)
  const { mutate: deactivate, isPending: isDeactivating } = useAdminDeactivateMerchant()
  const { mutate: deletePermanently, isPending: isDeleting } = useAdminDeleteMerchantPermanently()
  const { mutate: toggleHighlight, isPending: isToggling } = useAdminToggleMerchantHighlight()
  const { mutate: toggleFeatureStore, isPending: isTogglingFeatureStore } = useAdminToggleMerchantFeatureStore()
  const { mutate: toggleTest, isPending: isTogglingTest } = useAdminToggleMerchantTest()
  const { impersonate, loadingId: impersonatingId, error: impersonateError } = useImpersonate()

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  function handleDeactivate(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"? This will hide them from the public marketplace.`)) return
    deactivate(id)
  }

  function handleDeletePermanently(id: string, name: string) {
    if (!confirm(
      `Permanently delete "${name}"?\n\nThis removes their store, products, categories, collections, orders, discount codes, and all click/conversion (affiliate link) history — everything, with no way to undo it.\n\nType OK only if you're sure.`
    )) return
    if (prompt(`Type the merchant's name (${name}) to confirm permanent deletion:`) !== name) return
    deletePermanently(id)
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
          <PlusIcon />
          New Merchant
        </Link>
      </div>

      {impersonateError && (
        <div className="alert alert-error text-sm rounded-xl">{impersonateError}</div>
      )}

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
                  {['Name', 'Commission', 'Balance', 'Store Created', 'Status', 'Featured', 'Website', 'Test', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        'px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                        i >= 4 ? 'text-center' : 'text-left',
                        i === 9 ? 'text-right' : '',
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
                      <Link
                        href={`/admin/merchants/${m.id}/edit`}
                        className="font-medium text-white text-sm hover:text-amber-300 transition-colors"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm tabular-nums">
                      {m.commissionPercent}%
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm tabular-nums">
                      {m.balance.toFixed(2)} ₾
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs whitespace-nowrap tabular-nums">
                      {m.storeCreatedAt
                        ? <span className="text-white/50">{formatDate(m.storeCreatedAt)}</span>
                        : <span className="text-white/20">No store</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <span
                          data-tip={m.isActive ? 'Active' : 'Inactive'}
                          className={[
                            'tooltip tooltip-top inline-block w-3 h-3 rounded-full border',
                            m.isActive
                              ? 'bg-emerald-500 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-white/10 border-white/15',
                          ].join(' ')}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <RowIconButton
                          label={m.isHighlighted ? 'Remove from affiliate carousel' : 'Add to affiliate carousel'}
                          onClick={() => toggleHighlight(m.id)}
                          disabled={isToggling}
                          className={m.isHighlighted
                            ? 'bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-amber-300 hover:border-amber-500/25'}
                        >
                          <StarIcon filled={m.isHighlighted} />
                        </RowIconButton>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <RowIconButton
                          label={m.isFeaturedStore ? 'Remove from website showcase' : 'Feature this website on the landing page'}
                          onClick={() => toggleFeatureStore(m.id)}
                          disabled={isTogglingFeatureStore}
                          className={m.isFeaturedStore
                            ? 'bg-violet-500/15 border-violet-500/25 text-violet-300 hover:bg-violet-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-violet-300 hover:border-violet-500/25'}
                        >
                          <GlobeIcon />
                        </RowIconButton>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <RowIconButton
                          label={m.isTest ? 'Test account — hidden from public listing unless viewed by the paired test creator' : 'Mark as a test account'}
                          onClick={() => toggleTest(m.id)}
                          disabled={isTogglingTest}
                          className={m.isTest
                            ? 'bg-sky-500/15 border-sky-500/25 text-sky-300 hover:bg-sky-500/25'
                            : 'bg-white/4 border-white/8 text-white/40 hover:text-sky-300 hover:border-sky-500/25'}
                        >
                          <FlaskIcon />
                        </RowIconButton>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-white/40 text-xs whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!m.isProspect && (
                          <RowIconButton
                            label="Sign in as this merchant — you'll be switched into their account"
                            onClick={() => impersonate('merchant', m.id, m.name)}
                            disabled={impersonatingId === m.id}
                            loading={impersonatingId === m.id}
                            className="bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                          >
                            <LoginIcon />
                          </RowIconButton>
                        )}
                        <RowIconButton
                          label="Edit merchant"
                          href={`/admin/merchants/${m.id}/edit`}
                          className="bg-white/4 border-white/8 text-white/60 hover:text-white"
                        >
                          <EditIcon />
                        </RowIconButton>
                        <RowIconButton
                          label="Manage store"
                          href={`/admin/merchants/${m.id}/store`}
                          className="bg-white/4 border-white/8 text-white/60 hover:text-white"
                        >
                          <StoreIcon />
                        </RowIconButton>
                        {m.isActive && (
                          <RowIconButton
                            label="Deactivate — hide from the public marketplace"
                            onClick={() => handleDeactivate(m.id, m.name)}
                            disabled={isDeactivating}
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          >
                            <PowerIcon />
                          </RowIconButton>
                        )}
                        <RowIconButton
                          label="Permanently delete this merchant and everything linked to it — cannot be undone"
                          onClick={() => handleDeletePermanently(m.id, m.name)}
                          disabled={isDeleting}
                          loading={isDeleting}
                          className="bg-red-600/20 border-red-600/40 text-red-300 hover:bg-red-600/30"
                        >
                          <TrashIcon />
                        </RowIconButton>
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
