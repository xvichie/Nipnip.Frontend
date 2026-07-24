'use client'

import { useEffect, useState, type ReactNode } from 'react'

const AUTO_ADVANCE_MS = 6000

// Takes already fully-rendered slide content (one theme-specific hero section per slide,
// built server-side) and only owns which one is visible + auto-advance timing — no data
// fetching or re-render of slide content happens in here. With one slide or fewer it renders
// that slide directly with no carousel chrome at all, so a store with no configured slides is
// unaffected.
export function HeroCarousel({ slides }: { slides: ReactNode[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const interval = setInterval(() => setActiveIndex(i => (i + 1) % slides.length), AUTO_ADVANCE_MS)
    return () => clearInterval(interval)
  }, [slides.length, paused])

  if (slides.length <= 1) return <>{slides[0] ?? null}</>

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((slide, i) => (
        <div key={i} className={i === activeIndex ? '' : 'hidden'}>
          {slide}
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`სლაიდი ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  )
}
