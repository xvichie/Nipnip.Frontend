'use client'

import { useEffect, useRef, useState } from 'react'
import { useCreatorMe, useUpdateCreator } from '@/lib/queries/creators'
import { uploadImage } from '@/lib/uploadImage'
import { useLanguage } from '@/lib/i18n'

export default function CreatorSettingsPage() {
  const { data: creator, isLoading } = useCreatorMe()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [instagram, setInstagram] = useState('')
  const [instagramFollowers, setInstagramFollowers] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [tiktokFollowers, setTiktokFollowers] = useState('')
  const [youtube, setYoutube] = useState('')
  const [youtubeFollowers, setYoutubeFollowers] = useState('')
  const [facebook, setFacebook] = useState('')
  const [facebookFollowers, setFacebookFollowers] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [xFollowers, setXFollowers] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [linkedinFollowers, setLinkedinFollowers] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!creator) return
    setName(creator.name)
    setAvatarUrl(creator.avatarUrl ?? '')
    setInstagram(creator.instagramHandle ?? '')
    setInstagramFollowers(creator.instagramFollowers != null ? String(creator.instagramFollowers) : '')
    setTiktok(creator.tiktokHandle ?? '')
    setTiktokFollowers(creator.tiktokFollowers != null ? String(creator.tiktokFollowers) : '')
    setYoutube(creator.youtubeHandle ?? '')
    setYoutubeFollowers(creator.youtubeFollowers != null ? String(creator.youtubeFollowers) : '')
    setFacebook(creator.facebookHandle ?? '')
    setFacebookFollowers(creator.facebookFollowers != null ? String(creator.facebookFollowers) : '')
    setXHandle(creator.xHandle ?? '')
    setXFollowers(creator.xFollowers != null ? String(creator.xFollowers) : '')
    setLinkedin(creator.linkedinHandle ?? '')
    setLinkedinFollowers(creator.linkedinFollowers != null ? String(creator.linkedinFollowers) : '')
  }, [creator])

  async function handleAvatarFile(file: File) {
    setAvatarUploadError(null)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const url = await uploadImage(file)
      setAvatarUrl(url)
      setAvatarPreview(null)
    } catch {
      setAvatarUploadError(t.settings.uploadError)
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
    }
  }

  const { mutate, isPending, error } = useUpdateCreator(creator?.id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!creator || isPending) return

    const igFollowers = parseInt(instagramFollowers)
    const ttFollowers = parseInt(tiktokFollowers)
    const ytFollowers = parseInt(youtubeFollowers)
    const fbFollowers = parseInt(facebookFollowers)
    const xFollowersInt = parseInt(xFollowers)
    const liFollowers = parseInt(linkedinFollowers)
    mutate(
      {
        name: name.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        instagramHandle: instagram.trim() || null,
        instagramFollowers: isNaN(igFollowers) ? null : igFollowers,
        tiktokHandle: tiktok.trim() || null,
        tiktokFollowers: isNaN(ttFollowers) ? null : ttFollowers,
        youtubeHandle: youtube.trim() || null,
        youtubeFollowers: isNaN(ytFollowers) ? null : ytFollowers,
        facebookHandle: facebook.trim() || null,
        facebookFollowers: isNaN(fbFollowers) ? null : fbFollowers,
        xHandle: xHandle.trim() || null,
        xFollowers: isNaN(xFollowersInt) ? null : xFollowersInt,
        linkedinHandle: linkedin.trim() || null,
        linkedinFollowers: isNaN(liFollowers) ? null : liFollowers,
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        },
      }
    )
  }

  const initials = (creator?.name ?? '??').slice(0, 2).toUpperCase()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-lg">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.settings.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.settings.profileSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={creator?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-xl font-black text-violet-400 select-none">
            {initials}
          </div>
        )}
        <div>
          <p className="font-bold text-white text-sm">{creator?.name}</p>
          <p className="text-white/30 text-xs mt-0.5">@{creator?.slug}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="fieldset gap-2">
            <label htmlFor="name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.nameLabel} <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-white/4 border-white/10 focus:border-violet-500/60"
              placeholder="Giorgi Kvaratskhelia"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.avatarSection}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
            />
            <div
              className="relative flex items-center gap-4 rounded-xl border border-dashed border-white/12 bg-white/2 p-4 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUploading ? (
                <div className="w-14 h-14 rounded-full bg-white/4 border border-white/8 flex items-center justify-center shrink-0">
                  <span className="loading loading-spinner loading-sm text-violet-400" />
                </div>
              ) : (avatarPreview ?? avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview ?? avatarUrl}
                  alt="avatar preview"
                  className="w-14 h-14 rounded-full object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                    <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/70">
                  {avatarUploading ? t.settings.uploading : t.settings.uploadPhoto}
                </p>
                <p className="text-xs text-white/30 mt-0.5 truncate">
                  {t.settings.clickToSelect}
                </p>
              </div>
            </div>
            {avatarUploadError && (
              <p className="text-xs text-error">{avatarUploadError}</p>
            )}
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="instagram" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.instagramLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi.creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={instagramFollowers}
                onChange={e => setInstagramFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="tiktok" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.tiktokLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="tiktok"
                  type="text"
                  value={tiktok}
                  onChange={e => setTiktok(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi.creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={tiktokFollowers}
                onChange={e => setTiktokFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="youtube" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.youtubeLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="youtube"
                  type="text"
                  value={youtube}
                  onChange={e => setYoutube(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi.creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={youtubeFollowers}
                onChange={e => setYoutubeFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="facebook" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.facebookLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="facebook"
                  type="text"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi.creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={facebookFollowers}
                onChange={e => setFacebookFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="x-handle" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.xLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="x-handle"
                  type="text"
                  value={xHandle}
                  onChange={e => setXHandle(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi.creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={xFollowers}
                onChange={e => setXFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label htmlFor="linkedin" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.linkedinLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.optional}</span>
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1 min-w-0">
                <span className="flex items-center px-3 text-white/30 text-sm bg-white/3 border border-r-0 border-white/10 rounded-l-(--radius-field) select-none shrink-0">
                  @
                </span>
                <input
                  id="linkedin"
                  type="text"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  className="input flex-1 bg-white/4 border-white/10 rounded-l-none focus:border-violet-500/60 min-w-0"
                  placeholder="giorgi-creator"
                />
              </div>
              <input
                type="number"
                min="0"
                value={linkedinFollowers}
                onChange={e => setLinkedinFollowers(e.target.value)}
                className="input w-32 bg-white/4 border-white/10 focus:border-violet-500/60 tabular-nums shrink-0"
                placeholder={t.settings.followersPlaceholder}
              />
            </div>
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              {t.settings.slugLabel}
              <span className="text-white/30 normal-case font-normal ml-1">{t.settings.readOnly}</span>
            </label>
            <input
              type="text"
              value={creator?.slug ?? ''}
              disabled
              className="input w-full bg-white/2 border-white/6 text-white/30 cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {t.settings.saveError}
            </div>
          )}

          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t.settings.saveSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="btn btn-primary w-full mt-1 gap-2"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                {t.common.save}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  )
}
