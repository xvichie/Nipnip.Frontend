'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { useMerchants, useHighlightedMerchants } from '@/lib/queries/merchants'
import { useCreatorMe } from '@/lib/queries/creators'
import { useLanguage } from '@/lib/i18n'
import type { MerchantResponse } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function MerchantLogo({ m, size }: { m: MerchantResponse; size: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-12 h-12 text-base' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-24 h-24 text-3xl'
  const initials = m.name.slice(0, 2).toUpperCase()
  if (m.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={m.logoUrl}
        alt={m.name}
        className={`${dim} rounded-2xl object-cover border border-white/10 shrink-0`}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div className={`${dim} rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/20 flex items-center justify-center font-black text-fuchsia-400 select-none shrink-0`}>
      {initials}
    </div>
  )
}

function MerchantCard({ m, onViewProfile, onGetLink, getLinkLabel }: {
  m: MerchantResponse
  onViewProfile: () => void
  onGetLink: (e: React.MouseEvent) => void
  getLinkLabel: string
}) {
  return (
    <div
      onClick={onViewProfile}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onViewProfile()}
      className="group cursor-pointer flex flex-col gap-4 p-5 rounded-2xl border border-white/7 bg-white/2 hover:border-violet-500/25 hover:bg-violet-500/3 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <MerchantLogo m={m} size="sm" />
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{m.name}</p>
          <p className="text-white/30 text-xs">/{m.slug}</p>
        </div>
      </div>
      {m.description && (
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{m.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          {m.websiteUrl && (
            <span className="text-white/25 text-xs">{m.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          )}
        </div>
        <button
          onClick={onGetLink}
          className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          {getLinkLabel}
        </button>
      </div>
    </div>
  )
}

function FeaturedCard({ m, onViewProfile, onGetLink, getLinkLabel }: {
  m: MerchantResponse
  onViewProfile: () => void
  onGetLink: (e: React.MouseEvent) => void
  getLinkLabel: string
}) {
  return (
    <div
      onClick={onViewProfile}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onViewProfile()}
      className="group cursor-pointer relative flex flex-col gap-5 p-6 rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/6 to-fuchsia-500/3 hover:border-violet-500/35 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 uppercase tracking-wide">
          ✦ Featured
        </span>
      </div>
      <div className="flex items-center gap-4">
        <MerchantLogo m={m} size="md" />
        <div>
          <p className="font-black text-white text-lg">{m.name}</p>
          <p className="text-white/30 text-sm">/{m.slug}</p>
        </div>
      </div>
      {m.description && (
        <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{m.description}</p>
      )}
      <div className="flex justify-end mt-auto">
        <button
          onClick={onGetLink}
          className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {getLinkLabel}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function MerchantsPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MerchantResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const profileModalRef = useRef<HTMLDialogElement>(null)
  const linkModalRef = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const { isSignedIn } = useAuth()
  const { data: creator } = useCreatorMe()

  const { data: highlighted, isLoading: loadingHighlighted } = useHighlightedMerchants()
  const { data, isLoading } = useMerchants(page, 12)

  const totalPages = data ? Math.ceil(data.totalCount / 12) : 1

  const trackingUrl = selected && creator
    ? `${window.location.origin}/${creator.slug}/${selected.slug}`
    : ''

  function openProfile(m: MerchantResponse) {
    setSelected(m)
    setCopied(false)
    profileModalRef.current?.showModal()
  }

  function openLink(m: MerchantResponse, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!isSignedIn) { router.push('/sign-up'); return }
    if (!creator) { router.push('/onboarding'); return }
    setSelected(m)
    setCopied(false)
    profileModalRef.current?.close()
    linkModalRef.current?.showModal()
  }

  async function copyLink() {
    if (!trackingUrl) return
    await navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-15">

        <section className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-70 bg-violet-600/12 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">{t.merchantsPage.badge}</p>
            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              {t.merchantsPage.title}
            </h1>
            <p className="text-white/40 text-base leading-relaxed">{t.merchantsPage.subtitle}</p>
          </div>
        </section>

        {(loadingHighlighted || (highlighted && highlighted.length > 0)) && (
          <section className="px-6 pb-16 bg-[#08080d]">
            <div className="max-w-6xl mx-auto">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-6">{t.merchantsPage.featuredBrands}</p>
              {loadingHighlighted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-52 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highlighted!.map(m => (
                    <FeaturedCard
                      key={m.id}
                      m={m}
                      onViewProfile={() => openProfile(m)}
                      onGetLink={e => openLink(m, e)}
                      getLinkLabel={t.merchantsPage.getLinkBtn}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="px-6 py-10 pb-24 bg-[#0c0c12] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-6">
              {t.merchantsPage.allShops} {data ? `· ${data.totalCount}` : ''}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-44 rounded-2xl" />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="py-20 text-center text-white/20 text-sm">{t.merchantsPage.noShops}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data!.items.map(m => (
                  <MerchantCard
                    key={m.id}
                    m={m}
                    onViewProfile={() => openProfile(m)}
                    onGetLink={e => openLink(m, e)}
                    getLinkLabel={t.merchantsPage.getLink}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
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
        </section>

      </main>

      <SiteFooter />

      {/* Profile modal */}
      <dialog ref={profileModalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-sm p-0 overflow-hidden">

          <div className="relative flex flex-col items-center gap-3 px-6 pt-10 pb-6 bg-linear-to-b from-fuchsia-600/12 to-transparent border-b border-white/6">
            <form method="dialog" className="absolute top-3 right-3">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>

            {selected && <MerchantLogo m={selected} size="lg" />}

            <div className="text-center">
              <h3 className="font-black text-white text-xl leading-tight">{selected?.name}</h3>
              <p className="text-white/40 text-sm mt-0.5">/{selected?.slug}</p>
              {selected?.isHighlighted && (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 uppercase tracking-wide">
                  ✦ Featured
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">

            {selected?.description ? (
              <p className="text-white/60 text-sm leading-relaxed">{selected.description}</p>
            ) : (
              <p className="text-white/25 text-sm">{t.merchantsPage.noDescription}</p>
            )}

            <div className="flex flex-col gap-2">
              {selected?.websiteUrl && (
                <a
                  href={selected.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/4 border border-white/8 rounded-xl px-3 py-2 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M7 1.5C7 1.5 5 3.5 5 7s2 5.5 2 5.5M7 1.5C7 1.5 9 3.5 9 7s-2 5.5-2 5.5M1.5 7h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  {selected.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
              {selected?.instagramHandle && (
                <a
                  href={`https://instagram.com/${selected.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/4 border border-white/8 rounded-xl px-3 py-2 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="14.5" cy="5.5" r="1" fill="currentColor"/>
                  </svg>
                  @{selected.instagramHandle}
                </a>
              )}
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-fuchsia-500/8 border border-fuchsia-500/15">
              <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">{t.merchantsPage.commissionRate}</span>
              <span className="text-fuchsia-300 font-black text-lg tabular-nums">{selected?.commissionPercent}%</span>
            </div>

            {selected?.createdAt && (
              <p className="text-white/25 text-xs">
                {t.merchantsPage.partnerSince} {formatDate(selected.createdAt)}
              </p>
            )}
          </div>

          <div className="px-6 pb-6 flex flex-col gap-2">
            <button
              onClick={() => openLink(selected!)}
              className="btn w-full bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white rounded-xl normal-case font-semibold gap-2"
            >
              {t.merchantsPage.getLinkBtn}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5.5 8.5a3.1 3.1 0 0 0 4.4 0l1.75-1.75a3.1 3.1 0 0 0-4.4-4.4l-.875.875" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 5.5a3.1 3.1 0 0 0-4.4 0L2.35 7.25a3.1 3.1 0 0 0 4.4 4.4l.875-.875" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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

      {/* Link modal */}
      <dialog ref={linkModalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-md p-0 overflow-hidden">

          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {selected && <MerchantLogo m={selected} size="sm" />}
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">{selected?.name}</h3>
                <p className="text-white/35 text-xs">{t.merchantsPage.forBrand}</p>
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
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{t.merchantsPage.trackingLinkLabel}</p>
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

            <p className="text-white/25 text-xs leading-relaxed">{t.merchantsPage.modalHint}</p>

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
