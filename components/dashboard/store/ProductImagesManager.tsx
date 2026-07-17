'use client'

import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'
import { useCreateProductImage, useDeleteProductImage, useReorderProductImages } from '@/lib/queries/storefront-admin'
import type { ProductImageResponse } from '@/lib/types/storefront'
import { viewTransitionNameFor, withViewTransition } from '@/lib/viewTransition'

export function ProductImagesManager({ productId, images }: { productId: string; images: ProductImageResponse[] }) {
  const { mutate: createImage, isPending: isCreating } = useCreateProductImage(productId)
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

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      createImage({ url })
    } catch {
      setError('Upload failed. Check Cloudinary config and try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Images</h2>
      {order.length > 1 && (
        <p className="text-white/25 text-xs -mt-2">Drag to reorder. The first image is the storefront cover.</p>
      )}

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="w-full h-full object-cover pointer-events-none" />
            {index === 0 && (
              <span className="absolute top-1 left-1 rounded bg-fuchsia-600 text-white text-[9px] font-bold px-1.5 py-0.5">
                Cover
              </span>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move left"
                  className="text-white/70 hover:text-white disabled:opacity-20 text-xs px-1"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label="Move right"
                  className="text-white/70 hover:text-white disabled:opacity-20 text-xs px-1"
                >
                  ›
                </button>
              </div>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(image.id)}
                  className="text-[10px] text-white/80 hover:text-white"
                >
                  Set as cover
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteImage(image.id)}
                className="text-xs text-red-300 hover:text-red-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || isCreating}
          className="w-20 h-20 rounded-xl border border-dashed border-white/12 bg-white/2 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 flex items-center justify-center text-white/30 disabled:opacity-40"
        >
          {uploading || isCreating ? <span className="loading loading-spinner loading-sm text-fuchsia-400" /> : '+ Add'}
        </button>
      </div>

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
