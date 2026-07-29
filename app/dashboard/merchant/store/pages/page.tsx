'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCreatePage, useDeletePage, useMyPages } from '@/lib/queries/storefront-admin'
import { hasAnyTranslatedValue, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import { RichTranslatedField } from '@/components/dashboard/store/RichTranslatedField'
import { stripHtml } from '@/lib/html'

const PRESETS = [
  'დაბრუნების პოლიტიკა',
  'ჩვენს შესახებ',
  'კონფიდენციალურობის პოლიტიკა',
  'მომსახურების პირობები',
  'უსაფრთხოების პოლიტიკა',
  'მიწოდების პირობები',
]

const EMPTY_TRANSLATED: TranslatedFieldValue = { ka: '', en: '', ru: '' }

// Title/content are HTML now — an "empty" Tiptap doc is still "<p></p>", not "", so validity
// needs the stripped plain-text length rather than a raw string check.
function stripTranslated(value: TranslatedFieldValue): TranslatedFieldValue {
  return { ka: stripHtml(value.ka), en: stripHtml(value.en), ru: stripHtml(value.ru) }
}

export default function MerchantStorePagesPage() {
  const { data: pages, isLoading } = useMyPages()
  const { mutate: createPage, isPending: isCreating, error: createError } = useCreatePage()
  const { mutate: deletePage, isPending: isDeleting } = useDeletePage()

  const [title, setTitle] = useState<TranslatedFieldValue>(EMPTY_TRANSLATED)
  const [content, setContent] = useState<TranslatedFieldValue>(EMPTY_TRANSLATED)

  const canSubmit = hasAnyTranslatedValue(stripTranslated(title)) && hasAnyTranslatedValue(stripTranslated(content))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createPage(
      {
        titleKa: stripHtml(title.ka) ? title.ka : null,
        titleEn: stripHtml(title.en) ? title.en : null,
        titleRu: stripHtml(title.ru) ? title.ru : null,
        contentKa: stripHtml(content.ka) ? content.ka : null,
        contentEn: stripHtml(content.en) ? content.en : null,
        contentRu: stripHtml(content.ru) ? content.ru : null,
      },
      { onSuccess: () => { setTitle(EMPTY_TRANSLATED); setContent(EMPTY_TRANSLATED) } }
    )
  }

  function handleDelete(id: string, pageTitle: string) {
    if (!confirm(`წავშალო გვერდი "${pageTitle}"?`)) return
    deletePage(id)
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">გვერდები</h2>
          <p className="text-white/30 text-xs mt-1">
            მაგ. დაბრუნების პოლიტიკა, ჩვენს შესახებ, კონფიდენციალურობის პოლიტიკა — გამოჩნდება მაღაზიის ქვედა კოლონტიტულში.
          </p>
        </div>

        {isLoading ? (
          <div className="skeleton h-16 rounded-xl" />
        ) : pages && pages.length > 0 ? (
          <div className="flex flex-col gap-2">
            {pages.map(page => (
              <div
                key={page.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-white">{stripHtml(page.title)}</span>
                  <span className="text-white/25 text-xs ml-1.5">/{page.slug}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/dashboard/merchant/store/pages/${page.id}`}
                    className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white"
                  >
                    რედაქტირება
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(page.id, stripHtml(page.title))}
                    disabled={isDeleting}
                    className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                  >
                    წაშლა
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">გვერდები ჯერ არ გაქვთ.</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setTitle(v => ({ ...v, ka: preset }))}
                className="rounded-lg border px-2.5 py-1 text-xs transition-colors bg-white/4 border-white/8 text-white/50 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>

          <RichTranslatedField value={title} onChange={setTitle} placeholders={{ ka: 'გვერდის სათაური' }} variant="inline" />
          <RichTranslatedField value={content} onChange={setContent} placeholders={{ ka: 'გვერდის შინაარსი' }} variant="block" />

          {createError && <p className="text-error text-xs">გვერდის შექმნა ვერ მოხერხდა.</p>}
          <button
            type="submit"
            disabled={isCreating || !canSubmit}
            className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isCreating ? <span className="loading loading-spinner loading-xs" /> : 'გვერდის დამატება'}
          </button>
        </form>
      </div>
    </div>
  )
}
