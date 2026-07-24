'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMyCategories } from '@/lib/queries/storefront-admin'
import { useFacebookPostDetail, useFacebookPosts, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramMedia, useInstagramMediaDetail, useInstagramStatus } from '@/lib/queries/instagram'
import { useMyMarketStatus } from '@/lib/queries/mymarket'
import { MyMarketProductPicker } from './MyMarketProductPicker'
import { usePhubberStatus } from '@/lib/queries/phubber'
import { PhubberProductPicker } from './PhubberProductPicker'
import { useExtraStatus } from '@/lib/queries/extra'
import { ExtraProductPicker } from './ExtraProductPicker'
import { BulkImportFromFacebookSection } from './BulkImportFromFacebookSection'
import { uploadImage, uploadVideo } from '@/lib/uploadImage'
import { viewTransitionNameFor, withViewTransition } from '@/lib/viewTransition'
import { PRODUCT_IMPORT_STORAGE_KEY, type ProductImportData } from '@/lib/productImport'
import type { ExtraProductSummary } from '@/lib/types'
import { BetaBadge } from './BetaBadge'
import { CImg } from '@/components/ui/CImg'

type Platform = 'choose' | 'facebook' | 'instagram' | 'mymarket' | 'phubber' | 'extra' | 'facebook-bulk'
type Mode = 'choose' | 'post' | 'manual'

const PLATFORM_LABELS: Record<Exclude<Platform, 'choose' | 'facebook-bulk'>, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  mymarket: 'MyMarket',
  phubber: 'Phubber',
  extra: 'Extra.ge',
}

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
  const [mymarketManual, setMymarketManual] = useState(false)
  const [phubberUrl, setPhubberUrl] = useState('')
  const [phubberManual, setPhubberManual] = useState(false)
  const [extraUrl, setExtraUrl] = useState('')
  const [extraManual, setExtraManual] = useState(false)
  const [bulkImporting, setBulkImporting] = useState(false)
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

  const { data: mmStatus } = useMyMarketStatus()
  const mmConnected = mmStatus?.isConnected ?? false

  const { data: phStatus } = usePhubberStatus()
  const phConnected = phStatus?.isConnected ?? false

  const { data: exStatus } = useExtraStatus()
  const exConnected = exStatus?.isConnected ?? false

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
    if (loading || uploadingImage || uploadingVideo || pickedId || bulkImporting) return
    setOpen(false)
    setPlatform('choose')
    setMode('choose')
    setCaptionText('')
    setImages([])
    setImageUrlInput('')
    setVideoUrl('')
    setUploadedVideoUrl(null)
    setMymarketUrl('')
    setMymarketManual(false)
    setPhubberUrl('')
    setPhubberManual(false)
    setExtraUrl('')
    setExtraManual(false)
    setError(null)
  }

  function backFromMode() {
    if (bulkImporting) return
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
        setError('ამ პოსტს არ აქვს წარწერის ტექსტი — დაამატეთ ქვემოთ და დააჭირეთ „იმპორტს“.')
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
      setError('ამ პოსტის ჩატვირთვა ვერ მოხერხდა. შესაძლოა წაშლილია.')
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
      setError('ამ ფოტოებიდან ერთ-ერთის ატვირთვა ვერ მოხერხდა.')
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
      setError('ვიდეოს ატვირთვა ვერ მოხერხდა.')
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
        setError(data.error ?? 'ამ პოსტის იმპორტი ვერ მოხერხდა.')
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
      setError('ამ პოსტის იმპორტი ვერ მოხერხდა.')
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
  // through an AI extractor) — just resolve a product ID (either typed in directly by the
  // picker, or parsed server-side out of a pasted link) and fetch.
  async function runMyMarketImport(body: { productUrl?: string; productId?: string }): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/mymarket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
        return false
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(data as ProductImportData))
      router.push('/dashboard/merchant/store/products/new?imported=mymarket')
      return true
    } catch {
      setError('ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function handleMyMarketImport(e: React.FormEvent) {
    e.preventDefault()
    if (!mymarketUrl.trim()) return
    void runMyMarketImport({ productUrl: mymarketUrl })
  }

  async function handleMyMarketPick(productId: string) {
    setPickedId(productId)
    setError(null)
    await runMyMarketImport({ productId })
    setPickedId(null)
  }

  // Phubber's own list/detail endpoints already return clean structured data (no caption
  // text to run through an AI extractor) — same shape of resolution as MyMarket above.
  async function runPhubberImport(body: { productUrl?: string; productId?: string }): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/phubber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
        return false
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(data as ProductImportData))
      router.push('/dashboard/merchant/store/products/new?imported=phubber')
      return true
    } catch {
      setError('ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function handlePhubberImport(e: React.FormEvent) {
    e.preventDefault()
    if (!phubberUrl.trim()) return
    void runPhubberImport({ productUrl: phubberUrl })
  }

  async function handlePhubberPick(productId: string) {
    setPickedId(productId)
    setError(null)
    await runPhubberImport({ productId })
    setPickedId(null)
  }

  // Extra.ge's own list endpoint already returns the slug/productSecondaryId/offerSecondaryId
  // trio the detail endpoint needs — picking a grid item skips URL-parsing entirely.
  async function runExtraImport(
    body: { productUrl?: string } | { slug: string; productSecondaryId: string; offerSecondaryId: string }
  ): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
        return false
      }
      sessionStorage.setItem(PRODUCT_IMPORT_STORAGE_KEY, JSON.stringify(data as ProductImportData))
      router.push('/dashboard/merchant/store/products/new?imported=extra')
      return true
    } catch {
      setError('ამ პროდუქტის იმპორტი ვერ მოხერხდა.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function handleExtraImport(e: React.FormEvent) {
    e.preventDefault()
    if (!extraUrl.trim()) return
    void runExtraImport({ productUrl: extraUrl })
  }

  async function handleExtraPick(product: ExtraProductSummary) {
    const id = String(product.offerSecondaryId)
    setPickedId(id)
    setError(null)
    await runExtraImport({
      slug: product.slug,
      productSecondaryId: String(product.productSecondaryId),
      offerSecondaryId: id,
    })
    setPickedId(null)
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
        იმპორტი
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div
            className={[
              'relative w-full rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh]',
              platform === 'facebook-bulk' ? 'max-w-lg' : 'max-w-md',
            ].join(' ')}
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="text-sm font-semibold text-white">
                {platform === 'choose'
                  ? 'პროდუქტის იმპორტი'
                  : platform === 'facebook-bulk'
                    ? 'მასობრივი იმპორტი Facebook-იდან'
                    : `იმპორტი ${PLATFORM_LABELS[platform]}-დან`}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="დახურვა"
                className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {platform === 'choose' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <p className="text-white/40 text-xs leading-relaxed">აირჩიეთ, საიდან გსურთ პროდუქტის იმპორტი.</p>

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
                    <CImg src="/mymarket-logo.jpg" alt="" className="w-full h-full object-cover" />
                  </span>
                  MyMarket
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('phubber')}
                  className="btn w-full justify-start gap-3 bg-[#EAC7C5]/20 border-[#EAC7C5]/40 text-[#EAC7C5] hover:bg-[#EAC7C5]/30"
                >
                  <span className="w-4 h-4 rounded-sm overflow-hidden shrink-0">
                    <CImg src="/phubber-logo.jpg" alt="" className="w-full h-full object-cover" />
                  </span>
                  Phubber
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('extra')}
                  className="btn w-full justify-start gap-3 bg-[#7A1DFF]/15 border-[#7A1DFF]/30 text-[#c299ff] hover:bg-[#7A1DFF]/25"
                >
                  <span className="w-4 h-4 rounded-sm overflow-hidden shrink-0">
                    <CImg src="/extra-logo.jpg" alt="" className="w-full h-full object-cover" />
                  </span>
                  Extra.ge
                </button>

                <div className="h-px bg-white/7 my-1" />

                <button
                  type="button"
                  onClick={() => setPlatform('facebook-bulk')}
                  className="btn w-full justify-start gap-3 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1.5" y="2.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="5.5" y="6.5" width="9" height="9" rx="1.5" fill="#14141c" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  მასობრივი იმპორტი Facebook-იდან
                </button>
              </div>
            ) : platform === 'mymarket' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <button
                  type="button"
                  onClick={backFromMode}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  უკან
                </button>

                {mmStatus === undefined ? (
                  // Not `mmStatusLoading` (React Query v5's isLoading is isPending && isFetching) —
                  // if Clerk's auth hasn't resolved the instant this renders, the query is briefly
                  // `enabled: false`, so isFetching is false and isLoading reports false too even
                  // though there's no data yet, which was falling through to "not connected".
                  <div className="skeleton h-40 rounded-2xl" />
                ) : mmConnected && !mymarketManual ? (
                  <>
                    <p className="text-white/40 text-xs leading-relaxed">
                      აირჩიეთ პროდუქტი თქვენი დაკავშირებული MyMarket მაღაზიიდან — ქვემოთ ყველაფერი ავტომატურად
                      ჩაიტვირთება. გადახედეთ შენახვამდე.
                    </p>
                    <MyMarketProductPicker
                      shopId={mmStatus!.shopId!}
                      onPick={handleMyMarketPick}
                      pickingId={pickedId}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setMymarketManual(true)}
                      className="text-white/30 hover:text-white/60 text-xs self-start"
                    >
                      ან ჩასვით პროდუქტის ბმული ამის ნაცვლად
                    </button>
                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleMyMarketImport} className="flex flex-col gap-4">
                    {mmConnected && (
                      <button
                        type="button"
                        onClick={() => setMymarketManual(false)}
                        className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        ამის ნაცვლად ჩემი პროდუქტების დათვალიერება
                      </button>
                    )}

                    <p className="text-white/40 text-xs leading-relaxed">
                      ჩასვით პროდუქტის გვერდის ბმული MyMarket.ge-დან — სათაური, ფოტოები, ფასი და
                      მახასიათებლები ავტომატურად ჩაიტვირთება. გადახედეთ ყველაფერს შენახვამდე.
                    </p>

                    <div className="fieldset gap-2">
                      <label htmlFor="mymarket-url" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        პროდუქტის ბმული <span className="text-error">*</span>
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

                    {!mmConnected && (
                      <p className="text-white/25 text-xs leading-relaxed">
                        დააკავშირეთ თქვენი მაღაზია{' '}
                        <Link href="/dashboard/merchant/store/integrations" className="text-amber-400 hover:text-amber-300">
                          ინტეგრაციებში
                        </Link>{' '}
                        თქვენი პროდუქტების პირდაპირ დასათვალიერებლად.
                      </p>
                    )}

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
                      {loading ? <span className="loading loading-spinner loading-sm" /> : 'იმპორტი'}
                    </button>
                  </form>
                )}
              </div>
            ) : platform === 'phubber' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <button
                  type="button"
                  onClick={backFromMode}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  უკან
                </button>

                {phStatus === undefined ? (
                  <div className="skeleton h-40 rounded-2xl" />
                ) : phConnected && !phubberManual ? (
                  <>
                    <p className="text-white/40 text-xs leading-relaxed">
                      აირჩიეთ პროდუქტი თქვენი დაკავშირებული Phubber გამყიდველის ანგარიშიდან — ქვემოთ ყველაფერი
                      ავტომატურად ჩაიტვირთება. გადახედეთ შენახვამდე.
                    </p>
                    <PhubberProductPicker
                      sellerId={phStatus!.sellerId!}
                      onPick={handlePhubberPick}
                      pickingId={pickedId}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setPhubberManual(true)}
                      className="text-white/30 hover:text-white/60 text-xs self-start"
                    >
                      ან ჩასვით პროდუქტის ბმული ამის ნაცვლად
                    </button>
                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handlePhubberImport} className="flex flex-col gap-4">
                    {phConnected && (
                      <button
                        type="button"
                        onClick={() => setPhubberManual(false)}
                        className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        ამის ნაცვლად ჩემი პროდუქტების დათვალიერება
                      </button>
                    )}

                    <p className="text-white/40 text-xs leading-relaxed">
                      ჩასვით პროდუქტის გვერდის ბმული Phubber-იდან — სათაური, ფოტოები, ფასი და
                      მახასიათებლები ავტომატურად ჩაიტვირთება. გადახედეთ ყველაფერს შენახვამდე.
                    </p>

                    <div className="fieldset gap-2">
                      <label htmlFor="phubber-url" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        პროდუქტის ბმული <span className="text-error">*</span>
                      </label>
                      <input
                        id="phubber-url"
                        type="url"
                        inputMode="url"
                        autoFocus
                        value={phubberUrl}
                        onChange={e => setPhubberUrl(e.target.value)}
                        placeholder="https://beta.phubber.ge/product/6a15f08b2723b12bf4ddd92b"
                        disabled={loading}
                        className="input w-full bg-white/4 border-white/10 focus:border-[#EAC7C5]/60"
                        required
                      />
                    </div>

                    {!phConnected && (
                      <p className="text-white/25 text-xs leading-relaxed">
                        დააკავშირეთ თქვენი გამყიდველის ანგარიში{' '}
                        <Link href="/dashboard/merchant/store/integrations" className="text-[#EAC7C5] hover:brightness-110">
                          ინტეგრაციებში
                        </Link>{' '}
                        თქვენი პროდუქტების პირდაპირ დასათვალიერებლად.
                      </p>
                    )}

                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !phubberUrl.trim()}
                      className="btn w-full gap-2 bg-[#EAC7C5] hover:brightness-95 border-[#EAC7C5] text-black font-semibold disabled:opacity-40"
                    >
                      {loading ? <span className="loading loading-spinner loading-sm" /> : 'იმპორტი'}
                    </button>
                  </form>
                )}
              </div>
            ) : platform === 'extra' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <button
                  type="button"
                  onClick={backFromMode}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  უკან
                </button>

                {exStatus === undefined ? (
                  <div className="skeleton h-40 rounded-2xl" />
                ) : exConnected && !extraManual ? (
                  <>
                    <p className="text-white/40 text-xs leading-relaxed">
                      აირჩიეთ პროდუქტი თქვენი დაკავშირებული Extra.ge გამყიდველის ანგარიშიდან — ქვემოთ ყველაფერი
                      ავტომატურად ჩაიტვირთება. გადახედეთ შენახვამდე.
                    </p>
                    <ExtraProductPicker
                      sellerId={exStatus!.sellerId!}
                      onPick={handleExtraPick}
                      pickingId={pickedId}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setExtraManual(true)}
                      className="text-white/30 hover:text-white/60 text-xs self-start"
                    >
                      ან ჩასვით პროდუქტის ბმული ამის ნაცვლად
                    </button>
                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleExtraImport} className="flex flex-col gap-4">
                    {exConnected && (
                      <button
                        type="button"
                        onClick={() => setExtraManual(false)}
                        className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        ამის ნაცვლად ჩემი პროდუქტების დათვალიერება
                      </button>
                    )}

                    <p className="text-white/40 text-xs leading-relaxed">
                      ჩასვით პროდუქტის გვერდის ბმული Extra.ge-დან — სათაური, ფოტოები, ფასი და
                      მახასიათებლები ავტომატურად ჩაიტვირთება. გადახედეთ ყველაფერს შენახვამდე.
                    </p>

                    <div className="fieldset gap-2">
                      <label htmlFor="extra-url" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        პროდუქტის ბმული <span className="text-error">*</span>
                      </label>
                      <input
                        id="extra-url"
                        type="url"
                        inputMode="url"
                        autoFocus
                        value={extraUrl}
                        onChange={e => setExtraUrl(e.target.value)}
                        placeholder="https://extra.ge/product/tristar-at-5468-kolonuri-konditsioneri/99231/229483"
                        disabled={loading}
                        className="input w-full bg-white/4 border-white/10 focus:border-[#7A1DFF]/60"
                        required
                      />
                    </div>

                    {!exConnected && (
                      <p className="text-white/25 text-xs leading-relaxed">
                        დააკავშირეთ თქვენი გამყიდველის ანგარიში{' '}
                        <Link href="/dashboard/merchant/store/integrations" className="text-[#c299ff] hover:brightness-110">
                          ინტეგრაციებში
                        </Link>{' '}
                        თქვენი პროდუქტების პირდაპირ დასათვალიერებლად.
                      </p>
                    )}

                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !extraUrl.trim()}
                      className="btn w-full gap-2 bg-[#7A1DFF] hover:brightness-110 border-[#7A1DFF] text-white font-semibold disabled:opacity-40"
                    >
                      {loading ? <span className="loading loading-spinner loading-sm" /> : 'იმპორტი'}
                    </button>
                  </form>
                )}
              </div>
            ) : platform === 'facebook-bulk' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5 overflow-y-auto">
                <button
                  type="button"
                  onClick={backFromMode}
                  disabled={bulkImporting}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1 disabled:opacity-30"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  უკან
                </button>

                <BulkImportFromFacebookSection onImportingChange={setBulkImporting} onDone={close} />
              </div>
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
                  უკან
                </button>
                <p className="text-white/40 text-xs leading-relaxed">
                  აირჩიეთ ბოლო პოსტი თქვენი დაკავშირებული {platform === 'facebook' ? 'Facebook გვერდიდან' : 'Instagram ანგარიშიდან'}, ან
                  თავად ჩასვით დეტალები. AI ამოიღებს პროდუქტის სახელს, ფასს, ზომებს/ფერებს და კატეგორიას —
                  გადახედეთ ყველაფერს შენახვამდე.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('post')}
                  className="btn w-full justify-start gap-3 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
                >
                  არჩევა {platform === 'facebook' ? 'Facebook პოსტიდან' : 'Instagram პოსტიდან'}
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
                  დეტალების ხელით შეყვანა
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
                  უკან
                </button>

                {mode === 'post' && (
                  connected ? (
                    <div className="fieldset gap-2">
                      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        ბოლო პოსტები {accountLabel}-დან
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
                                <CImg src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white/4 flex items-center justify-center text-white/20 text-[9px] p-1 text-center leading-tight">
                                  {item.text?.slice(0, 40) ?? 'პოსტი'}
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
                        <p className="text-white/30 text-xs">ბოლო პოსტები ვერ მოიძებნა.</p>
                      )}
                      <p className="text-white/25 text-xs">აირჩიეთ პოსტი ქვემოთ ველების შესავსებად.</p>
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/merchant/store/integrations"
                      className="btn btn-sm w-fit gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white"
                    >
                      {platform === 'facebook' ? 'Facebook' : 'Instagram'}-ის დაკავშირება ინტეგრაციებში
                    </Link>
                  )
                )}

                <div className="fieldset gap-2">
                  <label htmlFor="import-caption" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    პოსტის ტექსტი <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="import-caption"
                    autoFocus={mode === 'manual'}
                    value={captionText}
                    onChange={e => setCaptionText(e.target.value)}
                    placeholder="ჩასვით პოსტის წარწერა აქ..."
                    rows={6}
                    disabled={busy}
                    className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
                    required
                  />
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    ფოტოები <span className="text-white/30 normal-case">(დამატებულია {images.length})</span>
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
                          <CImg src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                          {i === 0 && (
                            <span className="absolute top-0.5 left-0.5 rounded bg-fuchsia-600 text-white text-[8px] font-bold px-1 py-0.5">
                              ყდა
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(i, -1)}
                                disabled={busy || i === 0}
                                aria-label="მარცხნივ გადატანა"
                                className="text-white/70 hover:text-white disabled:opacity-20 text-xs px-1"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(i, 1)}
                                disabled={busy || i === images.length - 1}
                                aria-label="მარჯვნივ გადატანა"
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
                              წაშლა
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
                      placeholder="ჩასვით ფოტოს ბმული"
                      disabled={busy}
                      className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={busy || !imageUrlInput.trim()}
                      className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 disabled:opacity-40"
                    >
                      დამატება
                    </button>
                    <label className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 cursor-pointer">
                      {uploadingImage ? <span className="loading loading-spinner loading-xs" /> : 'ატვირთვა'}
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
                      ? 'პოსტზე დააჭირეთ მარჯვენა ღილაკს თითოეულ ფოტოზე → „Copy image address“ და ჩასვით ზემოთ — უფრო საიმედოა, ვიდრე პოსტის ბმული. ან ატვირთეთ ფოტოები პირდაპირ (შეგიძლიათ რამდენიმეს ერთდროულად არჩევა).'
                      : 'ან ატვირთეთ ფოტოები პირდაპირ (შეგიძლიათ რამდენიმეს ერთდროულად არჩევა).'}
                  </p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                    ვიდეო <span className="text-white/30 normal-case">(სურვილისამებრ)</span>
                  </label>

                  {uploadedVideoUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-2">
                      <span className="text-xs text-white/50 flex-1">ვიდეო ატვირთულია</span>
                      <button
                        type="button"
                        onClick={() => setUploadedVideoUrl(null)}
                        disabled={busy}
                        className="text-xs text-white/40 hover:text-white"
                      >
                        წაშლა
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
                          placeholder={platform === 'facebook' ? 'ჩასვით პირდაპირი ვიდეო ბმული (იშვიათად მუშაობს FB-სთვის)' : 'ჩასვით პირდაპირი ვიდეო ბმული'}
                          disabled={busy}
                          className="input flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                        />
                        <label className="btn bg-white/4 border-white/10 text-white/70 hover:text-white shrink-0 cursor-pointer">
                          {uploadingVideo ? <span className="loading loading-spinner loading-xs" /> : 'ატვირთვა'}
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
                        ან გადმოწერეთ ვიდეო პოსტიდან და ატვირთეთ პირდაპირ საიმედო შედეგისთვის.
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
                  {loading ? <span className="loading loading-spinner loading-sm" /> : 'იმპორტი'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
