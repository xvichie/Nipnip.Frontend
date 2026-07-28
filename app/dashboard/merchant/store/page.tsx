'use client'

import { useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, parseThemeConfig } from '@/lib/store/theme-config'
import { getStoreDescription, getStoreTitle } from '@/lib/store/seo'
import { TranslatedField, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import type { OfflineMode } from '@/lib/types/storefront'

const LANGUAGE_OPTIONS: { value: StorefrontLanguage; flag: string; label: string }[] = [
  { value: 'ka', flag: '🇬🇪', label: 'ქართული' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'ru', flag: '🇷🇺', label: 'Русский' },
]

export default function MerchantStorePage() {
  const { data: store, isLoading, isError } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [defaultLanguage, setDefaultLanguage] = useState<StorefrontLanguage>(DEFAULT_THEME_CONFIG.defaultLanguage)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [seoTagline, setSeoTagline] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [offlineMode, setOfflineMode] = useState<OfflineMode>(DEFAULT_THEME_CONFIG.offlineMode)
  const [offlineMessage, setOfflineMessage] = useState(DEFAULT_THEME_CONFIG.offlineMessage)
  const [offlineReopenDate, setOfflineReopenDate] = useState(DEFAULT_THEME_CONFIG.offlineReopenDate)
  const [textTranslations, setTextTranslations] = useState(DEFAULT_THEME_CONFIG.translations)
  const [saved, setSaved] = useState(false)

  // Binds one top-level scalar ThemeConfig text field (e.g. seoTagline) to a TranslatedField —
  // "ka" reads/writes the existing base-language state, "en"/"ru" read/write the translations
  // sidecar keyed by the same field name.
  function themeTextBinding(
    field: 'seoTagline' | 'seoDescription' | 'offlineMessage',
    baseValue: string,
    setBaseValue: (v: string) => void
  ): { value: TranslatedFieldValue; onChange: (v: TranslatedFieldValue) => void } {
    return {
      value: { ka: baseValue, en: textTranslations.en?.[field] ?? '', ru: textTranslations.ru?.[field] ?? '' },
      onChange: v => {
        setBaseValue(v.ka)
        setTextTranslations(prev => ({
          en: { ...prev.en, [field]: v.en.trim() || undefined },
          ru: { ...prev.ru, [field]: v.ru.trim() || undefined },
        }))
      },
    }
  }

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    setName(store.name)
    setIsActive(store.isActive)
    const parsed = parseThemeConfig(store.themeConfig)
    setDefaultLanguage(parsed.defaultLanguage)
    setContactEmail(parsed.contactEmail)
    setContactPhone(parsed.contactPhone)
    setContactAddress(parsed.contactAddress)
    setSeoTagline(parsed.seoTagline)
    setSeoDescription(parsed.seoDescription)
    setOfflineMode(parsed.offlineMode)
    setOfflineMessage(parsed.offlineMessage)
    setOfflineReopenDate(parsed.offlineReopenDate)
    setTextTranslations(parsed.translations)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    // Merge with the freshest saved translations rather than overwriting wholesale — this page
    // only edits a subset of the translatable fields; the rest (hero, content block, etc.,
    // owned by other settings pages) must survive even though this save resends the full
    // ThemeConfig object.
    const mergedTranslations = {
      en: { ...parsed.translations.en, ...textTranslations.en },
      ru: { ...parsed.translations.ru, ...textTranslations.ru },
    }
    updateStore(
      {
        name: name.trim() || null,
        isActive,
        themeConfig: JSON.stringify({
          ...parsed,
          translations: mergedTranslations,
          defaultLanguage,
          contactEmail,
          contactPhone,
          contactAddress,
          seoTagline: seoTagline.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          offlineMode,
          offlineMessage: offlineMessage.trim() || undefined,
          offlineReopenDate: offlineReopenDate || null,
        }),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    )
  }

  if (isError || !store) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="rounded-2xl border border-white/7 bg-white/2 p-8 text-center">
          <p className="text-white/50 text-sm">თქვენი მაღაზია ჯერ არ არის შექმნილი.</p>
          <p className="text-white/25 text-xs mt-1">დაუკავშირდით NipNip-ს თქვენი მაღაზიის შესაქმნელად.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="fieldset gap-2">
            <label htmlFor="store-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              მაღაზიის სახელი
            </label>
            <input
              id="store-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              required
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className={`toggle toggle-sm ${isActive ? 'toggle-success' : 'toggle-error'}`}
            />
            <span className="text-sm text-white/70">მაღაზია აქტიურია</span>
          </label>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
              საწყისი ენა
            </label>
            <p className="text-white/30 text-xs -mt-1 mb-1">
              ამ ენას ხედავს ვიზიტორი, რომელსაც ჯერ არ აურჩევია ენა თქვენი მაღაზიისთვის.
            </p>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 p-1 w-fit">
              {LANGUAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDefaultLanguage(opt.value)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                    defaultLanguage === opt.value
                      ? 'bg-fuchsia-500/15 text-fuchsia-300'
                      : 'text-white/60 hover:text-white hover:bg-white/6',
                  ].join(' ')}
                >
                  <span className="text-sm leading-none">{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {!isActive && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-4 flex flex-col gap-4">
              <p className="text-white/40 text-xs">
                სანამ მაღაზია გამორთულია, ვიზიტორები ნახავენ ამ შეტყობინებას ცარიელი გვერდის ნაცვლად.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'closed', label: 'დროებით დაკეტილია' },
                  { value: 'comingSoon', label: 'მალე გაიხსნება' },
                ] as { value: OfflineMode; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOfflineMode(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      offlineMode === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="offline-message" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  შეტყობინება
                </label>
                <TranslatedField
                  {...themeTextBinding('offlineMessage', offlineMessage, setOfflineMessage)}
                  multiline
                  rows={2}
                  placeholders={{
                    ka: 'მალე დავბრუნდებით — მადლობთ მოთმინებისთვის!',
                    en: "We'll be back soon — thanks for your patience!",
                    ru: 'Скоро вернёмся — спасибо за терпение!',
                  }}
                  className="textarea w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
                />
              </div>

              <div className="fieldset gap-2">
                <label htmlFor="offline-reopen-date" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  გახსნის თარიღი (არასავალდებულო)
                </label>
                <input
                  id="offline-reopen-date"
                  type="date"
                  value={offlineReopenDate ?? ''}
                  onChange={e => setOfflineReopenDate(e.target.value || null)}
                  className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/7 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">საკონტაქტო ინფორმაცია</h2>
              <p className="text-white/30 text-xs mt-1">გამოჩნდება თქვენი მაღაზიის საკონტაქტო გვერდსა და ქვედა კოლონტიტულში.</p>
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="contact-email" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                ელფოსტა
              </label>
              <input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="hello@yourstore.com"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="contact-phone" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                ტელეფონი
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+995 555 123 456"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="contact-address" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                მისამართი
              </label>
              <input
                id="contact-address"
                type="text"
                value={contactAddress}
                onChange={e => setContactAddress(e.target.value)}
                placeholder="ქუჩა, ქალაქი"
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/7 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">SEO</h2>
              <p className="text-white/30 text-xs mt-1">როგორ გამოჩნდება თქვენი მაღაზია Google-ში და სოციალურ ქსელებში გაზიარებისას.</p>
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="seo-tagline" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                სლოგანი
              </label>
              <TranslatedField
                {...themeTextBinding('seoTagline', seoTagline, setSeoTagline)}
                placeholders={{ ka: 'იყიდე პადელის ინვენტარი საუკეთესო ფასად', en: 'Best padel gear at the best price', ru: 'Лучший инвентарь для падела по лучшей цене' }}
                className="input w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              />
              <p className="text-white/30 text-xs">
                დაემატება მაღაზიის სახელს ბრაუზერის ჩანართსა და საძიებო შედეგებში: &quot;{name || store.name} — {seoTagline || 'თქვენი სლოგანი'}&quot;. ცარიელი დატოვეთ, თუ მხოლოდ სახელი გინდათ.
              </p>
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="seo-description" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                აღწერა საძიებო სისტემებისთვის
              </label>
              <TranslatedField
                {...themeTextBinding('seoDescription', seoDescription, setSeoDescription)}
                multiline
                rows={3}
                placeholders={{
                  ka: 'მოკლედ აღწერეთ რას ყიდით — ეს ტექსტი გამოჩნდება Google-ის ძიების შედეგებში.',
                  en: 'Briefly describe what you sell — this shows up in Google search results.',
                  ru: 'Кратко опишите, что вы продаёте — этот текст появится в результатах поиска Google.',
                }}
                className="textarea w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
              <p className="text-white/30 text-xs flex items-center justify-between">
                <span>ცარიელი დატოვების შემთხვევაში გამოყენებული იქნება თქვენი hero სათაური/ქვესათაური.</span>
                <span className={seoDescription.length > 160 ? 'text-red-400' : ''}>{seoDescription.length}/160</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#0b0b10] px-4 py-3">
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">გადახედვა საძიებო სისტემაში</p>
              <p className="text-[#8ab4f8] text-base leading-snug truncate">
                {getStoreTitle({ ...store, name: name || store.name }, { ...parseThemeConfig(store.themeConfig), seoTagline }, 'ka')}
              </p>
              <p className="text-[#4d9c6f] text-xs mt-0.5">{store.slug}.nipnip.ge</p>
              <p className="text-white/50 text-xs mt-1 leading-snug line-clamp-2">
                {getStoreDescription({ ...store, name: name || store.name }, { ...parseThemeConfig(store.themeConfig), seoDescription }, 'ka')}
              </p>
            </div>
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
            disabled={isPending || !name.trim()}
            className="btn w-full mt-1 gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'შენახვა'}
          </button>
        </form>
      </div>

    </div>
  )
}
