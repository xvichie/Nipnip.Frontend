'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useHighlightedMerchants } from '@/lib/queries/merchants'
import { useCreatorMe } from '@/lib/queries/creators'
import { useLanguage } from '@/lib/i18n'
import type { MerchantResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function MerchantLogo({ m, size }: { m: MerchantResponse; size: 'sm' | 'lg' }) {
  const initials = m.name.slice(0, 2).toUpperCase()
  const dim = size === 'sm' ? 'w-11 h-11 text-sm' : 'w-24 h-24 text-3xl'
  if (m.logoUrl) {
    return (
      <div className={`${dim} rounded-2xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden`}>
        <CImg
          src={m.logoUrl}
          cldWidth={size === 'sm' ? 88 : 192}
          alt={m.name}
          className="w-full h-full object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div className={`${dim} rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/20 flex items-center justify-center font-black text-fuchsia-400 select-none shrink-0`}>
      {initials}
    </div>
  )
}

function CarouselCard({ m, onOpen }: { m: MerchantResponse; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="shrink-0 w-64 text-left flex flex-col gap-4 p-5 rounded-2xl border border-white/7 bg-white/2 hover:border-violet-500/30 hover:bg-violet-500/4 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <MerchantLogo m={m} size="sm" />
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{m.name}</p>
          <p className="text-white/30 text-xs">/{m.slug}</p>
        </div>
      </div>
      {m.description && (
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{m.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-black text-fuchsia-400 tabular-nums">{m.commissionPercent}%</span>
        <span className="text-xs font-semibold text-violet-400">
          ↗
        </span>
      </div>
    </button>
  )
}

export function FeaturedMerchantsCarousel() {
  const { data: merchants, isLoading } = useHighlightedMerchants()
  const { isSignedIn } = useAuth()
  const { data: creator } = useCreatorMe()
  const router = useRouter()
  const { t } = useLanguage()

  const trackRef = useRef<HTMLDivElement>(null)
  const profileModalRef = useRef<HTMLDialogElement>(null)
  const linkModalRef = useRef<HTMLDialogElement>(null)
  const signInModalRef = useRef<HTMLDialogElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState<MerchantResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  const items = merchants ?? []

  const trackingUrl = selected && creator
    ? `${window.location.origin}/${creator.slug}/${selected.slug}`
    : ''

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    function checkOverflow() {
      if (!track) return
      setOverflowing(track.scrollWidth > track.clientWidth + 1)
    }
    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(track)
    return () => observer.disconnect()
  }, [items.length])

  useEffect(() => {
    if (!overflowing || items.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % items.length)
    }, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [items.length, overflowing])

  useEffect(() => {
    if (!trackRef.current || items.length === 0) return
    const card = trackRef.current.children[activeIndex] as HTMLElement
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex, items.length])

  function openProfile(merchant: MerchantResponse) {
    setSelected(merchant)
    setCopied(false)
    profileModalRef.current?.showModal()
  }

  function openLink() {
    if (!isSignedIn) {
      profileModalRef.current?.close()
      signInModalRef.current?.showModal()
      return
    }
    if (!creator) { router.push('/onboarding'); return }
    profileModalRef.current?.close()
    linkModalRef.current?.showModal()
  }

  async function copyLink() {
    if (!trackingUrl) return
    await navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-64 h-40 skeleton rounded-2xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-linear-to-r from-[#08080d] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-linear-to-l from-[#08080d] to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scrollbar-none px-16 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((m, i) => (
            <CarouselCard
              key={`${m.id}-${i}`}
              m={m}
              onOpen={() => openProfile(m)}
            />
          ))}
        </div>

        {overflowing && items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i)
                  if (intervalRef.current) clearInterval(intervalRef.current)
                }}
                className={[
                  'h-1 rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/15 hover:bg-white/30',
                ].join(' ')}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

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
              onClick={openLink}
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
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Sign-in required modal */}
      <dialog ref={signInModalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-xs p-0 overflow-hidden">
          <div className="flex flex-col items-center gap-4 px-6 pt-10 pb-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                <rect x="4" y="10" width="14" height="10" rx="2.5" stroke="#a78bfa" strokeWidth="1.6"/>
                <path d="M7 10V7a4 4 0 0 1 8 0v3" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="11" cy="15" r="1.5" fill="#a78bfa"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-white text-lg leading-tight">{t.signInRequired.title}</h3>
              <p className="text-white/45 text-sm mt-1.5 leading-relaxed">{t.signInRequired.body}</p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-1">
              <button
                onClick={() => { signInModalRef.current?.close(); router.push('/sign-in') }}
                className="btn w-full bg-violet-600 hover:bg-violet-500 border-violet-600 hover:border-violet-500 text-white rounded-xl normal-case font-semibold"
              >
                {t.signInRequired.cta}
              </button>
              <form method="dialog">
                <button className="btn w-full bg-white/4 border-white/8 text-white/60 hover:text-white rounded-xl normal-case">
                  {t.common.close}
                </button>
              </form>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Link modal */}
      <dialog ref={linkModalRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-md p-0 overflow-hidden">

          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {selected && <MerchantLogo m={selected} size="sm" />}
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">{selected?.name}</h3>
                <p className="text-white/35 text-xs">{t.carousel.forBrand}</p>
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
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{t.carousel.trackingLinkLabel}</p>
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

            <p className="text-white/25 text-xs leading-relaxed">{t.carousel.modalHint}</p>

            <form method="dialog">
              <button className="btn w-full bg-white/4 border-white/8 text-white/60 hover:text-white rounded-xl normal-case">
                {t.common.close}
              </button>
            </form>
          </div>

        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </>
  )
}
