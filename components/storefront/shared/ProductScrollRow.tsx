'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'

// Generic horizontally-scrolling row — scroll mechanics (overflow detection, chevron nav)
// extracted from FeaturedMerchantsCarousel, minus its merchant-specific modal/copy-link logic.
// Callers (every theme's Home.tsx, a Server Component) must pass already-rendered nodes rather
// than a renderItem/keyOf callback pair — passing a plain function as a prop from a Server
// Component into this Client Component isn't serializable and throws at runtime the moment
// `items` is ever non-empty (e.g. once a merchant's first collection actually has products).
export function ProductScrollRow({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  titleClassName = 'font-black text-2xl tracking-tight',
  viewAllClassName = 'text-xs font-medium underline underline-offset-4',
  emptyMessageClassName = 'text-sm py-16 text-center',
  viewAllStyle,
}: {
  title: string
  viewAllHref?: string
  viewAllLabel?: string
  items: { key: string; node: ReactNode }[]
  titleClassName?: string
  viewAllClassName?: string
  emptyMessageClassName?: string
  viewAllStyle?: CSSProperties
}) {
  const { t } = useStorefrontLanguage()
  const resolvedViewAllLabel = viewAllLabel ?? t.home.viewAll
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)

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

  function scrollBy(direction: -1 | 1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (items.length === 0) {
    return <p className={emptyMessageClassName}>{t.home.emptyRowMessage}</p>
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h2 className={titleClassName}>{title}</h2>
        {viewAllHref && (
          <a href={viewAllHref} className={viewAllClassName} style={viewAllStyle}>{resolvedViewAllLabel}</a>
        )}
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => (
            <div key={item.key} className="shrink-0">
              {item.node}
            </div>
          ))}
        </div>

        {overflowing && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={t.home.scrollLeftAriaLabel}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white shadow-lg border border-black/10 text-black/60 hover:text-black transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M8.5 2.5 3.5 7l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t.home.scrollRightAriaLabel}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white shadow-lg border border-black/10 text-black/60 hover:text-black transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5.5 2.5 10.5 7l-5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
