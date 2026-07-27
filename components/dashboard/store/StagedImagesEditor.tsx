'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'
import { viewTransitionNameFor, withViewTransition } from '@/lib/viewTransition'
import { CImg } from '@/components/ui/CImg'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, StarIcon, TrashIcon } from '@/components/ui/icons'

export function StagedImagesEditor({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndex = useRef<number | null>(null)

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    const next = [...images]
    const [moved] = next.splice(dragIndex.current, 1)
    next.splice(index, 0, moved)
    withViewTransition(() => onChange(next))
    dragIndex.current = index
  }

  function handleSetCover(index: number) {
    withViewTransition(() => onChange([images[index], ...images.filter((_, i) => i !== index)]))
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    withViewTransition(() => onChange(next))
  }

  // Uploads sequentially and commits with a single onChange at the end (rather than one
  // onChange per file) — `images` here is a prop snapshot from the render that kicked this
  // off, so calling onChange repeatedly mid-loop would keep reading that same stale value
  // instead of accumulating what was just uploaded.
  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (list.length === 0) return

    setError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of list) {
        uploaded.push(await uploadImage(file))
      }
      onChange([...images, ...uploaded])
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
        {images.length > 1 && ' გადაათრიეთ თანმიმდევრობის შესაცვლელად — პირველი სურათი არის მაღაზიის ყდის სურათი.'}
      </p>

      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div
            key={url + index}
            draggable
            onDragStart={() => { dragIndex.current = index }}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => { dragIndex.current = null }}
            style={{ viewTransitionName: viewTransitionNameFor(url) }}
            className="relative w-28 h-28 group cursor-grab active:cursor-grabbing"
          >
            {/* Image gets its own clipped layer — the button overlay below deliberately
                isn't clipped too, so its tooltips (which pop outside this box) don't get cut off. */}
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10">
              <CImg src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
            </div>
            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 z-10 rounded bg-fuchsia-600 text-white text-[9px] font-bold px-1.5 py-0.5">
                ყდა
              </span>
            )}
            <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(index)}
                  aria-label="ყდად დაყენება"
                  data-tip="ყდად დაყენება"
                  className="tooltip tooltip-bottom absolute top-1.5 left-1.5 text-white/80 hover:text-white p-1"
                >
                  <StarIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="წაშლა"
                data-tip="წაშლა"
                className="tooltip tooltip-bottom absolute top-1.5 right-1.5 text-red-300 hover:text-red-200 p-1"
              >
                <TrashIcon />
              </button>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="მარცხნივ გადატანა"
                  data-tip="მარცხნივ გადატანა"
                  className="tooltip tooltip-top text-white/70 hover:text-white disabled:opacity-20 p-1"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="მარჯვნივ გადატანა"
                  data-tip="მარჯვნივ გადატანა"
                  className="tooltip tooltip-top text-white/70 hover:text-white disabled:opacity-20 p-1"
                >
                  <ChevronRightIcon />
                </button>
              </div>
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
          disabled={uploading}
          aria-label="სურათის დამატება"
          data-tip="სურათის დამატება"
          className="tooltip tooltip-top w-28 h-28 rounded-xl border border-dashed border-white/12 bg-white/2 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 flex items-center justify-center text-white/30 disabled:opacity-40"
        >
          {uploading ? <span className="loading loading-spinner loading-sm text-fuchsia-400" /> : <PlusIcon />}
        </button>
      </div>

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
