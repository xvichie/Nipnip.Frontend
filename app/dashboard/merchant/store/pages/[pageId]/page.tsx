'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMyPages, useUpdatePage } from '@/lib/queries/storefront-admin'

export default function MerchantStorePageEditPage() {
  const { pageId } = useParams<{ pageId: string }>()
  const router = useRouter()
  const { data: pages, isLoading } = useMyPages()
  const { mutate: updatePage, isPending, error } = useUpdatePage()

  const page = pages?.find(p => p.id === pageId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!page) return
    setTitle(page.title)
    setContent(page.content)
  }, [page])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updatePage(
      { id: pageId, body: { title: title.trim(), content: content.trim() } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="rounded-2xl border border-white/7 bg-white/2 p-8 text-center">
          <p className="text-white/50 text-sm">გვერდი ვერ მოიძებნა.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <button
        type="button"
        onClick={() => router.push('/dashboard/merchant/store/pages')}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors self-start"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        გვერდებს დაბრუნება
      </button>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სათაური</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              required
            />
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">შინაარსი</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={14}
              className="textarea w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              ცვლილებების შენახვა ვერ მოხერხდა.
            </div>
          )}
          {saved && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              წარმატებით შეინახა
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !title.trim() || !content.trim()}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'შენახვა'}
          </button>
        </form>
      </div>
    </div>
  )
}
