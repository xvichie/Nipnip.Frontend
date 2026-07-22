'use client'

import { useState } from 'react'
import { useFacebookProductPreview, useFacebookPublish, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramProductPreview, useInstagramPublish, useInstagramStatus } from '@/lib/queries/instagram'
import { useTikTokProductPreview, useTikTokPublish, useTikTokStatus } from '@/lib/queries/tiktok'
import { BetaBadge } from './BetaBadge'
import { CImg } from '@/components/ui/CImg'

type Platform = 'choose' | 'facebook' | 'instagram' | 'tiktok'

export function ExportProductButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('choose')

  const { data: fbStatus, isLoading: fbStatusLoading } = useFacebookStatus()
  const fbConnected = fbStatus?.connected ?? false
  const { data: igStatus, isLoading: igStatusLoading } = useInstagramStatus()
  const igConnected = igStatus?.connected ?? false
  const { data: ttStatus, isLoading: ttStatusLoading } = useTikTokStatus()
  const ttConnected = ttStatus?.connected ?? false

  const { data: fbPreview, isLoading: fbPreviewLoading } = useFacebookProductPreview(productId, open && platform === 'facebook')
  const { data: igPreview, isLoading: igPreviewLoading } = useInstagramProductPreview(productId, open && platform === 'instagram')
  const { data: ttPreview, isLoading: ttPreviewLoading } = useTikTokProductPreview(productId, open && platform === 'tiktok')
  const preview = platform === 'facebook' ? fbPreview : platform === 'instagram' ? igPreview : undefined
  const previewLoading = platform === 'facebook' ? fbPreviewLoading : platform === 'instagram' ? igPreviewLoading : platform === 'tiktok' ? ttPreviewLoading : false

  // "Adjust state during render" instead of an effect — seeds the editable textarea
  // once from the fetched default message; close() resets both so reopening re-seeds fresh.
  const [message, setMessage] = useState('')
  const [seededMessage, setSeededMessage] = useState<string | null>(null)
  if (preview && preview.message !== seededMessage) {
    setSeededMessage(preview.message)
    setMessage(preview.message)
  }

  // TikTok has separate title/description fields (not one message), seeded the same way.
  const [ttTitle, setTtTitle] = useState('')
  const [ttDescription, setTtDescription] = useState('')
  const [ttAutoMusic, setTtAutoMusic] = useState(false)
  const [seededTt, setSeededTt] = useState(false)
  if (ttPreview && !seededTt) {
    setSeededTt(true)
    setTtTitle(ttPreview.title)
    setTtDescription(ttPreview.description)
  }

  const { mutate: publishFacebook, isPending: fbPending } = useFacebookPublish()
  const { mutate: publishInstagram, isPending: igPending } = useInstagramPublish()
  const { mutate: publishTikTok, isPending: ttPending } = useTikTokPublish()
  const isPending = platform === 'facebook' ? fbPending : platform === 'instagram' ? igPending : platform === 'tiktok' ? ttPending : false

  const [result, setResult] = useState<{ postUrl: string } | null>(null)
  const [ttResult, setTtResult] = useState<{ privacyLevel: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function close() {
    if (isPending) return
    setOpen(false)
    setPlatform('choose')
    setMessage('')
    setSeededMessage(null)
    setTtTitle('')
    setTtDescription('')
    setTtAutoMusic(false)
    setSeededTt(false)
    setResult(null)
    setTtResult(null)
    setError(null)
  }

  function handlePublish() {
    setError(null)
    const onSuccess = (data: { postUrl: string }) => setResult(data)
    const onError = () => setError(`Failed to post to your ${platform === 'facebook' ? 'Facebook Page' : 'Instagram account'}.`)

    if (platform === 'facebook') publishFacebook({ productId, message: message.trim() }, { onSuccess, onError })
    else if (platform === 'instagram') publishInstagram({ productId, message: message.trim() }, { onSuccess, onError })
    else if (platform === 'tiktok') {
      publishTikTok(
        { productId, title: ttTitle.trim(), description: ttDescription.trim(), autoAddMusic: ttAutoMusic },
        {
          onSuccess: data => setTtResult({ privacyLevel: data.privacyLevel }),
          onError: () => setError('Failed to post to your TikTok account.'),
        },
      )
    }
  }

  if (fbStatusLoading || igStatusLoading || ttStatusLoading) return null

  const platformLabel = platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : platform === 'tiktok' ? 'TikTok' : ''

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-sm gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white hover:border-white/20"
      >
        Export
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="text-sm font-semibold text-white">
                {platform === 'choose' ? 'Export product' : `Post to ${platformLabel}`}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {platform === 'choose' ? (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <p className="text-white/40 text-xs leading-relaxed">Choose where to post this product.</p>

                <button
                  type="button"
                  onClick={() => setPlatform('facebook')}
                  disabled={!fbConnected}
                  className="btn w-full justify-start gap-3 bg-[#1877F2]/15 border-[#1877F2]/30 text-[#8fb8fa] hover:bg-[#1877F2]/25 disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M9.5 1.75h-2A2.75 2.75 0 0 0 4.75 4.5v1.75H3v2.25h1.75V12.25h2.25V8.5H8.7l.3-2.25H7V4.5c0-.483.392-.875.875-.875h1.625V1.75Z"
                      fill="currentColor"
                    />
                  </svg>
                  Facebook
                  {!fbConnected && <span className="text-white/30 text-xs font-normal ml-auto">Connect first</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  disabled={!igConnected}
                  className="btn w-full justify-start gap-3 bg-gradient-to-r from-[#feda75]/15 via-[#d62976]/15 to-[#4f5bd5]/15 border-[#d62976]/30 text-[#f0a1c0] hover:from-[#feda75]/25 hover:via-[#d62976]/25 hover:to-[#4f5bd5]/25 disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="11.8" cy="4.2" r="0.9" fill="currentColor"/>
                  </svg>
                  Instagram
                  <BetaBadge />
                  {!igConnected && <span className="text-white/30 text-xs font-normal ml-auto">Connect first</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('tiktok')}
                  disabled={!ttConnected}
                  className="btn w-full justify-start gap-3 bg-white/8 border-white/15 text-white/80 hover:bg-white/12 disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M11.5 1.5c.28 1.4 1.15 2.4 2.5 2.6v1.9c-.95-.03-1.8-.34-2.5-.86v4.1a3.6 3.6 0 1 1-3.6-3.6c.16 0 .3.01.45.03v1.95a1.7 1.7 0 1 0 1.25 1.64V1.5h1.9Z"
                      fill="currentColor"
                    />
                  </svg>
                  TikTok
                  <BetaBadge />
                  {!ttConnected && <span className="text-white/30 text-xs font-normal ml-auto">Connect first</span>}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-5 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setPlatform('choose')}
                  className="text-white/30 hover:text-white/60 text-xs self-start flex items-center gap-1"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>

                {platform === 'tiktok' ? (
                  ttResult ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                      Posted to TikTok — visible as: {ttResult.privacyLevel.replaceAll('_', ' ').toLowerCase()}.
                      {ttResult.privacyLevel !== 'PUBLIC_TO_EVERYONE' && (
                        <p className="text-emerald-400/70 text-xs mt-1">
                          Your app isn&apos;t yet audited by TikTok, so early posts are only visible to your own account.
                        </p>
                      )}
                    </div>
                  ) : ttPreviewLoading || !ttPreview ? (
                    <div className="flex flex-col gap-3">
                      <div className="skeleton h-24 rounded-xl" />
                      <div className="skeleton h-9 rounded-xl" />
                      <div className="skeleton h-24 rounded-xl" />
                    </div>
                  ) : (
                    <>
                      {ttPreview.imageUrls.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto">
                          {ttPreview.imageUrls.map((url, i) => (
                            <CImg key={url + i} src={url} alt="" className="w-20 h-20 shrink-0 object-cover rounded-lg border border-white/10" />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                          TikTok photo posts need at least one photo — add one to this product first.
                        </div>
                      )}

                      <div className="fieldset gap-2">
                        <label htmlFor="tt-title" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                          Title
                        </label>
                        <input
                          id="tt-title"
                          value={ttTitle}
                          onChange={e => setTtTitle(e.target.value)}
                          disabled={isPending}
                          maxLength={90}
                          className="input w-full bg-white/4 border-white/10 focus:border-white/30"
                        />
                      </div>

                      <div className="fieldset gap-2">
                        <label htmlFor="tt-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                          Description
                        </label>
                        <textarea
                          id="tt-description"
                          value={ttDescription}
                          onChange={e => setTtDescription(e.target.value)}
                          rows={5}
                          disabled={isPending}
                          className="textarea w-full bg-white/4 border-white/10 focus:border-white/30 resize-none"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs text-white/50">
                        <input
                          type="checkbox"
                          checked={ttAutoMusic}
                          onChange={e => setTtAutoMusic(e.target.checked)}
                          disabled={isPending}
                          className="checkbox checkbox-xs checkbox-secondary"
                        />
                        Let TikTok add recommended music
                      </label>

                      {error && (
                        <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                          {error}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={isPending || !ttTitle.trim() || ttPreview.imageUrls.length === 0}
                        className="btn w-full gap-2 text-white disabled:opacity-40 bg-white/15 hover:bg-white/20 border-white/20"
                      >
                        {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Post to TikTok'}
                      </button>
                    </>
                  )
                ) : result ? (
                  <>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                      Posted to your {platform === 'facebook' ? 'Facebook Page' : 'Instagram account'}.
                    </div>
                    <a
                      href={result.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm w-fit gap-2 bg-white/4 border-white/10 text-white/70 hover:text-white"
                    >
                      View on {platform === 'facebook' ? 'Facebook' : 'Instagram'} →
                    </a>
                  </>
                ) : previewLoading || !preview ? (
                  <div className="flex flex-col gap-3">
                    <div className="skeleton h-40 rounded-xl" />
                    <div className="skeleton h-28 rounded-xl" />
                  </div>
                ) : (
                  <>
                    {preview.imageUrl ? (
                      <CImg src={preview.imageUrl} alt="" className="w-full h-40 object-cover rounded-xl border border-white/10" />
                    ) : platform === 'instagram' ? (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        Instagram posts need at least one photo — add one to this product first.
                      </div>
                    ) : null}

                    <div className="fieldset gap-2">
                      <label htmlFor="export-message" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                        Post text
                      </label>
                      <textarea
                        id="export-message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={7}
                        disabled={isPending}
                        className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
                      />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={isPending || !message.trim() || (platform === 'instagram' && !preview.imageUrl)}
                      className={[
                        'btn w-full gap-2 text-white disabled:opacity-40',
                        platform === 'facebook'
                          ? 'bg-[#1877F2] hover:bg-[#1567d8] border-[#1877F2] hover:border-[#1567d8]'
                          : 'bg-[#d62976] hover:bg-[#c02268] border-[#d62976] hover:border-[#c02268]',
                      ].join(' ')}
                    >
                      {isPending ? <span className="loading loading-spinner loading-sm" /> : `Post to ${platform === 'facebook' ? 'Facebook' : 'Instagram'}`}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
