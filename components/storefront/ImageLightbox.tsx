'use client'

import { useEffect, useRef, useState } from 'react'
import { CImg } from '@/components/ui/CImg'

const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const DOUBLE_TAP_WINDOW_MS = 300

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

// Keeps the image from panning past its own edges — the further zoomed in, the more slack
// there is to pan, in exact proportion to how much of the image now overflows the viewport.
function clampPan(x: number, y: number, scale: number, rect: DOMRect): { x: number; y: number } {
  const maxX = (rect.width * (scale - 1)) / 2
  const maxY = (rect.height * (scale - 1)) / 2
  return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) }
}

export function ImageLightbox({
  images,
  activeIndex,
  onIndexChange,
  onClose,
}: {
  images: { id: string; url: string }[]
  activeIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  // Touch pinch/double-tap/pan zoom state (mobile) — independent from the hover-lens state
  // below (desktop), since a touch device firing synthetic mouse events after a tap was
  // exactly what made the old hover-only implementation feel broken there.
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isTouchZoomed = scale > 1.01

  // Desktop hover-lens zoom state — only ever engaged when supportsHover is true.
  const [supportsHover, setSupportsHover] = useState(false)
  const [hoverZoomed, setHoverZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const containerRef = useRef<HTMLDivElement>(null)
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; startPan: { x: number; y: number } } | null>(null)
  const lastTapRef = useRef(0)

  useEffect(() => {
    setSupportsHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  // Reset zoom/pan whenever the active image changes, so swiping to the next photo never
  // carries over a stale zoom level onto an image the shopper hasn't zoomed themselves.
  useEffect(() => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }, [activeIndex])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && images.length > 1) onIndexChange((activeIndex + 1) % images.length)
      if (e.key === 'ArrowLeft' && images.length > 1) onIndexChange((activeIndex - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, images.length, onIndexChange, onClose])

  function zoomToPoint(tapX: number, tapY: number, rect: DOMRect, targetScale: number) {
    const dx = (rect.width / 2 - tapX) * (targetScale - 1)
    const dy = (rect.height / 2 - tapY) * (targetScale - 1)
    setScale(targetScale)
    setPan(clampPan(dx, dy, targetScale, rect))
  }

  // Touch handlers are attached manually (not via JSX props) with { passive: false } — React
  // registers JSX touch handlers as passive by default, so e.preventDefault() inside them
  // silently fails to stop the page's own scroll/zoom, which is exactly what a pinch or pan
  // gesture here needs to suppress.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchRef.current = { startDistance: touchDistance(e.touches[0], e.touches[1]), startScale: scale }
      } else if (e.touches.length === 1) {
        if (scale > 1.01) {
          panRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, startPan: pan }
        } else {
          const now = Date.now()
          if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
            const rect = el!.getBoundingClientRect()
            zoomToPoint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top, rect, DOUBLE_TAP_SCALE)
            lastTapRef.current = 0
          } else {
            lastTapRef.current = now
          }
        }
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const ratio = touchDistance(e.touches[0], e.touches[1]) / pinchRef.current.startDistance
        setScale(clamp(pinchRef.current.startScale * ratio, 1, MAX_SCALE))
      } else if (e.touches.length === 1 && panRef.current) {
        e.preventDefault()
        const rect = el!.getBoundingClientRect()
        const dx = e.touches[0].clientX - panRef.current.startX
        const dy = e.touches[0].clientY - panRef.current.startY
        setPan(clampPan(panRef.current.startPan.x + dx, panRef.current.startPan.y + dy, scale, rect))
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinchRef.current = null
      if (e.touches.length === 0) {
        panRef.current = null
        setScale(s => {
          if (s < 1.05) {
            setPan({ x: 0, y: 0 })
            return 1
          }
          return s
        })
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('touchcancel', handleTouchEnd)
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [scale, pan])

  function handleMouseMove(e: React.MouseEvent<HTMLImageElement>) {
    if (!supportsHover) return
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const active = images[activeIndex]
  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="დახურვა"
        className="absolute z-10 top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {images.length > 1 && !isTouchZoomed && (
        <>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onIndexChange((activeIndex - 1 + images.length) % images.length) }}
            aria-label="წინა სურათი"
            className="absolute z-10 left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M12.5 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onIndexChange((activeIndex + 1) % images.length) }}
            aria-label="შემდეგი სურათი"
            className="absolute z-10 right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M7.5 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
      >
        <CImg
          src={active.url}
          alt=""
          draggable={false}
          onClick={e => e.stopPropagation()}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => supportsHover && setHoverZoomed(true)}
          onMouseLeave={() => supportsHover && setHoverZoomed(false)}
          className={`max-w-full max-h-full object-contain select-none ${supportsHover ? 'cursor-zoom-in transition-transform duration-200 ease-out' : ''}`}
          style={
            supportsHover
              ? { transform: hoverZoomed ? 'scale(2)' : 'scale(1)', transformOrigin: `${origin.x}% ${origin.y}%` }
              : { transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'center center' }
          }
        />
      </div>

      {images.length > 1 && !isTouchZoomed && (
        <div className="absolute z-10 bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={e => { e.stopPropagation(); onIndexChange(i) }}
              aria-label={`სურათი ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
