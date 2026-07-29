'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMyPages, useUpdatePage } from '@/lib/queries/storefront-admin'
import { hasAnyTranslatedValue, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import { RichTranslatedField } from '@/components/dashboard/store/RichTranslatedField'
import { stripHtml } from '@/lib/html'

const EMPTY_TRANSLATED: TranslatedFieldValue = { ka: '', en: '', ru: '' }

// Title/content are HTML now — an "empty" Tiptap doc is still "<p></p>", not "", so validity
// needs the stripped plain-text length rather than a raw string check.
function stripTranslated(value: TranslatedFieldValue): TranslatedFieldValue {
  return { ka: stripHtml(value.ka), en: stripHtml(value.en), ru: stripHtml(value.ru) }
}

export default function MerchantStorePageEditPage() {
  const { pageId } = useParams<{ pageId: string }>()
  const router = useRouter()
  const { data: pages, isLoading } = useMyPages()
  const { mutate: updatePage, isPending, error } = useUpdatePage()

  const page = pages?.find(p => p.id === pageId)

  const [title, setTitle] = useState<TranslatedFieldValue>(EMPTY_TRANSLATED)
  const [content, setContent] = useState<TranslatedFieldValue>(EMPTY_TRANSLATED)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!page) return
    setTitle({ ka: page.titleKa ?? '', en: page.titleEn ?? '', ru: page.titleRu ?? '' })
    setContent({ ka: page.contentKa ?? '', en: page.contentEn ?? '', ru: page.contentRu ?? '' })
  }, [page])

  const canSubmit = hasAnyTranslatedValue(stripTranslated(title)) && hasAnyTranslatedValue(stripTranslated(content))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updatePage(
      {
        id: pageId,
        body: {
          titleKa: stripHtml(title.ka) ? title.ka : null,
          titleEn: stripHtml(title.en) ? title.en : null,
          titleRu: stripHtml(title.ru) ? title.ru : null,
          contentKa: stripHtml(content.ka) ? content.ka : null,
          contentEn: stripHtml(content.en) ? content.en : null,
          contentRu: stripHtml(content.ru) ? content.ru : null,
        },
      },
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
            <RichTranslatedField value={title} onChange={setTitle} variant="inline" />
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">შინაარსი</label>
            <RichTranslatedField value={content} onChange={setContent} variant="block" />
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
            disabled={isPending || !canSubmit}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'შენახვა'}
          </button>
        </form>
      </div>
    </div>
  )
}
