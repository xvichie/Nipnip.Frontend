'use client'

import type { StorefrontStrings } from '@/lib/storefront-i18n'

const THUMB_CLASSES = [
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--thumb)] [&::-webkit-slider-thumb]:border-2',
  '[&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-webkit-slider-thumb]:pointer-events-auto',
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
  '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--thumb)] [&::-moz-range-thumb]:border-2',
  '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer',
  '[&::-moz-range-thumb]:pointer-events-auto',
].join(' ')

export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
  accentColor,
  t,
  valueClassName,
  trackColorClassName = 'bg-black/10',
  labelClassName = '',
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  accentColor: string
  t: StorefrontStrings
  valueClassName: string
  trackColorClassName?: string
  labelClassName?: string
}) {
  const [lo, hi] = value
  const span = max - min || 1

  function setLo(next: number) {
    onChange([Math.min(Math.max(next, min), hi), hi])
  }

  function setHi(next: number) {
    onChange([lo, Math.max(Math.min(next, max), lo)])
  }

  if (min >= max) return null

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${labelClassName}`}>{t.grid.priceLabel}</span>
        <span className={`text-xs font-medium truncate ${valueClassName}`}>₾{Math.round(lo)} – ₾{Math.round(hi)}</span>
      </div>
      {/* Horizontal padding here — not on the inputs below — reserves room for the
          round thumbs (half their width) so they stay inside this box at the 0%/100%
          extremes instead of bleeding past it. */}
      <div className="px-2">
        <div className="relative h-4 flex items-center">
          <div className={`absolute inset-x-0 h-[3px] rounded-full ${trackColorClassName}`} />
          <div
            className="absolute h-[3px] rounded-full"
            style={{
              left: `${((lo - min) / span) * 100}%`,
              right: `${100 - ((hi - min) / span) * 100}%`,
              backgroundColor: accentColor,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={lo}
            onChange={e => setLo(Number(e.target.value))}
            style={{ '--thumb': accentColor } as React.CSSProperties}
            className={`absolute inset-x-0 w-full h-4 appearance-none bg-transparent pointer-events-none focus:outline-none ${THUMB_CLASSES}`}
            aria-label={t.grid.minPriceAriaLabel}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={hi}
            onChange={e => setHi(Number(e.target.value))}
            style={{ '--thumb': accentColor } as React.CSSProperties}
            className={`absolute inset-x-0 w-full h-4 appearance-none bg-transparent pointer-events-none focus:outline-none ${THUMB_CLASSES}`}
            aria-label={t.grid.maxPriceAriaLabel}
          />
        </div>
      </div>
    </div>
  )
}
