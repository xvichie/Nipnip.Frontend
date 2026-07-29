'use client'

import type { CSSProperties } from 'react'
import { useFeaturedStores } from '@/lib/queries/merchants'
import { getStoreOrigin, getStoreUrl } from '@/lib/store/seo'
import type { MerchantResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

export function StoreLogo({ m }: { m: MerchantResponse }) {
  const initials = m.name.slice(0, 2).toUpperCase()

  if (m.logoUrl) {
    // Admin-set backdrop (color or image) behind the logo — most useful for transparent-PNG
    // logos that would otherwise be invisible against the card's own dark background.
    const hasCustomBackground = !!(m.logoBackgroundImageUrl || m.logoBackgroundColor)
    const backgroundStyle: CSSProperties = m.logoBackgroundImageUrl
      ? { backgroundImage: `url(${m.logoBackgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : m.logoBackgroundColor
        ? { backgroundColor: m.logoBackgroundColor }
        : {}

    return (
      <div
        className={`w-14 h-14 rounded-2xl border border-white/10 shrink-0 flex items-center justify-center overflow-hidden ${hasCustomBackground ? '' : 'bg-white/5'}`}
        style={backgroundStyle}
      >
        <CImg
          src={m.logoUrl}
          cldWidth={112}
          alt={m.name}
          className="w-full h-full object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-black text-lg text-violet-300 select-none shrink-0">
      {initials}
    </div>
  )
}

// A plain, static showcase of real stores built on NipNip — unlike FeaturedMerchantsCarousel
// (which powers affiliate/creator discovery and is driven by a separate IsHighlighted flag,
// gated on the store having affiliate tracking enabled), this only cares whether an admin has
// marked the store IsFeaturedStore. No commission %, no creator-signup modal — just a link
// straight to each live storefront.
export function FeaturedStoresGrid() {
  const { data: merchants, isLoading } = useFeaturedStores()
  const items = merchants ?? []

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
    <div className="flex gap-4 overflow-x-auto px-6 pb-2 -mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map(m => (
        <a
          key={m.id}
          href={m.storeSlug ? getStoreUrl(m.storeSlug, '', m.storeCustomDomain) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-64 flex flex-col gap-4 p-5 rounded-2xl border border-white/7 bg-white/2 hover:border-violet-500/30 hover:bg-violet-500/4 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <StoreLogo m={m} />
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{m.name}</p>
              {m.storeSlug && (
                <p className="text-white/30 text-xs truncate">
                  {getStoreOrigin(m.storeSlug, m.storeCustomDomain).replace(/^https?:\/\//, '')}
                </p>
              )}
            </div>
          </div>
          {m.description && (
            <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{m.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-semibold text-violet-400">ნახე მაღაზია</span>
            <span className="text-xs font-semibold text-violet-400">↗</span>
          </div>
        </a>
      ))}
    </div>
  )
}
