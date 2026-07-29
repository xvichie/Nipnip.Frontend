'use client'

import { useState } from 'react'
import { useCreatePage, useDeletePage, useMyPages, useUpdatePage } from '@/lib/queries/storefront-admin'
import { hasAnyTranslatedValue, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import { RichTranslatedField } from '@/components/dashboard/store/RichTranslatedField'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { useAnimatedModal } from '@/lib/useAnimatedModal'
import { stripHtml } from '@/lib/html'
import type { StorePageResponse } from '@/lib/types/storefront'

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

function titleOf(page: StorePageResponse): TranslatedFieldValue {
  return { ka: page.titleKa ?? '', en: page.titleEn ?? '', ru: page.titleRu ?? '' }
}

function contentOf(page: StorePageResponse): TranslatedFieldValue {
  return { ka: page.contentKa ?? '', en: page.contentEn ?? '', ru: page.contentRu ?? '' }
}

function PageModal({
  page,
  onClose,
}: {
  page?: StorePageResponse
  onClose: () => void
}) {
  const isEditing = !!page
  const { closing, close } = useAnimatedModal(onClose)
  const { mutate: createPage, isPending: isCreating, error: createError } = useCreatePage()
  const { mutate: updatePage, isPending: isSaving, error: updateError } = useUpdatePage()

  const [title, setTitle] = useState<TranslatedFieldValue>(page ? titleOf(page) : EMPTY_TRANSLATED)
  const [content, setContent] = useState<TranslatedFieldValue>(page ? contentOf(page) : EMPTY_TRANSLATED)

  const isPending = isCreating || isSaving
  const error = createError ?? updateError
  const canSubmit = hasAnyTranslatedValue(stripTranslated(title)) && hasAnyTranslatedValue(stripTranslated(content))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const body = {
      titleKa: stripHtml(title.ka) ? title.ka : null,
      titleEn: stripHtml(title.en) ? title.en : null,
      titleRu: stripHtml(title.ru) ? title.ru : null,
      contentKa: stripHtml(content.ka) ? content.ka : null,
      contentEn: stripHtml(content.en) ? content.en : null,
      contentRu: stripHtml(content.ru) ? content.ru : null,
    }
    if (isEditing) {
      updatePage({ id: page.id, body }, { onSuccess: close })
    } else {
      createPage(body, { onSuccess: close })
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={close} />
      <div className={`relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh] ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{isEditing ? 'გვერდის რედაქტირება' : 'ახალი გვერდი'}</h3>
          <button
            type="button"
            onClick={close}
            aria-label="დახურვა"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-4 overflow-y-auto">
          {!isEditing && (
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
          )}

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">სათაური</label>
            <RichTranslatedField value={title} onChange={setTitle} placeholders={{ ka: 'გვერდის სათაური' }} variant="inline" />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">შინაარსი</label>
            <RichTranslatedField value={content} onChange={setContent} placeholders={{ ka: 'გვერდის შინაარსი' }} variant="block" />
          </div>

          {error != null && <p className="text-error text-sm">ვერ შეინახა — გადაამოწმეთ ველები.</p>}
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="btn flex-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : isEditing ? 'შენახვა' : 'გვერდის დამატება'}
          </button>
          <button type="button" onClick={close} className="btn bg-white/4 border-white/8 text-white/60 hover:text-white">
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MerchantStorePagesPage() {
  const { data: pages, isLoading } = useMyPages()
  const { mutate: deletePage, isPending: isDeleting } = useDeletePage()
  const [modal, setModal] = useState<'create' | StorePageResponse | null>(null)

  function handleDelete(id: string, pageTitle: string) {
    if (!confirm(`წავშალო გვერდი "${pageTitle}"?`)) return
    deletePage(id)
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">გვერდები</h2>
            <p className="text-white/30 text-xs mt-1">
              მაგ. დაბრუნების პოლიტიკა, ჩვენს შესახებ, კონფიდენციალურობის პოლიტიკა — გამოჩნდება მაღაზიის ქვედა კოლონტიტულში.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal('create')}
            className="btn btn-sm gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white shrink-0"
          >
            <PlusIcon /> დამატება
          </button>
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
                <div className="flex gap-1.5 shrink-0">
                  <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={() => setModal(page)} />
                  <IconButton
                    icon={<TrashIcon />}
                    label="წაშლა"
                    onClick={() => handleDelete(page.id, stripHtml(page.title))}
                    disabled={isDeleting}
                    variant="danger"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">გვერდები ჯერ არ გაქვთ.</p>
        )}
      </div>

      {modal && (
        <PageModal
          page={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
