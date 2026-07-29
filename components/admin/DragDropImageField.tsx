'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'
import { CImg } from '@/components/ui/CImg'

// Drop-a-file-from-your-desktop image field for admin forms — click-to-browse still works too
// (the whole zone is a <label> wrapping a hidden file input), drag-and-drop is layered on top via
// the standard dragenter/dragover/dragleave/drop dance: dragOver must preventDefault or the
// browser refuses the drop entirely, and dragCounter (not a plain boolean) is needed because
// dragenter/dragleave fire once per descendant element as the cursor crosses child boundaries —
// a naive boolean would flicker the "active" state off while still hovering over a child.
export function DragDropImageField({
  label,
  value,
  onChange,
  disabled,
}: {
  label?: string
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const isDragActive = dragCounter > 0

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setError(false)
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch {
      setError(true)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fieldset gap-2">
      {label && <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">{label}</label>}

      <label
        onDragEnter={e => { e.preventDefault(); setDragCounter(c => c + 1) }}
        onDragLeave={e => { e.preventDefault(); setDragCounter(c => Math.max(0, c - 1)) }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          setDragCounter(0)
          const file = e.dataTransfer.files?.[0]
          if (file && !disabled) handleFile(file)
        }}
        className={[
          'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 min-h-32 transition-colors cursor-pointer',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          isDragActive ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20',
        ].join(' ')}
      >
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {uploading ? (
          <span className="loading loading-spinner loading-sm text-amber-400" />
        ) : value ? (
          <>
            <CImg src={value} cldWidth={200} alt={label} className="max-h-20 max-w-full object-contain rounded-lg" />
            <p className="text-white/30 text-[11px]">გადმოათრიეთ ან დააჭირეთ შესაცვლელად</p>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-white/25">
              <path d="M4 13.5v2a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-2M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-white/40 text-xs text-center">გადმოათრიეთ სურათი აქ, ან <span className="text-amber-400">დააჭირეთ ასარჩევად</span></p>
          </>
        )}
      </label>

      {error && <p className="text-error text-xs">სურათის ატვირთვა ვერ მოხერხდა.</p>}

      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled}
          className="text-xs text-white/30 hover:text-red-400 text-left w-fit"
        >
          წაშლა
        </button>
      )}
    </div>
  )
}
