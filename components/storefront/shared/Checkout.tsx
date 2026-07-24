'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCheckout } from '@/lib/queries/storefront'
import { getStoreRef } from '@/lib/store/referral'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { getThemeDefinition, RADIUS_CLASS, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { LocationPicker } from './LocationPicker'
import type { PaymentMethod, StorePageResponse, ThemeConfig, ThemeId } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  {
    id: 'CashOnDelivery',
    label: 'გადახდა მიტანისას',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="6" width="19" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M5.5 6v-.5A1.5 1.5 0 0 1 7 4h10a1.5 1.5 0 0 1 1.5 1.5V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'BankTransfer',
    label: 'საბანკო გადარიცხვა',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 9.5 12 4l9 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 9.5v9M9 9.5v9M15 9.5v9M19.5 9.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M2.5 21h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'Flitt',
    label: 'ბარათით გადახდა',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'Tbc',
    label: 'ბარათით გადახდა (TBC)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'Bog',
    label: 'ბარათით გადახდა (საქართველოს ბანკი)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'CityPay',
    label: 'გადახდა კრიპტოვალუტით',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M12 6.5v11M14.7 9c0-1.1-1.2-2-2.7-2s-2.7.9-2.7 2c0 1.1 1.2 1.6 2.7 2s2.7.9 2.7 2c0 1.1-1.2 2-2.7 2s-2.7-.9-2.7-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function Section({
  title,
  children,
  surface,
  radius,
}: {
  title: string
  children: React.ReactNode
  surface: { card: string; border: string; muted: string }
  radius: string
}) {
  return (
    <div className={`${surface.card} border ${surface.border} ${radius} p-5 flex flex-col gap-4`}>
      <h2 className={`text-xs font-bold uppercase tracking-widest ${surface.muted}`}>{title}</h2>
      {children}
    </div>
  )
}

export function Checkout({
  slug,
  themeId,
  tokens,
  pages,
}: {
  slug: string
  themeId: ThemeId
  tokens: Required<ThemeConfig>
  pages: StorePageResponse[]
}) {
  const { cart } = useStorefrontCart()
  const checkout = useCheckout(slug)
  const surface = SURFACE_CLASSES[themeId]
  const radius = RADIUS_CLASS[getThemeDefinition(themeId).radius]

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [orderNote, setOrderNote] = useState('')
  const [tosAccepted, setTosAccepted] = useState(false)

  const tosPage = tokens.checkoutTosEnabled ? pages.find(p => p.id === tokens.checkoutTosPageId) : undefined
  const tosRequired = tokens.checkoutTosEnabled && !!tosPage

  // Flitt/TBC/BOG/CityPay have no buyer-facing notes — all are automatic hosted-checkout
  // redirects, unlike COD/bank transfer which need manual instructions (courier cash, IBAN, etc).
  const paymentNotes: Partial<Record<PaymentMethod, string>> = {
    CashOnDelivery: tokens.codNotes,
    BankTransfer: tokens.bankTransferNotes,
  }
  const paymentEnabled: Record<PaymentMethod, boolean> = {
    CashOnDelivery: tokens.codEnabled,
    BankTransfer: tokens.bankTransferEnabled,
    Flitt: tokens.flittEnabled,
    Tbc: tokens.tbcEnabled,
    Bog: tokens.bogEnabled,
    CityPay: tokens.cityPayEnabled,
  }
  const enabledPaymentOptions = PAYMENT_OPTIONS.filter(opt => paymentEnabled[opt.id])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => enabledPaymentOptions[0]?.id ?? 'CashOnDelivery'
  )

  const hasShippingZones = tokens.shippingZones.length > 0
  const [shippingZoneId, setShippingZoneId] = useState<string | null>(
    () => tokens.shippingZones[0]?.id ?? null
  )
  const selectedZone = tokens.shippingZones.find(z => z.id === shippingZoneId)
  const cartTotal = cart?.total ?? 0
  const qualifiesForFreeShipping =
    tokens.freeShippingThreshold != null && cartTotal >= tokens.freeShippingThreshold
  const shippingFee = hasShippingZones && !qualifiesForFreeShipping ? selectedZone?.price ?? 0 : 0
  const orderTotal = cartTotal + shippingFee

  const fullName = `${firstName} ${lastName}`.trim()

  const inputClass = `w-full border ${surface.border} ${surface.inputBg} ${surface.text} ${radius} px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none transition-colors`
  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${surface.muted}`

  const redirectUrl = checkout.isSuccess ? checkout.data.redirectUrl : null

  // Flitt orders aren't placed yet — the customer still has to pay on Flitt's hosted page,
  // so this navigates away instead of showing the normal "order complete" screen below.
  useEffect(() => {
    if (redirectUrl) window.location.href = redirectUrl
  }, [redirectUrl])

  if (redirectUrl) {
    return (
      <div className={`${surface.page} min-h-screen flex items-center justify-center`}>
        <p className={`text-sm ${surface.muted}`}>გადამისამართება უსაფრთხო გადახდის გვერდზე...</p>
      </div>
    )
  }

  if (checkout.isSuccess) {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
          <div className={`w-16 h-16 border-2 border-emerald-500 flex items-center justify-center ${radius}`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M4 14l7 7 13-13" stroke="#2d6a2d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className={`font-black text-3xl mb-2 ${surface.text}`}>{tokens.checkoutThankYouHeading || 'შეკვეთა გაფორმდა!'}</h1>
            <p className={`text-sm break-words ${surface.muted}`}>
              {tokens.checkoutThankYouMessage || `გმადლობთ, ${fullName}. თქვენი შეკვეთა #${checkout.data.id.slice(0, 8)} მიღებულია. დეტალები გამოგზავნილია ${email}-ზე.`}
            </p>
            <p className={`text-sm font-bold mt-3 ${surface.text}`}>
              სულ: ₾{checkout.data.total.toFixed(2)}
              {checkout.data.shippingZoneName && (
                <span className={`font-normal ${surface.muted}`}>
                  {' '}(მათ შორის მიწოდება{checkout.data.shippingFee > 0 ? ` — ₾${checkout.data.shippingFee.toFixed(2)}` : ' — უფასო'}, {checkout.data.shippingZoneName})
                </span>
              )}
            </p>
          </div>
          {paymentNotes[checkout.data.paymentMethod] && (
            <div className={`w-full text-left border ${surface.border} ${surface.card} ${radius} p-5`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${surface.muted}`}>
                {PAYMENT_OPTIONS.find(opt => opt.id === checkout.data.paymentMethod)?.label}
              </p>
              <p className={`text-sm whitespace-pre-line break-words ${surface.text}`}>{paymentNotes[checkout.data.paymentMethod]}</p>
            </div>
          )}
          <Link
            href={`/`}
            className={`text-white text-sm font-semibold px-8 py-3.5 ${radius}`}
            style={{ backgroundColor: tokens.accentColor }}
          >
            შოპინგის გაგრძელება
          </Link>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className={`font-black text-2xl mb-4 ${surface.text}`}>გადასახდელი ნივთები არ არის</h1>
          <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.text}`}>
            პროდუქტების ნახვა →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <Link
          href={`/cart`}
          className={`flex items-center gap-1.5 text-sm transition-colors mb-6 ${surface.muted} hover:opacity-80`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          კალათაში დაბრუნება
        </Link>
        <h1 className={`font-black text-3xl tracking-tight mb-10 ${surface.text}`}>გადახდა</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <form
            className="lg:col-span-3 flex flex-col gap-5"
            onSubmit={e => {
              e.preventDefault()
              checkout.mutate({
                customerName: fullName,
                email,
                phone,
                address,
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
                paymentMethod,
                shippingZoneId: hasShippingZones ? shippingZoneId : null,
                ref: getStoreRef(slug),
                customerNote: tokens.checkoutNotesEnabled ? orderNote.trim() || null : null,
              })
            }}
          >
            <Section title="პირადი ინფორმაცია" surface={surface} radius={radius}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>სახელი <span className="text-red-400">*</span></label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="გიორგი" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>გვარი <span className="text-red-400">*</span></label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="გიორგაძე" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ელფოსტა <span className="text-red-400">*</span></label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="giorgi@example.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ტელეფონი <span className="text-red-400">*</span></label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+995 555 123 456" className={inputClass} />
                </div>
              </div>
            </Section>

            <Section title="მიწოდების მისამართი" surface={surface} radius={radius}>
              <div>
                <label className={labelClass}>მისამართი <span className="text-red-400">*</span></label>
                <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="ქუჩა, ქალაქი" className={inputClass} />
              </div>
              <LocationPicker
                surface={surface}
                radius={radius}
                onLocationChange={loc => {
                  setAddress(loc.address)
                  setCoords({ lat: loc.lat, lng: loc.lng })
                }}
              />
            </Section>

            {hasShippingZones && (
              <Section title="მიწოდების არეალი" surface={surface} radius={radius}>
                <div className="flex flex-col gap-2">
                  {tokens.shippingZones.map(zone => {
                    const isSelected = shippingZoneId === zone.id
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setShippingZoneId(zone.id)}
                        className={`flex items-center gap-4 p-4 border-2 transition-colors text-left ${radius} ${surface.card}`}
                        style={{ borderColor: isSelected ? tokens.accentColor : undefined }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: isSelected ? tokens.accentColor : 'currentColor' }}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.accentColor }} />}
                        </div>
                        <p className={`font-semibold text-sm flex-1 min-w-0 break-words ${surface.text}`}>{zone.name}</p>
                        <span className={`text-sm font-bold shrink-0 ${surface.text}`}>
                          {qualifiesForFreeShipping ? 'უფასო' : `₾${zone.price.toFixed(2)}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {!qualifiesForFreeShipping && tokens.freeShippingThreshold != null && (
                  <p className={`text-xs ${surface.muted}`}>
                    დაამატეთ კიდევ ₾{(tokens.freeShippingThreshold - cartTotal).toFixed(2)} და მიწოდება იქნება უფასო.
                  </p>
                )}
              </Section>
            )}

            <Section title="გადახდის მეთოდი" surface={surface} radius={radius}>
              <div className="flex flex-col gap-3">
                {enabledPaymentOptions.map(opt => {
                  const isSelected = paymentMethod === opt.id
                  return (
                    <div key={opt.id} className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`flex items-center gap-4 p-4 border-2 transition-colors text-left ${radius} ${surface.card}`}
                        style={{ borderColor: isSelected ? tokens.accentColor : undefined }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: isSelected ? tokens.accentColor : 'currentColor' }}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.accentColor }} />}
                        </div>
                        <span className={surface.text} style={{ color: isSelected ? tokens.accentColor : undefined }}>
                          {opt.icon}
                        </span>
                        <p className={`font-semibold text-sm ${surface.text}`}>{opt.label}</p>
                      </button>
                      {isSelected && paymentNotes[opt.id] && (
                        <p className={`px-4 text-xs whitespace-pre-line break-words ${surface.muted}`}>{paymentNotes[opt.id]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>

            {tokens.checkoutNotesEnabled && (
              <Section title="შენიშვნა შეკვეთაზე" surface={surface} radius={radius}>
                <textarea
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  rows={3}
                  placeholder="მაგ. კარიბჭის კოდი, მიწოდების მოსახერხებელი დრო..."
                  className={`${inputClass} resize-none`}
                />
              </Section>
            )}

            {tosRequired && tosPage && (
              <label className={`flex items-start gap-3 text-sm cursor-pointer ${surface.text}`}>
                <input
                  type="checkbox"
                  required
                  checked={tosAccepted}
                  onChange={e => setTosAccepted(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  ვეთანხმები{' '}
                  <Link href={`/pages/${tosPage.slug}`} target="_blank" className="underline underline-offset-2">
                    {tosPage.title}
                  </Link>
                </span>
              </label>
            )}

            {checkout.isError && <p className="text-red-400 text-sm">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>}

            <button
              type="submit"
              disabled={checkout.isPending || (tosRequired && !tosAccepted)}
              className={`py-4 text-white text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 disabled:opacity-40 ${radius}`}
              style={{ backgroundColor: tokens.accentColor }}
            >
              {checkout.isPending ? 'შეკვეთის გაფორმება...' : 'შეკვეთის გაფორმება'}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className={`${surface.card} border ${surface.border} ${radius} p-5 lg:sticky lg:top-20`}>
              <h3 className={`font-bold text-sm mb-4 pb-4 border-b ${surface.border} ${surface.text}`}>შეკვეთის შეჯამება</h3>
              <div className={`flex flex-col divide-y ${surface.border} mb-4`}>
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className={`w-11 h-11 shrink-0 overflow-hidden ${radius} ${surface.border} border`}>
                      {item.imageUrl ? (
                        <CImg src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-[8px] ${surface.muted}`}>—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${surface.text}`}>{item.productName}</p>
                      {item.options.length > 0 && (
                        <p className={`text-[10px] truncate ${surface.muted}`}>
                          {item.options.map(o => o.value).join(' / ')}
                        </p>
                      )}
                      <p className={`text-[10px] ${surface.muted}`}>×{item.quantity}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${surface.text}`}>₾{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className={`flex flex-col gap-1.5 border-t ${surface.border} pt-4 mb-1`}>
                <div className={`flex justify-between text-sm ${surface.muted}`}>
                  <span>ჯამი</span>
                  <span>₾{cart.total.toFixed(2)}</span>
                </div>
                {hasShippingZones && (
                  <div className={`flex justify-between text-sm ${surface.muted}`}>
                    <span>მიწოდება{selectedZone ? ` (${selectedZone.name})` : ''}</span>
                    <span>{shippingFee === 0 ? 'უფასო' : `₾${shippingFee.toFixed(2)}`}</span>
                  </div>
                )}
              </div>
              <div className={`border-t ${surface.border} pt-4 flex justify-between font-black text-base ${surface.text}`}>
                <span>სულ</span>
                <span>₾{orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
