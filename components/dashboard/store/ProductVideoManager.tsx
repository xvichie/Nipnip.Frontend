'use client'

import { useRef, useState } from 'react'
import { uploadVideo } from '@/lib/uploadImage'
import { useUpdateProduct } from '@/lib/queries/storefront-admin'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon } from '@/components/ui/icons'

export function ProductVideoManager({ productId, videoUrl }: { productId: string; videoUrl: string | null }) {
  const { mutate: updateProduct, isPending } = useUpdateProduct(productId)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadVideo(file)
      updateProduct({ videoUrl: url })
    } catch {
      setError('ატვირთვა ვერ მოხერხდა. შეამოწმეთ Cloudinary-ის კონფიგურაცია და სცადეთ თავიდან.')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    updateProduct({ videoUrl: '' })
  }

  const busy = uploading || isPending

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ვიდეო</h2>

      {videoUrl ? (
        <div className="flex flex-col gap-3">
          <video src={videoUrl} controls className="w-full max-w-xs rounded-xl border border-white/10 bg-black" />
          <div className="flex gap-1.5">
            <IconButton
              icon={busy ? <span className="loading loading-spinner loading-xs" /> : <EditIcon />}
              label="შეცვლა"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            />
            <IconButton icon={<TrashIcon />} label="წაშლა" onClick={handleRemove} disabled={busy} variant="danger" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full h-24 rounded-xl border border-dashed border-white/12 bg-white/2 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 flex items-center justify-center gap-1.5 text-white/30 text-sm disabled:opacity-40"
        >
          {busy ? <span className="loading loading-spinner loading-sm text-fuchsia-400" /> : <><PlusIcon /> პროდუქტის ვიდეოს ატვირთვა</>}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
