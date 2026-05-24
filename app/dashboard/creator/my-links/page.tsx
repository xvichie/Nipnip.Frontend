'use client'

import { useRef, useState } from 'react'
import { useMerchants, useHighlightedMerchants } from '@/lib/queries/merchants'
import { useCreatorMe } from '@/lib/queries/creators'
import { useLanguage } from '@/lib/i18n'
import type { MerchantResponse } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const PAGE_SIZE = 12

export default function MyLinksPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MerchantResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDialogElement>(null)
  const { t } = useLanguage()

  const { data: creator } = useCreatorMe()
  const { data: highlighted, isLoading: loadingHighlighted } = useHighlightedMerchants()
  const { data, isLoading, isError } = useMerchants(page, PAGE_SIZE)

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

  function openModal(merchant: MerchantResponse) {
    setSelected(merchant)
    setCopied(false)
    modalRef.current?.showModal()
  }

  async function copyLink() {
    if (!selected || !creator) return
    const url = `${window.location.origin}/${creator.slug}/${selected.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const trackingUrl = selected && creator
    ? `${window.location.origin}/${creator.slug}/${selected.slug}`
    : ''

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.myLinks.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.myLinks.subtitle}</p>
      </div>

      {(loadingHighlighted || (highlighted && highlighted.length > 0)) && (
        <div className="flex flex-col gap-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{t.myLinks.featuredBrands}</p>
          {loadingHighlighted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-44 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlighted!.map(merchant => (
                <MerchantCard
                  key={merchant.id}
                  merchant={merchant}
                  onGetLink={() => openModal(merchant)}
                  getLinkLabel={t.myLinks.getLink}
                  featured
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {highlighted && highlighted.length > 0 && (
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{t.myLinks.allBrands}</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="skeleton h-44 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="alert alert-error rounded-2xl text-sm">
            {t.myLinks.loadError}
          </div>
        ) : data!.items.length === 0 ? (
          <div className="rounded-2xl border border-white/7 bg-white/2 py-20 text-center">
            <p className="text-white/20 text-sm">{t.myLinks.noMerchants}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data!.items.map(merchant => (
                <MerchantCard
                  key={merchant.id}
                  merchant={merchant}
                  onGetLink={() => openModal(merchant)}
                  getLinkLabel={t.myLinks.getLink}
                />
              ))}
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
          </>
        )}

      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-md p-0 overflow-hidden">

          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <MerchantLogo merchant={selected} size="md" />
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">{selected?.name}</h3>
                <span className="text-xs text-violet-400 font-semibold">
                  {selected?.commissionPercent}{t.myLinks.commission}
                </span>
              </div>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                {t.myLinks.trackingLinkLabel}
              </p>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5 min-w-0">
                  <p className="text-white/70 text-xs font-mono break-all leading-relaxed">{trackingUrl}</p>
                </div>
                <button
                  onClick={copyLink}
                  className={[
                    'btn btn-sm shrink-0 h-auto rounded-xl px-4 transition-all',
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30',
                  ].join(' ')}
                >
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                      <path d="M3 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M10 5V3.5A1.5 1.5 0 0 0 8.5 2h-5A1.5 1.5 0 0 0 2 3.5v5A1.5 1.5 0 0 0 3.5 10H5" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                  {copied ? t.common.copied : t.common.copy}
                </button>
              </div>
            </div>

            <p className="text-white/25 text-xs leading-relaxed">{t.myLinks.modalHint}</p>
          </div>

          <div className="px-6 pb-6">
            <form method="dialog">
              <button className="btn w-full bg-white/4 border-white/8 text-white/60 hover:text-white rounded-xl normal-case">
                {t.common.close}
              </button>
            </form>
          </div>

        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  )
}

function MerchantCard({
  merchant,
  onGetLink,
  getLinkLabel,
  featured,
}: {
  merchant: MerchantResponse
  onGetLink: () => void
  getLinkLabel: string
  featured?: boolean
}) {
  return (
    <div className={`group rounded-2xl border transition-all duration-200 p-5 flex flex-col gap-4 ${
      featured
        ? 'border-violet-500/25 bg-violet-500/4 hover:border-violet-500/40 hover:bg-violet-500/[0.07]'
        : 'border-white/7 bg-white/2 hover:border-violet-500/20 hover:bg-white/3'
    }`}>

      <div className="flex items-center gap-3">
        <MerchantLogo merchant={merchant} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm truncate">{merchant.name}</p>
          {merchant.websiteUrl && (
            <p className="text-white/30 text-xs truncate">{merchant.websiteUrl.replace(/^https?:\/\//, '')}</p>
          )}
        </div>
        <span className="shrink-0 text-xs font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1 tabular-nums">
          {merchant.commissionPercent}%
        </span>
      </div>

      {merchant.description && (
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{merchant.description}</p>
      )}

      <button
        onClick={onGetLink}
        className="btn btn-sm w-full mt-auto bg-violet-500/15 border-violet-500/25 text-violet-300 hover:bg-violet-500/25 hover:text-violet-200 rounded-xl normal-case font-semibold gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M5.5 8.5a3.1 3.1 0 0 0 4.4 0l1.75-1.75a3.1 3.1 0 0 0-4.4-4.4l-.875.875" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 5.5a3.1 3.1 0 0 0-4.4 0L2.35 7.25a3.1 3.1 0 0 0 4.4 4.4l.875-.875" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {getLinkLabel}
      </button>

    </div>
  )
}

function MerchantLogo({ merchant, size }: { merchant: MerchantResponse | null; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base'
  const initials = merchant?.name.slice(0, 2).toUpperCase() ?? '??'

  if (merchant?.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={merchant.logoUrl}
        alt={merchant.name}
        className={`${dim} rounded-xl object-cover shrink-0`}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div className={`${dim} rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0 font-black text-violet-400`}>
      {initials}
    </div>
  )
}
