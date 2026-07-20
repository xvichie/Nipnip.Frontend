'use client'

import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import type { Strings } from '@/lib/i18n'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'
import { withBackgroundRemoved } from '@/lib/media/cloudinary-transform'

interface PlatformSize {
  key: string
  labelKey: keyof Strings['socialPostCreator']
  width: number
  height: number
}

// Widely-recommended current sizes per platform. Product Page matches this app's own
// storefront product-card convention (aspect-square).
const PLATFORM_SIZES: PlatformSize[] = [
  { key: 'facebook', labelKey: 'platformFacebook', width: 1200, height: 630 },
  { key: 'instagram-post', labelKey: 'platformInstagramPost', width: 1080, height: 1080 },
  { key: 'instagram-story', labelKey: 'platformInstagramStory', width: 1080, height: 1920 },
  { key: 'tiktok', labelKey: 'platformTiktok', width: 1080, height: 1920 },
  { key: 'product-page', labelKey: 'platformProductPage', width: 1200, height: 1200 },
]

type LayoutKey = 'centered' | 'rotated' | 'bottom-crop'

const LAYOUTS: { key: LayoutKey; labelKey: keyof Strings['socialPostCreator'] }[] = [
  { key: 'centered', labelKey: 'layoutCentered' },
  { key: 'rotated', labelKey: 'layoutRotated' },
  { key: 'bottom-crop', labelKey: 'layoutBottomCrop' },
]

type BackgroundMode = 'solid' | 'pattern'
type PatternKey = 'dots' | 'stripes' | 'grid'

const COLOR_PRESETS = ['#ffffff', '#0a0a0a', '#f5efe6', '#fbd5df', '#cfe8ff', '#d9ead3', '#e8ddc8', '#1b2a4a']

const PATTERNS: { key: PatternKey; labelKey: keyof Strings['socialPostCreator'] }[] = [
  { key: 'dots', labelKey: 'patternDots' },
  { key: 'stripes', labelKey: 'patternStripes' },
  { key: 'grid', labelKey: 'patternGrid' },
]

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #2a2a34 25%, transparent 25%), linear-gradient(-45deg, #2a2a34 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a34 75%), linear-gradient(-45deg, transparent 75%, #2a2a34 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
}

interface GeneratedImage {
  platformKey: string
  layoutKey: LayoutKey
  dataUrl: string
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, pattern: PatternKey | null) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  if (!pattern) return

  const accent = isLightColor(color) ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.10)'

  if (pattern === 'dots') {
    const spacing = Math.max(28, Math.round(w / 20))
    const radius = spacing * 0.1
    ctx.fillStyle = accent
    for (let y = spacing / 2; y < h; y += spacing) {
      for (let x = spacing / 2; x < w; x += spacing) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (pattern === 'stripes') {
    const spacing = Math.max(32, Math.round(w / 16))
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, w, h)
    ctx.clip()
    ctx.strokeStyle = accent
    ctx.lineWidth = spacing * 0.45
    for (let x = -h; x < w + h; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + h, h)
      ctx.stroke()
    }
    ctx.restore()
  } else if (pattern === 'grid') {
    const spacing = Math.max(36, Math.round(w / 14))
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    for (let x = 0; x <= w; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += spacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }
}

function drawCentered(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const maxW = w * 0.72
  const maxH = h * 0.72
  const scale = Math.min(maxW / img.width, maxH / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

// Scaled down further than "centered" so the diagonal footprint (~1.41x a square's side)
// still clears the frame after rotating.
function drawRotated(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const maxW = w * 0.5
  const maxH = h * 0.5
  const scale = Math.min(maxW / img.width, maxH / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((-45 * Math.PI) / 180)
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

// Crops off the top 25% of the source (e.g. collar/shoulders on a garment shot), then scales
// the remaining bottom 75% to fully cover the frame — a close-up, zoomed-in crop.
function drawBottomCrop(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const cropTop = img.height * 0.25
  const cropHeight = img.height - cropTop
  const destAspect = w / h
  const cropAspect = img.width / cropHeight

  let sx = 0
  let sy = cropTop
  let sWidth = img.width
  let sHeight = cropHeight

  if (cropAspect > destAspect) {
    sWidth = cropHeight * destAspect
    sx = (img.width - sWidth) / 2
  } else {
    sHeight = img.width / destAspect
    sy = img.height - sHeight
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h)
}

function drawLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, layout: LayoutKey) {
  if (layout === 'centered') drawCentered(ctx, img, w, h)
  else if (layout === 'rotated') drawRotated(ctx, img, w, h)
  else drawBottomCrop(ctx, img, w, h)
}

export default function SocialPostCreatorPage() {
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)

  const [transparentUrl, setTransparentUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [removingBg, setRemovingBg] = useState(false)
  const [error, setError] = useState('')

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('solid')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [pattern, setPattern] = useState<PatternKey>('dots')

  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<GeneratedImage[]>([])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setResults([])
    setTransparentUrl('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setRemovingBg(true)
      setTransparentUrl(withBackgroundRemoved(url))
    } catch {
      setError(t.socialPostCreator.uploadError)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleGenerate() {
    if (!transparentUrl) return
    setError('')
    setGenerating(true)
    setResults([])
    try {
      const img = await loadImage(transparentUrl)
      const next: GeneratedImage[] = []
      for (const platform of PLATFORM_SIZES) {
        for (const layout of LAYOUTS) {
          const canvas = document.createElement('canvas')
          canvas.width = platform.width
          canvas.height = platform.height
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          drawBackground(ctx, platform.width, platform.height, color, backgroundMode === 'pattern' ? pattern : null)
          drawLayout(ctx, img, platform.width, platform.height, layout.key)
          next.push({ platformKey: platform.key, layoutKey: layout.key, dataUrl: canvas.toDataURL('image/png') })
        }
      }
      setResults(next)
    } catch {
      setError(t.socialPostCreator.uploadError)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.sidebar.socialPostCreator}</h1>
        <p className="text-white/40 text-sm mt-1">{t.socialPostCreator.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        {!cloudinaryConfigured ? (
          <p className="text-amber-400/80 text-xs">
            Cloudinary is not configured — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local
          </p>
        ) : (
          <label className="relative flex flex-col items-center justify-center gap-2 h-32 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.25] transition-colors cursor-pointer">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            {uploading ? (
              <span className="loading loading-spinner loading-md text-fuchsia-400" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-white/25">
                  <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 14v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-white/30 text-sm">{t.socialPostCreator.uploadPrompt}</span>
              </>
            )}
          </label>
        )}

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {transparentUrl && (
          <div className="flex items-center gap-4">
            <div className="rounded-xl overflow-hidden border border-white/8 w-28 h-28 shrink-0" style={CHECKERBOARD_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={transparentUrl}
                alt=""
                className="w-full h-full object-contain"
                onLoad={() => setRemovingBg(false)}
                onError={() => {
                  setRemovingBg(false)
                  setError(t.socialPostCreator.uploadError)
                }}
              />
            </div>
            {removingBg && (
              <span className="flex items-center gap-2 text-white/40 text-sm">
                <span className="loading loading-spinner loading-sm" />
                {t.socialPostCreator.removingBackground}
              </span>
            )}
          </div>
        )}
      </div>

      {transparentUrl && !removingBg && (
        <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
          <p className="text-white/40 text-xs uppercase tracking-widest">{t.socialPostCreator.backgroundLabel}</p>

          <div className="flex gap-2">
            <button
              onClick={() => setBackgroundMode('solid')}
              className={[
                'btn btn-sm h-auto rounded-xl px-4 normal-case font-semibold',
                backgroundMode === 'solid'
                  ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                  : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
              ].join(' ')}
            >
              {t.socialPostCreator.solid}
            </button>
            <button
              onClick={() => setBackgroundMode('pattern')}
              className={[
                'btn btn-sm h-auto rounded-xl px-4 normal-case font-semibold',
                backgroundMode === 'pattern'
                  ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                  : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
              ].join(' ')}
            >
              {t.socialPostCreator.pattern}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => setColor(preset)}
                aria-label={preset}
                style={{ background: preset }}
                className={[
                  'w-8 h-8 rounded-lg border-2 transition-transform',
                  color === preset ? 'border-fuchsia-400 scale-110' : 'border-white/15 hover:scale-105',
                ].join(' ')}
              />
            ))}
            <label
              className="relative w-8 h-8 rounded-lg border-2 border-dashed border-white/25 hover:border-white/40 cursor-pointer flex items-center justify-center overflow-hidden"
              title={t.socialPostCreator.customColor}
            >
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-white/40 pointer-events-none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </label>
          </div>

          {backgroundMode === 'pattern' && (
            <div className="flex flex-wrap gap-2">
              {PATTERNS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPattern(p.key)}
                  className={[
                    'btn btn-xs h-auto rounded-lg px-3 normal-case font-medium',
                    pattern === p.key
                      ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                      : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {t.socialPostCreator[p.labelKey]}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn h-auto rounded-xl px-4 bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30 disabled:opacity-40 normal-case font-semibold self-start gap-2"
          >
            {generating && <span className="loading loading-spinner loading-sm" />}
            {generating ? t.socialPostCreator.generating : t.socialPostCreator.generate}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-6">
          {PLATFORM_SIZES.map(platform => (
            <div key={platform.key} className="flex flex-col gap-3">
              <p className="font-bold text-white text-sm">
                {t.socialPostCreator[platform.labelKey]}
                <span className="text-white/30 font-normal ml-2">{platform.width}×{platform.height}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LAYOUTS.map(layout => {
                  const item = results.find(r => r.platformKey === platform.key && r.layoutKey === layout.key)
                  if (!item) return null
                  return (
                    <div key={layout.key} className="flex flex-col gap-2">
                      <div className="rounded-xl overflow-hidden border border-white/8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.dataUrl} alt="" className="w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/40 text-xs">{t.socialPostCreator[layout.labelKey]}</span>
                        <a
                          href={item.dataUrl}
                          download={`${platform.key}-${layout.key}.png`}
                          className="btn btn-xs h-auto rounded-lg px-3 bg-fuchsia-500/15 border-fuchsia-500/25 text-fuchsia-300 hover:bg-fuchsia-500/25 normal-case font-semibold"
                        >
                          {t.socialPostCreator.download}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
