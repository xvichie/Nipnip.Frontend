'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'
import { useCreateProductImage, useDeleteProductImage, useReorderProductImages } from '@/lib/queries/storefront-admin'
import type { ProductImageResponse } from '@/lib/types/storefront'
import { viewTransitionNameFor, withViewTransition } from '@/lib/viewTransition'
import { CImg } from '@/components/ui/CImg'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, StarIcon, TrashIcon } from '@/components/ui/icons'

export function ProductImagesManager({ productId, images }: { productId: string; images: ProductImageResponse[] }) {
  const { mutateAsync: createImage, isPending: isCreating } = useCreateProductImage(productId)
  const { mutate: deleteImage } = useDeleteProductImage(productId)
  const { mutate: reorderImages } = useReorderProductImages(productId)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // "Adjust state during render" pattern instead of an effect: `order` is a local
  // drag/reorder buffer that should reset whenever the server's `images` prop changes.
  const [order, setOrder] = useState(images)
  const [prevImages, setPrevImages] = useState(images)
  if (images !== prevImages) {
    setPrevImages(images)
    setOrder(images)
  }

  const dragIndex = useRef<number | null>(null)

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    withViewTransition(() => {
      setOrder(prev => {
        const next = [...prev]
        const [moved] = next.splice(dragIndex.current!, 1)
        next.splice(index, 0, moved)
        return next
      })
    })
    dragIndex.current = index
  }

  function handleDrop() {
    dragIndex.current = null
    reorderImages({ imageIds: order.map(i => i.id) })
  }

  function handleSetCover(id: string) {
    const next = [order.find(i => i.id === id)!, ...order.filter(i => i.id !== id)]
    withViewTransition(() => setOrder(next))
    reorderImages({ imageIds: next.map(i => i.id) })
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[index], next[target]] = [next[target], next[index]]
    withViewTransition(() => setOrder(next))
    reorderImages({ imageIds: next.map(i => i.id) })
  }

  // Uploads sequentially (rather than Promise.all) so images are created in the order they
  // were selected/pasted — the backend appends each new image at the end, and concurrent
  // POSTs racing each other would make that order unpredictable.
  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (list.length === 0) return

    setError(null)
    setUploading(true)
    try {
      for (const file of list) {
        const url = await uploadImage(file)
        await createImage({ url })
      }
    } catch {
      setError('ატვირთვა ვერ მოხერხდა. შეამოწმეთ Cloudinary-ის კონფიგურაცია და სცადეთ თავიდან.')
    } finally {
      setUploading(false)
    }
  }

  // Kept in a ref so the paste listener below can stay mounted for the component's whole
  // lifetime (no need to re-subscribe every render) while still calling the latest closure.
  const handleFilesRef = useRef(handleFiles)
  useEffect(() => {
    handleFilesRef.current = handleFiles
  })

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles = Array.from(items)
        .map(item => (item.type.startsWith('image/') ? item.getAsFile() : null))
        .filter((f): f is File => !!f)
      // Only intercept the paste when it's actually image data — anything else (plain text,
      // e.g. pasting into the product name/price fields elsewhere on this same page) is left
      // completely alone so it keeps pasting normally wherever the user's focus is.
      if (imageFiles.length === 0) return
      e.preventDefault()
      handleFilesRef.current(imageFiles)
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">სურათები</h2>
      <p className="text-white/25 text-xs -mt-2">
        აირჩიეთ რამდენიმე სურათი ერთდროულად, ან ჩასვით (Ctrl+V) ასლი ბუფერიდან.
        {order.length > 1 && ' გადაათრიეთ თანმიმდევრობის შესაცვლელად — პირველი სურათი არის მაღაზიის ყდის სურათი.'}
      </p>

      <div className="flex flex-wrap gap-3">
        {order.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => { dragIndex.current = index }}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={handleDrop}
            style={{ viewTransitionName: viewTransitionNameFor(image.id) }}
            className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group cursor-grab active:cursor-grabbing"
          >
            <CImg src={image.url} alt="" className="w-full h-full object-cover pointer-events-none" />
            {index === 0 && (
              <span className="absolute top-1 left-1 rounded bg-fuchsia-600 text-white text-[9px] font-bold px-1.5 py-0.5">
                ყდა
              </span>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="მარცხნივ გადატანა"
                  data-tip="მარცხნივ გადატანა"
                  className="tooltip tooltip-top text-white/70 hover:text-white disabled:opacity-20 px-1"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label="მარჯვნივ გადატანა"
                  data-tip="მარჯვნივ გადატანა"
                  className="tooltip tooltip-top text-white/70 hover:text-white disabled:opacity-20 px-1"
                >
                  <ChevronRightIcon />
                </button>
              </div>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(image.id)}
                  aria-label="ყდად დაყენება"
                  data-tip="ყდად დაყენება"
                  className="tooltip tooltip-top text-white/80 hover:text-white"
                >
                  <StarIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteImage(image.id)}
                aria-label="წაშლა"
                data-tip="წაშლა"
                className="tooltip tooltip-top text-red-300 hover:text-red-200"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            const files = e.target.files
            if (files && files.length > 0) handleFiles(files)
            // Reset so selecting the exact same file(s) again still fires onChange.
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || isCreating}
          aria-label="სურათის დამატება"
          data-tip="სურათის დამატება"
          className="tooltip tooltip-top w-20 h-20 rounded-xl border border-dashed border-white/12 bg-white/2 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 flex items-center justify-center text-white/30 disabled:opacity-40"
        >
          {uploading || isCreating ? <span className="loading loading-spinner loading-sm text-fuchsia-400" /> : <PlusIcon />}
        </button>
      </div>

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
