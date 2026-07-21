'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMyCategories } from '@/lib/queries/storefront-admin'
import { useFacebookPostDetail, useFacebookPosts, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramMedia, useInstagramMediaDetail, useInstagramStatus } from '@/lib/queries/instagram'
import { uploadImage, uploadVideo } from '@/lib/uploadImage'
import { viewTransitionNameFor, withViewTransition } from '@/lib/viewTransition'
import { PRODUCT_IMPORT_STORAGE_KEY, type ProductImportData } from '@/lib/productImport'
import { BetaBadge } from './BetaBadge'

type Platform = 'choose' | 'facebook' | 'instagram' | 'mymarket'
type Mode = 'choose' | 'post' | 'manual'

interface PickableItem {
  id: string
  thumbnailUrl: string | null
  text: string | null
}

export function ImportProductModal() {
  const router = useRouter()
  const { data: categories } = useMyCategories()
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('choose')
  const [mode, setMode] = useState<Mode>('choose')
  const [captionText, setCaptionText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [mymarketUrl, setMymarketUrl] = useState('')
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: fbStatus } = useFacebookStatus()
  const fbConnected = fbStatus?.connected ?? false
  const { data: fbPosts, isLoading: fbPostsLoading } = useFacebookPosts(open && fbConnected && platform === 'facebook' && mode === 'post')
  const { mutateAsync: fetchFbPostDetail } = useFacebookPostDetail()

  const { data: igStatus } = useInstagramStatus()
  const igConnected = igStatus?.connected ?? false
  const { data: igMedia, isLoading: igMediaLoading } = useInstagramMedia(open && igConnected && platform === 'instagram' && mode === 'post')
  const { mutateAsync: fetchIgMediaDetail } = useInstagramMediaDetail()

  const [pickedId, setPickedId] = useState<string | null>(null)
  const dragIndex = useRef<number | null>(null)

  const connected = platform === 'facebook' ? fbConnected : platform === 'instagram' ? igConnected : false
  const accountLabel = platform === 'facebook' ? fbStatus?.pageName : platform === 'instagram' ? `@${igStatus?.username}` : ''
  const itemsLoading = platform === 'facebook' ? fbPostsLoading : igMediaLoading
  const items: PickableItem[] =
    platform === 'facebook'
      ? (fbPosts ?? []).map(p => ({ id: p.id, thumbnailUrl: p.thumbnailUrl, text: p.message }))
      : (igMedia ?? []).map(m => ({ id: m.id, thumbnailUrl: m.thumbnailUrl, text: m.caption }))

  function close() {
    if (loading || uploadingImage || uploadingVideo || pickedId) return
    setOpen(false)
    setPlatform('choose')
    setMode('choose')
    setCaptionText('')
    setImages([])
    setImageUrlInput('')
    setVideoUrl('')
    setUploadedVideoUrl(null)
    setMymarketUrl('')
    setError(null)
  }

  function backFromMode() {
    setPlatform('choose')
    setError(null)
  }

  function backFromForm() {
    setMode('choose')
    setError(null)
  }

  async function handlePick(id: string) {
    setPickedId(id)
    setError(null)
    try {
      const detail =
        platform === 'facebook'
          ? await fetchFbPostDetail(id).then(d => ({ caption: d.message, imageUrls: d.imageUrls, videoUrl: d.videoUrl }))
          : await fetchIgMediaDetail(id).then(d => ({ caption: d.caption, imageUrls: d.imageUrls, videoUrl: d.videoUrl }))

      if (!detail.caption?.trim()) {
        // No caption to feed the AI extractor — fall back to filling the fields in
        // manually so the merchant can add a name/price themselves before importing.
        if (detail.imageUrls.length > 0) setImages(detail.imageUrls)
        if (detail.videoUrl) setVideoUrl(detail.videoUrl)
        setError('This post has no caption text — add one below, then hit Import.')
        return
      }

      const ok = await runImport(detail.caption, detail.imageUrls, detail.videoUrl)
      if (!ok) {
        // Import failed — populate the fields so the merchant can retry manually instead of losing the pick.
        setCaptionText(detail.caption)
        if (detail.imageUrls.length > 0) setImages(detail.imageUrls)
        if (detail.videoUrl) setVideoUrl(detail.videoUrl)
      }
    } catch {
      setError('Failed to load that post. It may have been removed.')
    } finally {
      setPickedId(null)
    }
  }

  function handleAddImageUrl() {
    const url = imageUrlInput.trim()
    if (!url || images.includes(url)) return
    setImages(prev => [...prev, url])
    setImageUrlInput('')
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function moveImage(index: number, direction: -1 | 1) {
    withViewTransition(() => {
      setImages(prev => {
        const target = index + direction
        if (target < 0 || target >= prev.length) return prev
        const next = [...prev]
        ;[next[index], next[target]] = [next[target], next[index]]
        return next
      })
    })
  }

  function handleImageDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    withViewTransition(() => {
      setImages(prev => {
        const next = [...prev]
        const [moved] = next.splice(dragIndex.current!, 1)
        next.splice(index, 0, moved)
        return next
      })
    })
    dragIndex.current = index
  }

  async function handleImageFiles(files: FileList) {
    setUploadingImage(true)
    setError(null)
    try {
      const uploaded = await Promise.all(Array.from(files).map(file => uploadImage(file)))
      setImages(prev => [...prev, ...uploaded])
    } catch {
      setError('Failed to upload one of those photos.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleVideoFile(file: File) {
    setUploadingVideo(true)
    setError(null)
    try {
      const url = await uploadVideo(file)
      setUploadedVideoUrl(url)
    } catch {
      setError('Failed to upload that video.')
    } finally {
      setUploadingVideo(false)
    }
  }

  // Shared by both entry points: the manual form's submit button, and picking a post
  // (which skips the button entirely and jumps straight to the product page).
  async function runImport(captionTextValue: string, sourceImageUrls: string[], sourceVideoUrl: string | null): Promise<boolean> {
    if (!captionTextValue.trim()) return false
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captionText: captionTextValue.trim(),
          imageUrls: sourceImageUrls.length > 0 ? sourceImageUrls : undefined,
          videoUrl: sourceVideoUrl?.trim() || undefined,
          categories: categories?.map(c => ({ id: c.id, name: c.name })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to import that post.')
        return false
      }
      const result: ProductImportData = {
        ...data,
        videoUrl: uploadedVideoUrl ?? data.videoUrl,
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(result))
      router.push(`/dashboard/merchant/store/products/new?imported=${platform}`)
      return true
    } catch {
      setError('Failed to import that post.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault()
    void runImport(captionText, images, videoUrl)
  }

  // MyMarket products already come back as clean structured JSON (no caption text to run
  // through an AI extractor) — just parse the product ID out of the pasted link and fetch.
  async function runMyMarketImport(productUrl: string): Promise<boolean> {
    if (!productUrl.trim()) return false
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/mymarket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUrl: productUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to import that product.')
        return false
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(data as ProductImportData))
      router.push('/dashboard/merchant/store/products/new?imported=mymarket')
      return true
    } catch {
      setError('Failed to import that product.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function handleMyMarketImport(e: React.FormEvent) {
    e.preventDefault()
    void runMyMarketImport(mymarketUrl)
  }

  const busy = loading || uploadingImage || uploadingVideo || !!pickedId

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-sm gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 12.5V14h1.5l7.4-7.4-1.5-1.5L2 12.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M11.4 3l1.6 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Import
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="text-sm font-semibold text-white">
                {platform === 'choose'
                  ? 'Import a product'
                  : `Import from ${platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'MyMarket'}`}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {platform === 'choose' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <p className="text-white/40 text-xs leading-relaxed">Choose where to import a product from.</p>

                <button
                  type="button"
                  onClick={() => setPlatform('facebook')}
                  className="btn w-full justify-start gap-3 bg-[#1877F2]/15 border-[#1877F2]/30 text-[#8fb8fa] hover:bg-[#1877F2]/25"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M9.5 1.75h-2A2.75 2.75 0 0 0 4.75 4.5v1.75H3v2.25h1.75V12.25h2.25V8.5H8.7l.3-2.25H7V4.5c0-.483.392-.875.875-.875h1.625V1.75Z"
                      fill="currentColor"
                    />
                  </svg>
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  className="btn w-full justify-start gap-3 bg-gradient-to-r from-[#feda75]/15 via-[#d62976]/15 to-[#4f5bd5]/15 border-[#d62976]/30 text-[#f0a1c0] hover:from-[#feda75]/25 hover:via-[#d62976]/25 hover:to-[#4f5bd5]/25"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="11.8" cy="4.2" r="0.9" fill="currentColor"/>
                  </svg>
                  Instagram
                  <BetaBadge />
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('mymarket')}
                  className="btn w-full justify-start gap-3 bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                >
                  <span className="w-4 h-4 rounded-sm overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/mymarket-logo.jpg" alt="" className="w-full h-full object-cover" />
                  </span>
                  MyMarket
                </button>
              </div>
            ) : platform === 'mymarket' ? (
              <form onSubmit={handleMyMarketImport} className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <button
                  type="button"
                  onClick={backFromMode}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>

                <p className="text-white/40 text-xs leading-relaxed">
                  Paste the product page link from MyMarket.ge — the title, photos, price, and attributes are pulled
                  in automatically. Review everything before saving.
                </p>

                <div className="fieldset gap-2">
                  <label htmlFor="mymarket-url" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    Product link <span className="text-error">*</span>
                  </label>
                  <input
                    id="mymarket-url"
                    type="url"
                    inputMode="url"
                    autoFocus
                    value={mymarketUrl}
                    onChange={e => setMymarketUrl(e.target.value)}
                    placeholder="https://mymarket.ge/pr/30635007/..."
                    disabled={loading}
                    className="input w-full bg-white/4 border-white/10 focus:border-amber-500/60"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !mymarketUrl.trim()}
                  className="btn w-full gap-2 bg-amber-500 hover:bg-amber-400 border-amber-500 hover:border-amber-400 text-black font-semibold disabled:opacity-40"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : 'Import'}
                </button>
              </form>
            ) : mode === 'choose' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <button
                  type="button"
                  onClick={backFromMode}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                <p className="text-white/40 text-xs leading-relaxed">
                  Pick a recent post from your connected {platform === 'facebook' ? 'Facebook Page' : 'Instagram account'}, or
                  paste the details in yourself. AI will pull out the product name, price, sizes/colors, and category —
                  review everything before saving.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('post')}
                  className="btn w-full justify-start gap-3 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
                >
                  Select from a {platform === 'facebook' ? 'Facebook post' : 'Instagram post'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="btn w-full justify-start gap-3 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 12.5V14h1.5l7.4-7.4-1.5-1.5L2 12.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M11.4 3l1.6 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Enter details manually
                </button>
              </div>
            ) : (
              <form onSubmit={handleImport} className="flex flex-col gap-4 px-5 pt-4 pb-5 overflow-y-auto">
                <button
                  type="button"
                  onClick={backFromForm}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>

                {mode === 'post' && (
                  connected ? (
                    <div className="fieldset gap-2">
                      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        Recent posts from {accountLabel}
                      </label>
                      {itemsLoading ? (
                        <div className="flex gap-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton w-16 h-16 rounded-lg shrink-0" />
                          ))}
                        </div>
                      ) : items.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {items.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handlePick(item.id)}
                              disabled={busy}
                              title={item.text ?? ''}
                              className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 hover:border-fuchsia-500/60 transition-colors disabled:opacity-40"
                            >
                              {item.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white/4 flex items-center justify-center text-white/20 text-[9px] p-1 text-center leading-tight">
                                  {item.text?.slice(0, 40) ?? 'Post'}
                                </div>
                              )}
                              {pickedId === item.id && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="loading loading-spinner loading-xs text-fuchsia-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/30 text-xs">No recent posts found.</p>
                      )}
                      <p className="text-white/25 text-xs">Pick a post to fill in the fields below.</p>
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/merchant/store/integrations"
                      className="btn btn-sm w-fit gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white"
                    >
                      Connect {platform === 'facebook' ? 'Facebook' : 'Instagram'} in Integrations
                    </Link>
                  )
                )}

                <div className="fieldset gap-2">
                  <label htmlFor="import-caption" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    Post text <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="import-caption"
                    autoFocus={mode === 'manual'}
                    value={captionText}
                    onChange={e => setCaptionText(e.target.value)}
                    placeholder="Paste the post caption here..."
                    rows={6}
                    disabled={busy}
                    className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
                    required
                  />
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    Photos <span className="text-white/30 normal-case">({images.length} added)</span>
                  </label>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {images.map((url, i) => (
                        <div
                          key={url + i}
                          draggable
                          onDragStart={() => { dragIndex.current = i }}
                          onDragOver={e => handleImageDragOver(e, i)}
                          onDrop={() => { dragIndex.current = null }}
                          style={{ viewTransitionName: viewTransitionNameFor(url) }}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 group shrink-0 cursor-grab active:cursor-grabbing"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                          {i === 0 && (
                            <span className="absolute top-0.5 left-0.5 rounded bg-fuchsia-600 text-white text-[8px] font-bold px-1 py-0.5">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(i, -1)}
                                disabled={busy || i === 0}
                                aria-label="Move left"
                                className="text-white/70 hover:text-white disabled:opacity-20 text-xs px-1"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(i, 1)}
                                disabled={busy || i === images.length - 1}
                                aria-label="Move right"
                                className="text-white/70 hover:text-white disabled:opacity-20 text-xs px-1"
                              >
                                ›
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              disabled={busy}
                              className="text-[10px] text-red-300 hover:text-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="url"
                      inputMode="url"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl() } }}
                      placeholder="Paste a photo link"
                      disabled={busy}
                      className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={busy || !imageUrlInput.trim()}
                      className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 disabled:opacity-40"
                    >
                      Add
                    </button>
                    <label className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 cursor-pointer">
                      {uploadingImage ? <span className="loading loading-spinner loading-xs" /> : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={busy}
                        onChange={e => { if (e.target.files?.length) handleImageFiles(e.target.files) }}
                      />
                    </label>
                  </div>
                  <p className="text-white/25 text-xs leading-relaxed">
                    {platform === 'facebook'
                      ? 'On the post, right-click each photo → "Copy image address", and paste it above — more reliable than the post link. Or upload photos directly (you can select multiple at once).'
                      : 'Or upload photos directly (you can select multiple at once).'}
                  </p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    Video <span className="text-white/30 normal-case">(optional)</span>
                  </label>

                  {uploadedVideoUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-2">
                      <span className="text-xs text-white/50 flex-1">Video uploaded</span>
                      <button
                        type="button"
                        onClick={() => setUploadedVideoUrl(null)}
                        disabled={busy}
                        className="text-xs text-white/40 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          inputMode="url"
                          value={videoUrl}
                          onChange={e => setVideoUrl(e.target.value)}
                          placeholder={platform === 'facebook' ? 'Paste a direct video link (rarely works for FB)' : 'Paste a direct video link'}
                          disabled={busy}
                          className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                        />
                        <label className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 cursor-pointer">
                          {uploadingVideo ? <span className="loading loading-spinner loading-xs" /> : 'Upload'}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={busy}
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f) }}
                          />
                        </label>
                      </div>
                      <p className="text-white/25 text-xs leading-relaxed">
                        Or download the video from the post and upload it directly for reliable results.
                      </p>
                    </>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || !captionText.trim()}
                  className="btn w-full gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : 'Import'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
