'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

// Generic horizontally-scrolling row — scroll mechanics (overflow detection, chevron nav)
// extracted from FeaturedMerchantsCarousel, minus its merchant-specific modal/copy-link logic.
// Visual styling of each item is left entirely to the caller's renderItem, so it fits any
// storefront theme's own color palette.
export function ProductScrollRow<T>({
  title,
  viewAllHref,
  viewAllLabel = 'ყველას ნახვა →',
  items,
  renderItem,
  keyOf,
  titleClassName = 'font-black text-2xl tracking-tight',
  viewAllClassName = 'text-xs font-medium underline underline-offset-4',
  emptyMessageClassName = 'text-sm py-16 text-center',
  viewAllStyle,
}: {
  title: string
  viewAllHref?: string
  viewAllLabel?: string
  items: T[]
  renderItem: (item: T) => ReactNode
  keyOf: (item: T) => string
  titleClassName?: string
  viewAllClassName?: string
  emptyMessageClassName?: string
  viewAllStyle?: CSSProperties
}) {
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
    return <p className={emptyMessageClassName}>ჯერ არაფერია დამატებული.</p>
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h2 className={titleClassName}>{title}</h2>
        {viewAllHref && (
          <a href={viewAllHref} className={viewAllClassName} style={viewAllStyle}>{viewAllLabel}</a>
        )}
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => (
            <div key={keyOf(item)} className="shrink-0">
              {renderItem(item)}
            </div>
          ))}
        </div>

        {overflowing && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 items-center justify-center rounded-full bg-white shadow-lg border border-black/10 text-black/60 hover:text-black transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M8.5 2.5 3.5 7l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
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
