'use client'

import { useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, parseThemeConfig } from '@/lib/store/theme-config'
import { LocationPicker } from '@/components/storefront/shared/LocationPicker'
import { TranslatedField } from '@/components/dashboard/store/TranslatedField'
import { ka as storefrontT } from '@/strings/storefront-ka'

const DASHBOARD_SURFACE = { border: 'border-white/10', text: 'text-white', muted: 'text-white/40' }

export default function MerchantStoreContactPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [contactLabel, setContactLabel] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactLatitude, setContactLatitude] = useState<number | null>(null)
  const [contactLongitude, setContactLongitude] = useState<number | null>(null)
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialFacebook, setSocialFacebook] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [textTranslations, setTextTranslations] = useState(DEFAULT_THEME_CONFIG.translations)
  const [saved, setSaved] = useState(false)

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
    setContactLabel(parsed.contactLabel)
    setContactEmail(parsed.contactEmail)
    setContactPhone(parsed.contactPhone)
    setContactAddress(parsed.contactAddress)
    setContactLatitude(parsed.contactLatitude)
    setContactLongitude(parsed.contactLongitude)
    setSocialInstagram(parsed.socialInstagram)
    setSocialFacebook(parsed.socialFacebook)
    setSocialTiktok(parsed.socialTiktok)
    setSocialYoutube(parsed.socialYoutube)
    setTextTranslations(parsed.translations)
  }

  function handleSave() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    const mergedTranslations = {
      en: { ...parsed.translations.en, contactLabel: textTranslations.en?.contactLabel },
      ru: { ...parsed.translations.ru, contactLabel: textTranslations.ru?.contactLabel },
    }
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          translations: mergedTranslations,
          contactLabel: contactLabel.trim() || undefined,
          contactEmail,
          contactPhone,
          contactAddress,
          contactLatitude,
          contactLongitude,
          socialInstagram,
          socialFacebook,
          socialTiktok,
          socialYoutube,
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

  const savedPosition = parseThemeConfig(store.themeConfig)
  const initialPosition = savedPosition.contactLatitude !== null && savedPosition.contactLongitude !== null
    ? { lat: savedPosition.contactLatitude, lng: savedPosition.contactLongitude }
    : null

  return (
    <>
    <div className="flex flex-col gap-8 max-w-2xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">კონტაქტი და სოც. ქსელები</h1>
        <p className="text-white/40 text-sm mt-1">ნაჩვენებია თქვენი მაღაზიის კონტაქტის გვერდზე და ქვედა კოლონტიტულში.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">კონტაქტის ბმულის ეტიკეტი</h2>
          <p className="text-white/30 text-xs mt-1">როგორ ეწოდება კონტაქტის ბმულს თქვენს მენიუში და გვერდის სათაურში, მაგ. კონტაქტი, დაგვიკავშირდით, მოგვწერეთ.</p>
        </div>
        <TranslatedField
          value={{ ka: contactLabel, en: textTranslations.en?.contactLabel ?? '', ru: textTranslations.ru?.contactLabel ?? '' }}
          onChange={v => {
            setContactLabel(v.ka)
            setTextTranslations(prev => ({
              en: { ...prev.en, contactLabel: v.en.trim() || undefined },
              ru: { ...prev.ru, contactLabel: v.ru.trim() || undefined },
            }))
          }}
          placeholders={{ ka: 'კონტაქტი', en: 'Contact', ru: 'Контакты' }}
          className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">საკონტაქტო ინფორმაცია</h2>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ელფოსტა</label>
          <input
            type="email"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            placeholder="hello@yourstore.com"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტელეფონი</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="+995 555 123 456"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მისამართი</label>
          <input
            type="text"
            value={contactAddress}
            onChange={e => setContactAddress(e.target.value)}
            placeholder="ქუჩა, ქალაქი"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მდებარეობა რუკაზე</label>
          <p className="text-white/30 text-xs -mt-1">ნაჩვენებია რუკის სახით თქვენი მაღაზიის კონტაქტის გვერდზე.</p>
          <LocationPicker
            surface={DASHBOARD_SURFACE}
            radius="rounded-xl"
            t={storefrontT}
            initialPosition={initialPosition}
            onLocationChange={loc => {
              setContactLatitude(loc.lat)
              setContactLongitude(loc.lng)
              setContactAddress(prev => prev || loc.address)
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">სოციალური ქსელები</h2>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Instagram</label>
          <input
            type="url"
            value={socialInstagram}
            onChange={e => setSocialInstagram(e.target.value)}
            placeholder="https://instagram.com/yourstore"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Facebook</label>
          <input
            type="url"
            value={socialFacebook}
            onChange={e => setSocialFacebook(e.target.value)}
            placeholder="https://facebook.com/yourstore"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">TikTok</label>
          <input
            type="url"
            value={socialTiktok}
            onChange={e => setSocialTiktok(e.target.value)}
            placeholder="https://tiktok.com/@yourstore"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        <div className="fieldset gap-2">
          <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">YouTube</label>
          <input
            type="url"
            value={socialYoutube}
            onChange={e => setSocialYoutube(e.target.value)}
            placeholder="https://youtube.com/@yourstore"
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>
      </div>
    </div>

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
