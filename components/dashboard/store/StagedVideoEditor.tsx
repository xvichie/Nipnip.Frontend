'use client'

import { useRef, useState } from 'react'
import { uploadVideo } from '@/lib/uploadImage'

export function StagedVideoEditor({ videoUrl, onChange }: { videoUrl: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const url = await uploadVideo(file)
      onChange(url)
    } catch {
      setError('Upload failed. Check Cloudinary config and try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Video</h2>

      {videoUrl ? (
        <div className="flex flex-col gap-3">
          <video src={videoUrl} controls className="w-full max-w-xs rounded-xl border border-white/10 bg-black" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-xs bg-white/4 border-white/10 text-white/70 hover:text-white disabled:opacity-40"
            >
              {uploading ? <span className="loading loading-spinner loading-xs" /> : 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={uploading}
              className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 rounded-xl border border-dashed border-white/12 bg-white/2 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 flex items-center justify-center text-white/30 text-sm disabled:opacity-40"
        >
          {uploading ? <span className="loading loading-spinner loading-sm text-fuchsia-400" /> : '+ Upload a product video'}
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
