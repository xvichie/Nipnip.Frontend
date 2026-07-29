'use client'

import { useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, parseThemeConfig } from '@/lib/store/theme-config'
import { TranslatedField, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import { IconButton } from '@/components/ui/IconButton'
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons'
import { useAnimatedModal } from '@/lib/useAnimatedModal'
import type { FaqItem } from '@/lib/types/storefront'

const EMPTY_TRANSLATED: TranslatedFieldValue = { ka: '', en: '', ru: '' }

function questionValueOf(item: FaqItem): TranslatedFieldValue {
  return { ka: item.question, en: item.translations?.en?.question ?? '', ru: item.translations?.ru?.question ?? '' }
}

function answerValueOf(item: FaqItem): TranslatedFieldValue {
  return { ka: item.answer, en: item.translations?.en?.answer ?? '', ru: item.translations?.ru?.answer ?? '' }
}

// FAQ items aren't persisted individually — they're one array field inside the store's
// ThemeConfig JSON, saved all together by the page-level "შენახვა" button — so this modal only
// hands the edited {question, answer} pair back to the parent's local faqItems state on submit,
// with no API call of its own.
function FaqItemModal({
  item,
  onSave,
  onClose,
}: {
  item?: FaqItem
  onSave: (item: FaqItem) => void
  onClose: () => void
}) {
  const isEditing = !!item
  const { closing, close } = useAnimatedModal(onClose)
  const [question, setQuestion] = useState<TranslatedFieldValue>(item ? questionValueOf(item) : EMPTY_TRANSLATED)
  const [answer, setAnswer] = useState<TranslatedFieldValue>(item ? answerValueOf(item) : EMPTY_TRANSLATED)

  const canSubmit = !!question.ka.trim() || !!question.en.trim() || !!question.ru.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSave({
      question: question.ka,
      answer: answer.ka,
      translations: {
        en: { question: question.en.trim() || undefined, answer: answer.en.trim() || undefined },
        ru: { question: question.ru.trim() || undefined, answer: answer.ru.trim() || undefined },
      },
    })
    close()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={close} />
      <div className={`relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden max-h-[90vh] ${closing ? 'animate-modal-panel-out' : 'animate-modal-panel-in'}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold text-white">{isEditing ? 'კითხვის რედაქტირება' : 'ახალი კითხვა'}</h3>
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
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">კითხვა</label>
            <TranslatedField
              value={question}
              onChange={setQuestion}
              placeholders={{ ka: 'კითხვა', en: 'Question', ru: 'Вопрос' }}
              className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">პასუხი</label>
            <TranslatedField
              value={answer}
              onChange={setAnswer}
              multiline
              rows={4}
              placeholders={{ ka: 'პასუხი', en: 'Answer', ru: 'Ответ' }}
              className="textarea w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
            />
          </div>

          {!canSubmit && <p className="text-error text-sm">მიუთითეთ კითხვა მინიმუმ ერთ ენაზე.</p>}
        </form>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn flex-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isEditing ? 'შენახვა' : 'დამატება'}
          </button>
          <button type="button" onClick={close} className="btn bg-white/4 border-white/8 text-white/60 hover:text-white">
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MerchantStoreFaqPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [showFaqSection, setShowFaqSection] = useState(DEFAULT_THEME_CONFIG.showFaqSection)
  const [faqHeading, setFaqHeading] = useState(DEFAULT_THEME_CONFIG.faqHeading)
  const [faqItems, setFaqItems] = useState(DEFAULT_THEME_CONFIG.faqItems)
  const [faqBackgroundColor, setFaqBackgroundColor] = useState('')
  const [textTranslations, setTextTranslations] = useState(DEFAULT_THEME_CONFIG.translations)
  const [saved, setSaved] = useState(false)
  const [modal, setModal] = useState<'create' | number | null>(null)

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setShowFaqSection(parsed.showFaqSection)
    setFaqHeading(parsed.faqHeading)
    setFaqItems(parsed.faqItems)
    setFaqBackgroundColor(parsed.sectionBackgroundColors.faq ?? '')
    setTextTranslations(parsed.translations)
  }

  function removeFaqItem(index: number) {
    setFaqItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleSaveItem(item: FaqItem) {
    if (modal === 'create') {
      setFaqItems(prev => [...prev, item])
    } else if (typeof modal === 'number') {
      setFaqItems(prev => prev.map((existing, i) => (i === modal ? item : existing)))
    }
  }

  function handleSave() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    // Merge with the freshest saved translations rather than overwriting wholesale — this page
    // only edits faqHeading; the rest (owned by other settings pages) must survive even though
    // this save resends the full ThemeConfig object.
    const mergedTranslations = {
      en: { ...parsed.translations.en, faqHeading: textTranslations.en?.faqHeading },
      ru: { ...parsed.translations.ru, faqHeading: textTranslations.ru?.faqHeading },
    }
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          translations: mergedTranslations,
          showFaqSection,
          faqHeading: faqHeading.trim() || undefined,
          faqItems,
          sectionBackgroundColors: { ...parsed.sectionBackgroundColors, faq: faqBackgroundColor || undefined },
        }),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  if (isLoading || !store) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <>
    <div className="flex flex-col gap-8 max-w-2xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">ხშირად დასმული კითხვები</h1>
        <p className="text-white/40 text-sm mt-1">კითხვებისა და პასუხების ჩამოშლადი სია, ჩნდება თქვენს მთავარ გვერდზე.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ხშირად დასმული კითხვების სექცია</h2>
            <p className="text-white/30 text-xs mt-1">გამორთეთ, თუ არ გსურთ ეს სექცია მთავარ გვერდზე ჩანდეს.</p>
          </div>
          <input
            type="checkbox"
            checked={showFaqSection}
            onChange={e => setShowFaqSection(e.target.checked)}
            className={`toggle toggle-sm shrink-0 ${showFaqSection ? 'toggle-success' : 'toggle-error'}`}
          />
        </label>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ფონის ფერი</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={faqBackgroundColor || '#000000'}
              onChange={e => setFaqBackgroundColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={faqBackgroundColor}
              onChange={e => setFaqBackgroundColor(e.target.value)}
              placeholder="თემის ნაგულისხმევი"
              className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
            />
            {faqBackgroundColor && (
              <IconButton icon={<XIcon />} label="ფონის ფერის გასუფთავება" onClick={() => setFaqBackgroundColor('')} />
            )}
          </div>
        </div>

        {showFaqSection && (
          <>
            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სათაური</label>
              <TranslatedField
                value={{ ka: faqHeading, en: textTranslations.en?.faqHeading ?? '', ru: textTranslations.ru?.faqHeading ?? '' }}
                onChange={v => {
                  setFaqHeading(v.ka)
                  setTextTranslations(prev => ({
                    en: { ...prev.en, faqHeading: v.en.trim() || undefined },
                    ru: { ...prev.ru, faqHeading: v.ru.trim() || undefined },
                  }))
                }}
                placeholders={{ ka: 'ხშირად დასმული კითხვები', en: 'Frequently asked questions', ru: 'Часто задаваемые вопросы' }}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  კითხვები {faqItems.length > 0 && <span className="text-white/30 normal-case">({faqItems.length})</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setModal('create')}
                  className="btn btn-xs gap-1 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white"
                >
                  <PlusIcon /> დამატება
                </button>
              </div>

              {faqItems.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {faqItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
                      <p className="text-sm text-white truncate min-w-0 flex-1">{item.question || 'უსათაუროდ'}</p>
                      <div className="flex gap-1.5 shrink-0">
                        <IconButton icon={<EditIcon />} label="რედაქტირება" onClick={() => setModal(index)} />
                        <IconButton icon={<TrashIcon />} label="წაშლა" onClick={() => removeFaqItem(index)} variant="danger" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm">კითხვები ჯერ არ გაქვთ.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>

    {modal !== null && (
      <FaqItemModal
        item={typeof modal === 'number' ? faqItems[modal] : undefined}
        onSave={handleSaveItem}
        onClose={() => setModal(null)}
      />
    )}

    <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 border-t border-white/10 bg-[#0b0b12]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {error && (
          <div className="flex-1 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ცვლილებების შენახვა ვერ მოხერხდა.
          </div>
        )}
        {saved && (
          <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            წარმატებით შეინახა
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 ${error || saved ? '' : 'w-full'}`}
        >
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'შენახვა'}
        </button>
      </div>
    </div>
    </>
  )
}
