'use client'

import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'

// Cloudinary transformations are just URL segments — no separate processing call needed;
// the transformed image is generated (and cached) on first request.
function withTransformation(url: string, transformation: string): string {
  return url.replace('/upload/', `/upload/${transformation}/`)
}

// Classic checkerboard pattern to show transparency in the background-removed preview.
const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #2a2a34 25%, transparent 25%), linear-gradient(-45deg, #2a2a34 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a34 75%), linear-gradient(-45deg, transparent 75%, #2a2a34 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
}

export default function PostCreatorPage() {
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)

  const [originalUrl, setOriginalUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setResultUrl('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setOriginalUrl(url)
      // f_png is required — without it Cloudinary keeps the original (e.g. jpg) format, which
      // can't represent transparency, so the "background removed" result silently isn't.
      setResultUrl(withTransformation(url, 'e_background_removal,f_png'))
    } catch {
      setError(t.postCreator.uploadError)
      setOriginalUrl('')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.sidebar.postCreator}</h1>
        <p className="text-white/40 text-sm mt-1">{t.postCreator.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <div>
          <p className="font-bold text-white text-sm">{t.postCreator.bgRemoveTitle}</p>
          <p className="text-white/40 text-xs mt-1">{t.postCreator.bgRemoveHint}</p>
        </div>

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
                <span className="text-white/30 text-sm">{t.postCreator.uploadPrompt}</span>
              </>
            )}
          </label>
        )}

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {resultUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-white/40 text-xs uppercase tracking-widest">{t.postCreator.original}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl} alt="" className="w-full rounded-xl object-cover border border-white/8" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white/40 text-xs uppercase tracking-widest">{t.postCreator.bgRemoved}</p>
              <div className="rounded-xl overflow-hidden border border-white/8" style={CHECKERBOARD_STYLE}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="" className="w-full object-contain" />
              </div>
              <a
                href={withTransformation(originalUrl, 'e_background_removal,f_png,fl_attachment')}
                className="btn btn-sm bg-fuchsia-500/15 border-fuchsia-500/25 text-fuchsia-300 hover:bg-fuchsia-500/25 rounded-xl normal-case font-semibold self-start"
              >
                {t.postCreator.download}
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
