'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'
import type { Strings } from '@/lib/i18n'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'
import { withBackgroundRemoved } from '@/lib/media/cloudinary-transform'
import Link from 'next/link'
import { useMerchantMe } from '@/lib/queries/merchants'
import { PRODUCT_IMPORT_STORAGE_KEY, type ProductImportData } from '@/lib/productImport'
import { useTikTokPublishImages, useTikTokStatus } from '@/lib/queries/tiktok'
import { PostLayoutCard } from '@/components/dashboard/media/PostLayoutCard'
import {
  COLOR_PRESETS,
  LAYOUT_KEYS,
  PLATFORM_SIZES,
  drawBackground,
  drawLogoBadge,
  drawPriceBadge,
  drawProductLayout,
  makeDefaultLayoutEditState,
  type BackgroundMode,
  type LayoutEditState,
  type LayoutKey,
  type PatternKey,
} from '@/lib/media/social-post-layout'

const LAYOUT_LABEL_KEYS: Record<LayoutKey, keyof Strings['socialPostCreator']> = {
  centered: 'layoutCentered',
  rotated: 'layoutRotated',
  'bottom-crop': 'layoutBottomCrop',
}

const PLATFORM_LABEL_KEYS: Record<string, keyof Strings['socialPostCreator']> = {
  facebook: 'platformFacebook',
  'instagram-post': 'platformInstagramPost',
  'instagram-story': 'platformInstagramStory',
  tiktok: 'platformTiktok',
  'product-page': 'platformProductPage',
}

const PATTERNS: { key: PatternKey; labelKey: keyof Strings['socialPostCreator'] }[] = [
  { key: 'dots', labelKey: 'patternDots' },
  { key: 'stripes', labelKey: 'patternStripes' },
  { key: 'grid', labelKey: 'patternGrid' },
  { key: 'checkerboard', labelKey: 'patternCheckerboard' },
  { key: 'waves', labelKey: 'patternWaves' },
]

const DEFAULT_PRICE_TEXT = '29.99 ₾'

// Redrawing is cheap client-side canvas work, but the native color input fires on every
// pixel of drag — debounce so it doesn't redraw 3 canvases hundreds of times a second.
const REGEN_DEBOUNCE_MS = 120

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #2a2a34 25%, transparent 25%), linear-gradient(-45deg, #2a2a34 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a34 75%), linear-gradient(-45deg, transparent 75%, #2a2a34 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], filename, { type: 'image/png' })
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

function makeDefaultEditStateMap(): Record<LayoutKey, LayoutEditState> {
  return {
    centered: makeDefaultLayoutEditState(DEFAULT_PRICE_TEXT),
    rotated: makeDefaultLayoutEditState(DEFAULT_PRICE_TEXT),
    'bottom-crop': makeDefaultLayoutEditState(DEFAULT_PRICE_TEXT),
  }
}

export default function SocialPostCreatorPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const loadedImageRef = useRef<HTMLImageElement | null>(null)
  const loadedLogoImageRef = useRef<HTMLImageElement | null>(null)

  const { data: merchant } = useMerchantMe()
  const logoUrl = merchant?.logoUrl ?? null

  const [transparentUrl, setTransparentUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [removingBg, setRemovingBg] = useState(false)
  const [error, setError] = useState('')

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('solid')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [pattern, setPattern] = useState<PatternKey>('dots')

  const [selectedPlatformKey, setSelectedPlatformKey] = useState(PLATFORM_SIZES[0].key)
  const [editStateMap, setEditStateMap] = useState<Record<LayoutKey, LayoutEditState>>(makeDefaultEditStateMap)
  const [previews, setPreviews] = useState<Partial<Record<LayoutKey, string>>>({})
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null)

  const { data: ttStatus } = useTikTokStatus()
  const { mutate: publishTiktokImages, isPending: tiktokPosting } = useTikTokPublishImages()
  // Order matters — this is the exact order images appear in the TikTok photo carousel, with
  // the first entry doubling as the cover. Clicking a layout appends/removes it from the end.
  const [tiktokSelectedLayouts, setTiktokSelectedLayouts] = useState<LayoutKey[]>(['centered'])
  const [tiktokTitle, setTiktokTitle] = useState('')
  const [tiktokDescription, setTiktokDescription] = useState('')
  const [tiktokAutoMusic, setTiktokAutoMusic] = useState(false)
  const [tiktokResult, setTiktokResult] = useState<{ privacyLevel: string } | null>(null)
  const [tiktokError, setTiktokError] = useState('')

  useEffect(() => {
    if (!logoUrl) {
      loadedLogoImageRef.current = null
      return
    }
    let cancelled = false
    loadImage(logoUrl).then(img => {
      if (!cancelled) loadedLogoImageRef.current = img
    }).catch(() => {
      loadedLogoImageRef.current = null
    })
    return () => {
      cancelled = true
    }
  }, [logoUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setPreviews({})
    setEditStateMap(makeDefaultEditStateMap())
    loadedImageRef.current = null
    setImgDims(null)
    setTransparentUrl('')
    setTiktokTitle('')
    setTiktokDescription('')
    setTiktokAutoMusic(false)
    setTiktokSelectedLayouts(['centered'])
    setTiktokResult(null)
    setTiktokError('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      const bgRemovedUrl = withBackgroundRemoved(url)
      setRemovingBg(true)
      setTransparentUrl(bgRemovedUrl)
      const img = await loadImage(bgRemovedUrl)
      loadedImageRef.current = img
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight })
      setRemovingBg(false)
    } catch {
      setError(t.socialPostCreator.uploadError)
      setRemovingBg(false)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const selectedPlatform = useMemo(
    () => PLATFORM_SIZES.find(p => p.key === selectedPlatformKey) ?? PLATFORM_SIZES[0],
    [selectedPlatformKey],
  )

  // Auto-regenerates the downloadable PNGs for the selected platform whenever the source
  // image or any background/position/badge setting changes. Purely local canvas compositing
  // — no extra upload, API call, or Cloudinary transform runs here, so it's free to run live.
  useEffect(() => {
    const img = loadedImageRef.current
    if (!img || removingBg) return

    const timeout = setTimeout(() => {
      const next: Partial<Record<LayoutKey, string>> = {}
      for (const layout of LAYOUT_KEYS) {
        const canvas = document.createElement('canvas')
        canvas.width = selectedPlatform.width
        canvas.height = selectedPlatform.height
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        const layoutState = editStateMap[layout]
        drawBackground(ctx, selectedPlatform.width, selectedPlatform.height, color, backgroundMode === 'pattern' ? pattern : null)
        drawProductLayout(ctx, img, img.naturalWidth, img.naturalHeight, selectedPlatform.width, selectedPlatform.height, layout, layoutState.product)
        if (layoutState.price.visible && layoutState.price.text.trim()) {
          drawPriceBadge(ctx, selectedPlatform.width, selectedPlatform.height, layoutState.price.text, layoutState.price.position)
        }
        if (layoutState.logo.visible && loadedLogoImageRef.current) {
          const logo = loadedLogoImageRef.current
          drawLogoBadge(ctx, logo, logo.naturalWidth, logo.naturalHeight, selectedPlatform.width, selectedPlatform.height, layoutState.logo.position)
        }
        next[layout] = canvas.toDataURL('image/png')
      }
      setPreviews(next)
    }, REGEN_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [transparentUrl, removingBg, backgroundMode, color, pattern, selectedPlatform, editStateMap])

  const isProductPage = selectedPlatformKey === 'product-page'
  const productPagePreviewsReady = isProductPage && LAYOUT_KEYS.every(layout => previews[layout])

  // Uploads the 3 generated Product Page images to Cloudinary (they only exist as in-memory
  // canvas data URLs up to this point) and hands them to the new-product page via the same
  // sessionStorage hand-off ImportProductModal already uses for Facebook/Instagram imports.
  async function handleCreateProduct() {
    if (!productPagePreviewsReady) return
    setError('')
    setCreatingProduct(true)
    try {
      const uploadedUrls = await Promise.all(
        LAYOUT_KEYS.map(async layout => {
          const file = await dataUrlToFile(previews[layout]!, `product-page-${layout}.png`)
          return uploadImage(file)
        }),
      )
      const importData: ProductImportData = {
        name: null,
        description: null,
        price: null,
        optionGroups: [],
        categoryId: null,
        imageUrls: uploadedUrls,
        videoUrl: null,
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(importData))
      router.push('/dashboard/merchant/store/products/new')
    } catch {
      setError(t.socialPostCreator.createProductError)
      setCreatingProduct(false)
    }
  }

  const isTiktok = selectedPlatformKey === 'tiktok'
  const tiktokPreviewReady = isTiktok && tiktokSelectedLayouts.length > 0 && tiktokSelectedLayouts.every(layout => previews[layout])

  function toggleTiktokLayout(layout: LayoutKey) {
    setTiktokSelectedLayouts(prev =>
      prev.includes(layout) ? prev.filter(l => l !== layout) : [...prev, layout],
    )
  }

  // Uploads each selected layout's canvas image to Cloudinary (in the order they were picked)
  // and publishes them together as one TikTok photo carousel — unlike Create Product, this
  // isn't tied to a Product row at all, so it hits the ad-hoc publish-images endpoint instead.
  async function handlePostToTiktok() {
    if (!tiktokPreviewReady) return
    setTiktokError('')
    try {
      const uploadedUrls = await Promise.all(
        tiktokSelectedLayouts.map(async layout => {
          const file = await dataUrlToFile(previews[layout]!, `tiktok-${layout}.png`)
          return uploadImage(file)
        }),
      )
      publishTiktokImages(
        { imageUrls: uploadedUrls, title: tiktokTitle.trim(), description: tiktokDescription.trim(), autoAddMusic: tiktokAutoMusic },
        {
          onSuccess: data => setTiktokResult({ privacyLevel: data.privacyLevel }),
          onError: () => setTiktokError(t.socialPostCreator.postToTiktokError),
        },
      )
    } catch {
      setTiktokError(t.socialPostCreator.postToTiktokError)
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
              <img src={transparentUrl} alt="" className="w-full h-full object-contain" />
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
        <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <p className="text-white/40 text-xs uppercase tracking-widest">{t.socialPostCreator.backgroundLabel}</p>

            <div className="flex gap-2">
              <button
                onClick={() => setBackgroundMode('solid')}
                className={[
                  'btn h-auto rounded-xl px-5 py-3 normal-case font-semibold',
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
                  'btn h-auto rounded-xl px-5 py-3 normal-case font-semibold',
                  backgroundMode === 'pattern'
                    ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                    : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
                ].join(' ')}
              >
                {t.socialPostCreator.pattern}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setColor(preset)}
                  aria-label={preset}
                  style={{ background: preset }}
                  className={[
                    'w-11 h-11 rounded-xl border-2 transition-transform',
                    color === preset ? 'border-fuchsia-400 scale-110' : 'border-white/15 hover:scale-105',
                  ].join(' ')}
                />
              ))}
              <label
                className="relative w-11 h-11 rounded-xl border-2 border-dashed border-white/25 hover:border-white/40 cursor-pointer flex items-center justify-center overflow-hidden"
                title={t.socialPostCreator.customColor}
              >
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden className="text-white/40 pointer-events-none">
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
                      'btn h-auto rounded-lg px-4 py-2.5 normal-case font-medium',
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
          </div>

          <div className="flex flex-col gap-2 sm:w-72">
            <p className="text-white/40 text-xs uppercase tracking-widest">{t.socialPostCreator.platformLabel}</p>
            <select
              value={selectedPlatformKey}
              onChange={e => setSelectedPlatformKey(e.target.value)}
              className="select bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            >
              {PLATFORM_SIZES.map(platform => (
                <option key={platform.key} value={platform.key}>
                  {t.socialPostCreator[PLATFORM_LABEL_KEYS[platform.key]]} — {platform.width}×{platform.height}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {transparentUrl && !removingBg && imgDims && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {LAYOUT_KEYS.map(layout => (
            <PostLayoutCard
              key={layout}
              layout={layout}
              labelKey={LAYOUT_LABEL_KEYS[layout]}
              platform={selectedPlatform}
              transparentUrl={transparentUrl}
              imgWidth={imgDims.width}
              imgHeight={imgDims.height}
              backgroundMode={backgroundMode}
              color={color}
              pattern={pattern}
              logoUrl={logoUrl}
              editState={editStateMap[layout]}
              onChange={next => setEditStateMap(prev => ({ ...prev, [layout]: next }))}
              onReset={() => setEditStateMap(prev => ({ ...prev, [layout]: makeDefaultLayoutEditState(DEFAULT_PRICE_TEXT) }))}
              downloadUrl={previews[layout]}
            />
          ))}
        </div>
      )}

      {isProductPage && transparentUrl && !removingBg && (
        <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="font-bold text-white text-sm">{t.socialPostCreator.createProductTitle}</p>
            <p className="text-white/40 text-xs mt-1">{t.socialPostCreator.createProductSubtitle}</p>
          </div>
          <button
            onClick={handleCreateProduct}
            disabled={!productPagePreviewsReady || creatingProduct}
            className="btn h-auto rounded-xl px-6 py-3.5 normal-case font-semibold gap-2 bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30 disabled:opacity-40 shrink-0"
          >
            {creatingProduct ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
            {t.socialPostCreator.createProduct}
          </button>
        </div>
      )}

      {isTiktok && transparentUrl && !removingBg && (
        <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
          <div>
            <p className="font-bold text-white text-sm">{t.socialPostCreator.postToTiktokTitle}</p>
            <p className="text-white/40 text-xs mt-1">{t.socialPostCreator.postToTiktokSubtitle}</p>
          </div>

          {!ttStatus?.connected ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/50 flex items-center justify-between gap-3">
              <span>{t.socialPostCreator.postToTiktokNotConnected}</span>
              <Link
                href="/dashboard/merchant/store/integrations"
                className="btn btn-sm h-auto rounded-lg bg-white/8 border-white/15 text-white/80 hover:bg-white/12 normal-case shrink-0"
              >
                {t.socialPostCreator.postToTiktokConnectLink}
              </Link>
            </div>
          ) : tiktokResult ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {t.socialPostCreator.postToTiktokSuccessPrefix} {tiktokResult.privacyLevel.replaceAll('_', ' ').toLowerCase()}.
              {tiktokResult.privacyLevel !== 'PUBLIC_TO_EVERYONE' && (
                <p className="text-emerald-400/70 text-xs mt-1">{t.socialPostCreator.postToTiktokAuditNote}</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-white/40 text-xs uppercase tracking-widest">{t.socialPostCreator.postToTiktokLayoutLabel}</p>
                <p className="text-white/25 text-[11px] -mt-1">{t.socialPostCreator.postToTiktokLayoutHint}</p>
                <div className="flex gap-2">
                  {LAYOUT_KEYS.map(layout => {
                    const previewUrl = previews[layout]
                    const orderIndex = tiktokSelectedLayouts.indexOf(layout)
                    const selected = orderIndex !== -1
                    return (
                      <button
                        key={layout}
                        onClick={() => toggleTiktokLayout(layout)}
                        disabled={!previewUrl}
                        className={[
                          'relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 disabled:opacity-30',
                          selected ? 'border-fuchsia-400' : 'border-white/10 hover:border-white/25',
                        ].join(' ')}
                      >
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {selected && (
                          <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-fuchsia-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                            {orderIndex + 1}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="tt-post-title" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.socialPostCreator.postToTiktokTitleLabel}
                </label>
                <input
                  id="tt-post-title"
                  value={tiktokTitle}
                  onChange={e => setTiktokTitle(e.target.value)}
                  maxLength={90}
                  disabled={tiktokPosting}
                  className="input w-full bg-white/4 border-white/10 focus:border-white/30"
                />
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="tt-post-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  {t.socialPostCreator.postToTiktokDescLabel}
                </label>
                <textarea
                  id="tt-post-description"
                  value={tiktokDescription}
                  onChange={e => setTiktokDescription(e.target.value)}
                  rows={4}
                  disabled={tiktokPosting}
                  className="textarea w-full bg-white/4 border-white/10 focus:border-white/30 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-white/50">
                <input
                  type="checkbox"
                  checked={tiktokAutoMusic}
                  onChange={e => setTiktokAutoMusic(e.target.checked)}
                  disabled={tiktokPosting}
                  className="checkbox checkbox-xs checkbox-secondary"
                />
                {t.socialPostCreator.postToTiktokAutoMusic}
              </label>
              <p className="text-white/25 text-[11px] -mt-3">{t.socialPostCreator.postToTiktokAutoMusicHint}</p>

              {tiktokError && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                  {tiktokError}
                </div>
              )}

              <button
                onClick={handlePostToTiktok}
                disabled={!tiktokPreviewReady || !tiktokTitle.trim() || tiktokPosting}
                className="btn h-auto rounded-xl px-6 py-3.5 normal-case font-semibold gap-2 bg-white/15 hover:bg-white/20 border-white/20 text-white disabled:opacity-40 self-start"
              >
                {tiktokPosting ? <span className="loading loading-spinner loading-sm" /> : t.socialPostCreator.postToTiktokButton}
              </button>
            </>
          )}
        </div>
      )}

    </div>
  )
}
