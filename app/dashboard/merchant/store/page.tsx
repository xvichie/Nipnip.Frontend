'use client'

import { useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { getStoreDescription, getStoreTitle } from '@/lib/store/seo'

export default function MerchantStorePage() {
  const { data: store, isLoading, isError } = useMyStore()
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [seoTagline, setSeoTagline] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once from the
  // fetched store, which arrives async, so there's no lazy-initializer moment to hook into.
  const [prevStore, setPrevStore] = useState(store)
  if (store && store !== prevStore) {
    setPrevStore(store)
    setName(store.name)
    setIsActive(store.isActive)
    const parsed = parseThemeConfig(store.themeConfig)
    setContactEmail(parsed.contactEmail)
    setContactPhone(parsed.contactPhone)
    setContactAddress(parsed.contactAddress)
    setSeoTagline(parsed.seoTagline)
    setSeoDescription(parsed.seoDescription)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore(
      {
        name: name.trim() || null,
        isActive,
        themeConfig: JSON.stringify({
          ...parsed,
          contactEmail,
          contactPhone,
          contactAddress,
          seoTagline: seoTagline.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
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
              <input
                id="seo-tagline"
                type="text"
                value={seoTagline}
                onChange={e => setSeoTagline(e.target.value)}
                placeholder="იყიდე პადელის ინვენტარი საუკეთესო ფასად"
                maxLength={70}
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
              <textarea
                id="seo-description"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="მოკლედ აღწერეთ რას ყიდით — ეს ტექსტი გამოჩნდება Google-ის ძიების შედეგებში."
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
                {getStoreTitle({ ...store, name: name || store.name }, { ...parseThemeConfig(store.themeConfig), seoTagline })}
              </p>
              <p className="text-[#4d9c6f] text-xs mt-0.5">{store.slug}.nipnip.ge</p>
              <p className="text-white/50 text-xs mt-1 leading-snug line-clamp-2">
                {getStoreDescription({ ...store, name: name || store.name }, { ...parseThemeConfig(store.themeConfig), seoDescription })}
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
