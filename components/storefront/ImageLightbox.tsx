'use client'

import { useEffect, useState } from 'react'
import { CImg } from '@/components/ui/CImg'

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
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && images.length > 1) onIndexChange((activeIndex + 1) % images.length)
      if (e.key === 'ArrowLeft' && images.length > 1) onIndexChange((activeIndex - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, images.length, onIndexChange, onClose])

  function handleMouseMove(e: React.MouseEvent<HTMLImageElement>) {
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

      {images.length > 1 && (
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

      <CImg
        src={active.url}
        alt=""
        draggable={false}
        onClick={e => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out cursor-zoom-in select-none"
        style={{ transform: zoomed ? 'scale(2)' : 'scale(1)', transformOrigin: `${origin.x}% ${origin.y}%` }}
      />

      {images.length > 1 && (
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
