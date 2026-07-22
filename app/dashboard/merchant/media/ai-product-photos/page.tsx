'use client'

import { useMemo, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { useLanguage } from '@/lib/i18n'
import type { Strings } from '@/lib/i18n'
import { uploadImage, cloudinaryConfigured } from '@/lib/uploadImage'
import { withTransformation } from '@/lib/media/cloudinary-transform'
import { useAiImageUsage } from '@/lib/queries/merchants'
import { CImg } from '@/components/ui/CImg'
import {
  LIGHTING_PRESETS,
  SCENE_PRESETS,
  SUBJECT_PRESETS,
  composePrompt,
  effectiveSubject,
  type LightingPreset,
  type ScenePreset,
  type SubjectPreset,
} from '@/lib/media/ai-prompt-presets'

const MAX_REFERENCE_IMAGES = 3

const SCENE_LABEL_KEYS: Record<ScenePreset, keyof Strings['aiProductPhotos']> = {
  studio: 'sceneStudio',
  'outdoor-park': 'sceneOutdoorPark',
  'urban-street': 'sceneUrbanStreet',
  beach: 'sceneBeach',
  'indoor-lifestyle': 'sceneIndoorLifestyle',
  'flat-lay': 'sceneFlatLay',
}

const SUBJECT_LABEL_KEYS: Record<SubjectPreset, keyof Strings['aiProductPhotos']> = {
  'model-female': 'subjectModelFemale',
  'model-male': 'subjectModelMale',
  'no-model': 'subjectNoModel',
}

const LIGHTING_LABEL_KEYS: Record<LightingPreset, keyof Strings['aiProductPhotos']> = {
  'bright-clean': 'lightingBrightClean',
  'golden-hour': 'lightingGoldenHour',
  moody: 'lightingMoody',
  'soft-natural': 'lightingSoftNatural',
}

interface GeneratedResult {
  id: string
  imageUrl: string
}

export default function AiProductPhotosPage() {
  const { t } = useLanguage()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: usage } = useAiImageUsage()

  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [scene, setScene] = useState<ScenePreset>('studio')
  const [subject, setSubject] = useState<SubjectPreset>('model-female')
  const [lighting, setLighting] = useState<LightingPreset>('bright-clean')
  const [details, setDetails] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<GeneratedResult[]>([])

  const prompt = useMemo(() => composePrompt(scene, subject, lighting, details), [scene, subject, lighting, details])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_REFERENCE_IMAGES - referenceUrls.length)
    if (files.length === 0) return

    setError('')
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setReferenceUrls(prev => [...prev, ...urls].slice(0, MAX_REFERENCE_IMAGES))
    } catch {
      setError(t.aiProductPhotos.uploadError)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeReference(url: string) {
    setReferenceUrls(prev => prev.filter(u => u !== url))
  }

  const quotaExceeded = !!usage && usage.used >= usage.limit
  const canGenerate = referenceUrls.length > 0 && prompt.trim().length > 0 && !generating && !quotaExceeded && !uploading

  async function handleGenerate() {
    if (!canGenerate) return
    setError('')
    setGenerating(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/media/generate-product-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrls: referenceUrls, prompt: prompt.trim() }),
      })
      const data = (await res.json()) as { imageUrl?: string; error?: string }

      if (!res.ok) {
        setError(res.status === 429 ? t.aiProductPhotos.quotaExceeded : data.error || t.aiProductPhotos.generateError)
        return
      }

      setResults(prev => [{ id: crypto.randomUUID(), imageUrl: data.imageUrl! }, ...prev])
      queryClient.invalidateQueries({ queryKey: ['merchant', 'ai-image-usage'] })
    } catch {
      setError(t.aiProductPhotos.generateError)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.sidebar.aiProductPhotos}</h1>
          <p className="text-white/40 text-sm mt-1 max-w-xl">{t.aiProductPhotos.subtitle}</p>
        </div>
        {usage && (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm shrink-0">
            <span className={quotaExceeded ? 'text-error font-semibold' : 'text-white/70 font-semibold'}>
              {usage.used}/{usage.limit}
            </span>
            <span className="text-white/40 ml-1.5">{t.aiProductPhotos.usageLabel}</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
        <p className="text-white/40 text-xs uppercase tracking-widest">{t.aiProductPhotos.referenceLabel}</p>

        <div className="flex flex-wrap gap-3">
          {referenceUrls.map(url => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/8 group shrink-0">
              <CImg src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeReference(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}

          {referenceUrls.length < MAX_REFERENCE_IMAGES && cloudinaryConfigured && (
            <label className="relative flex flex-col items-center justify-center gap-1 w-24 h-24 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.25] transition-colors cursor-pointer shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading ? (
                <span className="loading loading-spinner loading-sm text-fuchsia-400" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden className="text-white/25">
                    <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-white/30 text-[11px] text-center px-1">{t.aiProductPhotos.uploadPrompt}</span>
                </>
              )}
            </label>
          )}
        </div>

        {!cloudinaryConfigured && (
          <p className="text-amber-400/80 text-xs">
            Cloudinary is not configured — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs uppercase tracking-widest">{t.aiProductPhotos.sceneLabel}</label>
            <select
              value={scene}
              onChange={e => setScene(e.target.value as ScenePreset)}
              className="select bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            >
              {SCENE_PRESETS.map(preset => (
                <option key={preset} value={preset}>{t.aiProductPhotos[SCENE_LABEL_KEYS[preset]]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs uppercase tracking-widest">{t.aiProductPhotos.subjectLabel}</label>
            <select
              value={effectiveSubject(scene, subject)}
              onChange={e => setSubject(e.target.value as SubjectPreset)}
              disabled={scene === 'flat-lay'}
              className="select bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 disabled:opacity-50"
            >
              {SUBJECT_PRESETS.map(preset => (
                <option key={preset} value={preset}>{t.aiProductPhotos[SUBJECT_LABEL_KEYS[preset]]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs uppercase tracking-widest">{t.aiProductPhotos.lightingLabel}</label>
            <select
              value={lighting}
              onChange={e => setLighting(e.target.value as LightingPreset)}
              className="select bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
            >
              {LIGHTING_PRESETS.map(preset => (
                <option key={preset} value={preset}>{t.aiProductPhotos[LIGHTING_LABEL_KEYS[preset]]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-xs uppercase tracking-widest">{t.aiProductPhotos.detailsLabel}</p>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder={t.aiProductPhotos.detailsPlaceholder}
            rows={2}
            className="textarea bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-white/30 text-xs uppercase tracking-widest">{t.aiProductPhotos.promptPreviewLabel}</p>
          <p className="text-white/50 text-sm italic rounded-xl border border-white/6 bg-white/[0.015] px-4 py-3">{prompt}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn h-auto rounded-xl px-6 py-3.5 normal-case font-semibold gap-2 bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30 disabled:opacity-40 self-start"
        >
          {generating && <span className="loading loading-spinner loading-sm" />}
          {generating ? t.aiProductPhotos.generating : t.aiProductPhotos.generate}
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-white text-sm">{t.aiProductPhotos.resultsTitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(result => (
              <div key={result.id} className="flex flex-col gap-2">
                <div className="rounded-xl overflow-hidden border border-white/8">
                  <CImg src={result.imageUrl} alt="" className="w-full object-cover" />
                </div>
                <a
                  href={withTransformation(result.imageUrl, 'fl_attachment')}
                  className="btn h-auto rounded-xl px-4 py-2.5 normal-case font-semibold self-start bg-fuchsia-500/15 border-fuchsia-500/25 text-fuchsia-300 hover:bg-fuchsia-500/25"
                >
                  {t.aiProductPhotos.download}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
