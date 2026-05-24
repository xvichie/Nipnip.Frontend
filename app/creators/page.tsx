'use client'

import { useRef, useState } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { useCreators, useHighlightedCreators } from '@/lib/queries/creators'
import { useLanguage } from '@/lib/i18n'
import type { CreatorResponse } from '@/lib/types'

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

const IG_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="14.5" cy="5.5" r="1" fill="currentColor"/>
  </svg>
)
const TT_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M13 2c.3 2.3 1.6 3.6 4 3.9v3c-1.3.1-2.6-.3-4-1.1V13a5 5 0 1 1-3.5-4.8V11a2 2 0 1 0 1.5 1.9V2H13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const YT_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="4" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8.5 7.5l5 2.5-5 2.5V7.5Z" fill="currentColor"/>
  </svg>
)
const FB_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M11.5 7H13V5h-1.5C10.1 5 9 6.1 9 7.5V9H7.5v2H9v5h2v-5h1.5l.5-2H11V7.5c0-.3.2-.5.5-.5Z" fill="currentColor"/>
  </svg>
)
const X_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M3 3l5.8 7.8L3 17h2l4.5-5.2L14 17h3l-6.1-8.2L17 3h-2l-4.1 4.8L6 3H3Z" fill="currentColor"/>
  </svg>
)
const LI_ICON = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="6" cy="7" r="1.2" fill="currentColor"/>
    <path d="M5 9.5v5M8.5 9.5v5M8.5 12c0-1.4 1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

function getSocials(c: CreatorResponse) {
  return [
    { handle: c.instagramHandle, followers: c.instagramFollowers, icon: IG_ICON, href: (h: string) => `https://instagram.com/${h}` },
    { handle: c.tiktokHandle,    followers: c.tiktokFollowers,    icon: TT_ICON, href: (h: string) => `https://tiktok.com/@${h}` },
    { handle: c.youtubeHandle,   followers: c.youtubeFollowers,   icon: YT_ICON, href: (h: string) => `https://youtube.com/@${h}` },
    { handle: c.facebookHandle,  followers: c.facebookFollowers,  icon: FB_ICON, href: (h: string) => `https://facebook.com/${h}` },
    { handle: c.xHandle,         followers: c.xFollowers,         icon: X_ICON,  href: (h: string) => `https://x.com/${h}` },
    { handle: c.linkedinHandle,  followers: c.linkedinFollowers,  icon: LI_ICON, href: (h: string) => `https://linkedin.com/in/${h}` },
  ].filter(s => s.handle) as { handle: string; followers: number | null; icon: React.ReactNode; href: (h: string) => string }[]
}

function CreatorAvatar({ c, size }: { c: CreatorResponse; size: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-12 h-12 text-base' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-24 h-24 text-3xl'
  const initials = c.name.slice(0, 2).toUpperCase()
  if (c.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={c.avatarUrl}
        alt={c.name}
        className={`${dim} rounded-full object-cover border-2 border-white/15 shrink-0`}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-black text-white select-none shrink-0`}>
      {initials}
    </div>
  )
}

function CreatorCard({ c, onViewProfile }: { c: CreatorResponse; onViewProfile: () => void }) {
  const socials = getSocials(c)
  return (
    <button
      onClick={onViewProfile}
      className="group text-left flex flex-col gap-4 p-5 rounded-2xl border border-white/7 bg-white/2 hover:border-violet-500/30 hover:bg-violet-500/4 transition-all duration-200 w-full"
    >
      <div className="flex items-center gap-3">
        <CreatorAvatar c={c} size="sm" />
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{c.name}</p>
          <p className="text-white/30 text-xs">@{c.slug}</p>
        </div>
      </div>
      {socials.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {socials.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                {s.icon}
                @{s.handle}
              </span>
              {s.followers != null && (
                <span className="text-xs font-semibold text-white/60 tabular-nums">
                  {formatFollowers(s.followers)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

function FeaturedCreatorCard({ c, onViewProfile }: { c: CreatorResponse; onViewProfile: () => void }) {
  const socials = getSocials(c)
  return (
    <button
      onClick={onViewProfile}
      className="group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/6 to-fuchsia-500/3 hover:border-violet-500/35 transition-all duration-200 overflow-hidden w-full"
    >
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 uppercase tracking-wide">
          ✦ Featured
        </span>
      </div>
      <CreatorAvatar c={c} size="md" />
      <div>
        <p className="font-black text-white text-lg">{c.name}</p>
        <p className="text-white/30 text-sm">@{c.slug}</p>
      </div>
      {socials.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {socials.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-white/4 border border-white/8 rounded-lg px-2.5 py-1">
                {s.icon}
                @{s.handle}
              </span>
              {s.followers != null && (
                <span className="text-sm font-bold text-white/70 tabular-nums">
                  {formatFollowers(s.followers)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

export default function CreatorsPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<CreatorResponse | null>(null)
  const modalRef = useRef<HTMLDialogElement>(null)
  const { data: highlighted, isLoading: loadingHighlighted } = useHighlightedCreators()
  const { data, isLoading } = useCreators(page, 12)
  const { t } = useLanguage()

  const totalPages = data ? Math.ceil(data.totalCount / 12) : 1

  function openProfile(c: CreatorResponse) {
    setSelected(c)
    modalRef.current?.showModal()
  }

  const selectedSocials = selected ? getSocials(selected) : []

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-15">

        <section className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-70 bg-violet-600/12 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">{t.creatorsPage.badge}</p>
            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              {t.creatorsPage.title}
            </h1>
            <p className="text-white/40 text-base leading-relaxed">{t.creatorsPage.subtitle}</p>
          </div>
        </section>

        {(loadingHighlighted || (highlighted && highlighted.length > 0)) && (
          <section className="px-6 pb-16 bg-[#08080d]">
            <div className="max-w-6xl mx-auto">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-6">{t.creatorsPage.featuredCreators}</p>
              {loadingHighlighted ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-56 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {highlighted!.map(c => (
                    <FeaturedCreatorCard key={c.id} c={c} onViewProfile={() => openProfile(c)} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="px-6 py-10 pb-24 bg-[#0c0c12] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-6">
              {t.creatorsPage.allCreators} {data ? `· ${data.totalCount}` : ''}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton h-36 rounded-2xl" />
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="py-20 text-center text-white/20 text-sm">{t.creatorsPage.noCreators}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {data!.items.map(c => (
                  <CreatorCard key={c.id} c={c} onViewProfile={() => openProfile(c)} />
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

      {/* Creator profile modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-sm p-0 overflow-hidden">

          {/* Header banner */}
          <div className="relative flex flex-col items-center gap-3 px-6 pt-10 pb-6 bg-linear-to-b from-violet-600/15 to-transparent border-b border-white/6">
            <form method="dialog" className="absolute top-3 right-3">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>

            {selected && <CreatorAvatar c={selected} size="lg" />}

            <div className="text-center">
              <h3 className="font-black text-white text-xl leading-tight">{selected?.name}</h3>
              <p className="text-white/40 text-sm mt-0.5">@{selected?.slug}</p>
              {selected?.isHighlighted && (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 uppercase tracking-wide">
                  ✦ Featured
                </span>
              )}
            </div>
          </div>

          {/* Socials */}
          <div className="px-6 py-5">
            {selectedSocials.length > 0 ? (
              <>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{t.creatorsPage.socials}</p>
                <div className="flex flex-col gap-2">
                  {selectedSocials.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <a
                        href={s.href(s.handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/4 border border-white/8 rounded-xl px-3 py-2 transition-colors min-w-0"
                      >
                        {s.icon}
                        <span className="truncate">@{s.handle}</span>
                      </a>
                      {s.followers != null && (
                        <span className="text-sm font-bold text-white/70 tabular-nums shrink-0">
                          {formatFollowers(s.followers)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-white/25 text-sm text-center py-2">{t.creatorsPage.noSocials}</p>
            )}

            {selected?.createdAt && (
              <p className="text-white/25 text-xs mt-5">
                {t.creatorsPage.memberSince} {formatDate(selected.createdAt)}
              </p>
            )}
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
