'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLanguage } from '@/lib/i18n'
import type { Strings } from '@/lib/i18n'
import {
  PRODUCT_ROTATION_MAX,
  PRODUCT_ROTATION_MIN,
  PRODUCT_SCALE_MAX,
  PRODUCT_SCALE_MIN,
  clamp01,
  computeProductPlacement,
  drawBackground,
  type BackgroundMode,
  type LayoutEditState,
  type LayoutKey,
  type PatternKey,
  type PlatformSize,
  type Vec2,
} from '@/lib/media/social-post-layout'

// Drag handling lives in one small hook so the three overlay layers (product, price, logo)
// share identical pointer-tracking logic instead of each re-implementing it. Each drag gets
// its own pair of move/up closures (function declarations, so they can reference each other
// for cleanup without a forward-reference issue) rather than a shared mutable ref.
function useLayerDrag(containerRef: React.RefObject<HTMLDivElement | null>) {
  return useCallback(
    (e: React.PointerEvent, startPosition: Vec2, onUpdate: (next: Vec2) => void) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const startClientX = e.clientX
      const startClientY = e.clientY

      function handleMove(moveEvent: PointerEvent) {
        const dxFrac = (moveEvent.clientX - startClientX) / rect!.width
        const dyFrac = (moveEvent.clientY - startClientY) / rect!.height
        onUpdate({ x: clamp01(startPosition.x + dxFrac), y: clamp01(startPosition.y + dyFrac) })
      }

      function handleUp() {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [containerRef],
  )
}

const CORNERS: { key: string; position: Vec2 }[] = [
  { key: 'tl', position: { x: 0.16, y: 0.14 } },
  { key: 'tr', position: { x: 0.84, y: 0.14 } },
  { key: 'bl', position: { x: 0.16, y: 0.86 } },
  { key: 'br', position: { x: 0.84, y: 0.86 } },
]

interface PostLayoutCardProps {
  layout: LayoutKey
  labelKey: keyof Strings['socialPostCreator']
  platform: PlatformSize
  transparentUrl: string
  imgWidth: number
  imgHeight: number
  backgroundMode: BackgroundMode
  color: string
  pattern: PatternKey
  logoUrl: string | null
  editState: LayoutEditState
  onChange: (next: LayoutEditState) => void
  onReset: () => void
  downloadUrl: string | undefined
}

export function PostLayoutCard({
  layout,
  labelKey,
  platform,
  transparentUrl,
  imgWidth,
  imgHeight,
  backgroundMode,
  color,
  pattern,
  logoUrl,
  editState,
  onChange,
  onReset,
  downloadUrl,
}: PostLayoutCardProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beginDrag = useLayerDrag(containerRef)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = platform.width
    canvas.height = platform.height
    drawBackground(ctx, platform.width, platform.height, color, backgroundMode === 'pattern' ? pattern : null)
  }, [platform.width, platform.height, color, backgroundMode, pattern])

  const productStyle = useMemo<React.CSSProperties>(() => {
    const placement = computeProductPlacement(layout, platform.width, platform.height, imgWidth, imgHeight, editState.product)
    return {
      left: `${(placement.x / platform.width) * 100}%`,
      top: `${(placement.y / platform.height) * 100}%`,
      width: `${(placement.w / platform.width) * 100}%`,
      height: `${(placement.h / platform.height) * 100}%`,
      maxWidth: 'none',
      transform: `translate(-50%, -50%) rotate(${placement.rotationDeg}deg)`,
    }
  }, [layout, platform.width, platform.height, imgWidth, imgHeight, editState.product])

  function updateProductAnchor(next: Vec2) {
    onChange({ ...editState, product: { ...editState.product, anchor: next } })
  }
  function updatePricePosition(next: Vec2) {
    onChange({ ...editState, price: { ...editState.price, position: next } })
  }
  function updateLogoPosition(next: Vec2) {
    onChange({ ...editState, logo: { ...editState.logo, position: next } })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-white/8 select-none"
        style={{ aspectRatio: `${platform.width} / ${platform.height}`, touchAction: 'none' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={transparentUrl}
          alt=""
          draggable={false}
          onPointerDown={e => beginDrag(e, editState.product.anchor, updateProductAnchor)}
          className="absolute cursor-grab active:cursor-grabbing"
          style={productStyle}
        />

        {editState.price.visible && (
          <div
            onPointerDown={e => beginDrag(e, editState.price.position, updatePricePosition)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing rounded-full bg-black/85 text-white font-extrabold px-3.5 py-1.5 text-sm whitespace-nowrap shadow-lg"
            style={{ left: `${editState.price.position.x * 100}%`, top: `${editState.price.position.y * 100}%` }}
          >
            {editState.price.text}
          </div>
        )}

        {editState.logo.visible && logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            draggable={false}
            onPointerDown={e => beginDrag(e, editState.logo.position, updateLogoPosition)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing rounded-full border-2 border-white/80 shadow-lg object-cover bg-white"
            style={{
              left: `${editState.logo.position.x * 100}%`,
              top: `${editState.logo.position.y * 100}%`,
              width: '12%',
              aspectRatio: '1 / 1',
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-white/50 text-sm font-semibold">{t.socialPostCreator[labelKey]}</span>
          <span className="text-white/25 text-[11px]">{t.socialPostCreator.dragHint}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title={t.socialPostCreator.resetPosition}
            className="btn btn-square h-auto w-9 aspect-square rounded-xl bg-white/4 border-white/8 text-white/40 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M12 7A5 5 0 1 1 10.6 3.4M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href={downloadUrl}
            download={`${platform.key}-${layout}.png`}
            aria-disabled={!downloadUrl}
            className={[
              'btn h-auto rounded-xl px-4 py-2.5 normal-case font-semibold gap-1.5',
              downloadUrl
                ? 'bg-fuchsia-500/15 border-fuchsia-500/25 text-fuchsia-300 hover:bg-fuchsia-500/25'
                : 'bg-white/4 border-white/8 text-white/20 pointer-events-none',
            ].join(' ')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 2v7m0 0 2.5-2.5M7 9 4.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 11.5v.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {t.socialPostCreator.download}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl border border-white/6 bg-white/[0.015] p-3">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs w-11 shrink-0">{t.socialPostCreator.sizeLabel}</span>
          <input
            type="range"
            min={PRODUCT_SCALE_MIN}
            max={PRODUCT_SCALE_MAX}
            step={0.05}
            value={editState.product.scale}
            onChange={e => onChange({ ...editState, product: { ...editState.product, scale: Number(e.target.value) } })}
            className="range range-xs flex-1 accent-fuchsia-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs w-11 shrink-0">{t.socialPostCreator.rotateLabel}</span>
          <input
            type="range"
            min={PRODUCT_ROTATION_MIN}
            max={PRODUCT_ROTATION_MAX}
            step={1}
            value={editState.product.rotationDeg}
            onChange={e => onChange({ ...editState, product: { ...editState.product, rotationDeg: Number(e.target.value) } })}
            className="range range-xs flex-1 accent-fuchsia-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/6 bg-white/[0.015] p-3">
        <label className="flex items-center gap-2 text-xs text-white/50">
          <input
            type="checkbox"
            checked={editState.price.visible}
            onChange={e => onChange({ ...editState, price: { ...editState.price, visible: e.target.checked } })}
            className="checkbox checkbox-xs checkbox-secondary"
          />
          {t.socialPostCreator.priceLabel}
        </label>
        {editState.price.visible && (
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={editState.price.text}
              onChange={e => onChange({ ...editState, price: { ...editState.price, text: e.target.value } })}
              placeholder={t.socialPostCreator.pricePlaceholder}
              className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60 flex-1 min-w-0"
            />
            {CORNERS.map(corner => (
              <button
                key={corner.key}
                onClick={() => updatePricePosition(corner.position)}
                className="btn btn-xs h-auto rounded-md px-2 py-1 bg-white/4 border-white/8 text-white/40 hover:text-white"
              >
                {corner.key.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <label className={['flex items-center gap-2 text-xs', logoUrl ? 'text-white/50' : 'text-white/20'].join(' ')}>
          <input
            type="checkbox"
            checked={editState.logo.visible}
            disabled={!logoUrl}
            onChange={e => onChange({ ...editState, logo: { ...editState.logo, visible: e.target.checked } })}
            className="checkbox checkbox-xs checkbox-secondary"
          />
          {t.socialPostCreator.logoLabel}
        </label>
        {!logoUrl && <p className="text-[11px] text-white/20">{t.socialPostCreator.noLogo}</p>}
        {editState.logo.visible && logoUrl && (
          <div className="flex flex-wrap items-center gap-1.5">
            {CORNERS.map(corner => (
              <button
                key={corner.key}
                onClick={() => updateLogoPosition(corner.position)}
                className="btn btn-xs h-auto rounded-md px-2 py-1 bg-white/4 border-white/8 text-white/40 hover:text-white"
              >
                {corner.key.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
