'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCheckout, useValidateDiscountCode } from '@/lib/queries/storefront'
import { getStoreRef } from '@/lib/store/referral'
import { trackPurchase } from '@/lib/store/tracking-pixels'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { SURFACE_CLASSES } from '@/lib/storefront-themes'
import { getButtonHoverColor, getRadiusClass } from '@/lib/store/theme-config'
import { getPageTitle, getThemeText, resolveThemeText } from '@/lib/store/translations'
import { LocationPicker } from './LocationPicker'
import type { PaymentMethod, StorePageResponse, ThemeConfig, ThemeId } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

function getPaymentOptions(t: StorefrontStrings): { id: PaymentMethod; label: string; icon: React.ReactNode }[] {
  return [
    {
      id: 'CashOnDelivery',
      label: t.checkout.paymentMethods.cashOnDelivery,
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
      label: t.checkout.paymentMethods.bankTransfer,
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
      label: t.checkout.paymentMethods.flitt,
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
      label: t.checkout.paymentMethods.tbc,
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
      label: t.checkout.paymentMethods.bog,
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
      label: t.checkout.paymentMethods.cityPay,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M12 6.5v11M14.7 9c0-1.1-1.2-2-2.7-2s-2.7.9-2.7 2c0 1.1 1.2 1.6 2.7 2s2.7.9 2.7 2c0 1.1-1.2 2-2.7 2s-2.7-.9-2.7-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]
}

function getDiscountErrorMessages(t: StorefrontStrings): Record<string, string> {
  return {
    not_found: t.checkout.discountErrors.notFound,
    inactive: t.checkout.discountErrors.inactive,
    expired: t.checkout.discountErrors.expired,
    max_uses: t.checkout.discountErrors.maxUses,
  }
}

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
  t,
  lang,
}: {
  slug: string
  themeId: ThemeId
  tokens: Required<ThemeConfig>
  pages: StorePageResponse[]
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const { cart } = useStorefrontCart()
  const checkout = useCheckout(slug)
  const validateDiscount = useValidateDiscountCode(slug)
  const surface = SURFACE_CLASSES[themeId]
  const radius = getRadiusClass(themeId, tokens)
  const paymentOptions = getPaymentOptions(t)
  const discountErrorMessages = getDiscountErrorMessages(t)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [orderNote, setOrderNote] = useState('')
  const [tosAccepted, setTosAccepted] = useState(false)
  const [discountCodeInput, setDiscountCodeInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)

  const tosPage = tokens.checkoutTosEnabled ? pages.find(p => p.id === tokens.checkoutTosPageId) : undefined
  const tosRequired = tokens.checkoutTosEnabled && !!tosPage

  // Flitt/TBC/BOG/CityPay have no buyer-facing notes — all are automatic hosted-checkout
  // redirects, unlike COD/bank transfer which need manual instructions (courier cash, IBAN, etc).
  const paymentNotes: Partial<Record<PaymentMethod, string>> = {
    CashOnDelivery: getThemeText(tokens, 'codNotes', lang),
    BankTransfer: getThemeText(tokens, 'bankTransferNotes', lang),
  }
  const paymentEnabled: Record<PaymentMethod, boolean> = {
    CashOnDelivery: tokens.codEnabled,
    BankTransfer: tokens.bankTransferEnabled,
    Flitt: tokens.flittEnabled,
    Tbc: tokens.tbcEnabled,
    Bog: tokens.bogEnabled,
    CityPay: tokens.cityPayEnabled,
  }
  const enabledPaymentOptions = paymentOptions.filter(opt => paymentEnabled[opt.id])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => enabledPaymentOptions[0]?.id ?? 'CashOnDelivery'
  )

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const isPickup = tokens.pickupEnabled && deliveryMethod === 'pickup'

  const hasShippingZones = tokens.shippingZones.length > 0
  const [shippingZoneId, setShippingZoneId] = useState<string | null>(
    () => tokens.shippingZones[0]?.id ?? null
  )
  const selectedZone = tokens.shippingZones.find(z => z.id === shippingZoneId)
  const cartTotal = cart?.total ?? 0
  const qualifiesForFreeShipping =
    tokens.freeShippingThreshold != null && cartTotal >= tokens.freeShippingThreshold
  const shippingFee = hasShippingZones && !qualifiesForFreeShipping && !isPickup ? selectedZone?.price ?? 0 : 0
  const discountAmount = appliedDiscount?.amount ?? 0
  const orderTotal = Math.max(0, cartTotal + shippingFee - discountAmount)
  const meetsMinOrder = tokens.minOrderAmount == null || cartTotal >= tokens.minOrderAmount

  const fullName = `${firstName} ${lastName}`.trim()

  function handleApplyDiscountCode() {
    const trimmed = discountCodeInput.trim()
    if (!trimmed) return
    validateDiscount.mutate(
      { code: trimmed, subtotal: cartTotal },
      {
        onSuccess: result => {
          if (result.valid) {
            setAppliedDiscount({ code: trimmed.toUpperCase(), amount: result.discountAmount })
            setDiscountError(null)
          } else {
            setAppliedDiscount(null)
            setDiscountError(
              result.errorCode === 'min_order' && result.minOrderAmount != null
                ? t.checkout.minOrderDiscountError(result.minOrderAmount.toFixed(2))
                : discountErrorMessages[result.errorCode ?? 'not_found']
            )
          }
        },
      }
    )
  }

  function handleRemoveDiscountCode() {
    setAppliedDiscount(null)
    setDiscountError(null)
    setDiscountCodeInput('')
  }

  const inputClass = `w-full border ${surface.border} ${surface.inputBg} ${surface.text} ${radius} px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none transition-colors`
  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${surface.muted}`

  const redirectUrl = checkout.isSuccess ? checkout.data.redirectUrl : null

  // Flitt orders aren't placed yet — the customer still has to pay on Flitt's hosted page,
  // so this navigates away instead of showing the normal "order complete" screen below.
  useEffect(() => {
    if (redirectUrl) window.location.href = redirectUrl
  }, [redirectUrl])

  // Only fires for orders actually placed (COD/bank transfer) — a hosted-checkout redirect
  // isn't a confirmed sale yet, so it must not count as a "Purchase" conversion here.
  useEffect(() => {
    if (checkout.isSuccess && !checkout.data.redirectUrl) {
      trackPurchase(tokens, checkout.data.id, checkout.data.total)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout.isSuccess])

  if (redirectUrl) {
    return (
      <div className={`${surface.page} min-h-screen flex items-center justify-center`}>
        <p className={`text-sm ${surface.muted}`}>{t.checkout.redirecting}</p>
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
            <h1 className={`font-black text-3xl mb-2 ${surface.text}`}>{getThemeText(tokens, 'checkoutThankYouHeading', lang) || t.checkout.thankYouHeading}</h1>
            <p className={`text-sm break-words ${surface.muted}`}>
              {getThemeText(tokens, 'checkoutThankYouMessage', lang) || t.checkout.thankYouMessage(fullName, checkout.data.id.slice(0, 8), email)}
            </p>
            <p className={`text-sm font-bold mt-3 ${surface.text}`}>
              {t.checkout.orderTotal(checkout.data.total.toFixed(2))}
              {checkout.data.shippingZoneName && (
                <span className={`font-normal ${surface.muted}`}>
                  {' '}({checkout.data.shippingFee > 0 ? t.checkout.shippingIncluded(checkout.data.shippingFee.toFixed(2)) : t.checkout.shippingIncludedFree}, {checkout.data.shippingZoneName})
                </span>
              )}
              {checkout.data.discountAmount > 0 && (
                <span className="font-normal text-emerald-500">
                  {' '}{t.checkout.discountApplied(checkout.data.discountCode ?? '', checkout.data.discountAmount.toFixed(2))}
                </span>
              )}
            </p>
          </div>
          {checkout.data.isPickup && (
            <div className={`w-full text-left border ${surface.border} ${surface.card} ${radius} p-5`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${surface.muted}`}>{t.checkout.pickupAddressLabel}</p>
              <p className={`text-sm ${surface.text}`}>{tokens.pickupAddress}</p>
              {getThemeText(tokens, 'pickupInstructions', lang) && (
                <p className={`text-xs whitespace-pre-line mt-1 ${surface.muted}`}>{getThemeText(tokens, 'pickupInstructions', lang)}</p>
              )}
            </div>
          )}
          {paymentNotes[checkout.data.paymentMethod] && (
            <div className={`w-full text-left border ${surface.border} ${surface.card} ${radius} p-5`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${surface.muted}`}>
                {paymentOptions.find(opt => opt.id === checkout.data.paymentMethod)?.label}
              </p>
              <p className={`text-sm whitespace-pre-line break-words ${surface.text}`}>{paymentNotes[checkout.data.paymentMethod]}</p>
            </div>
          )}
          <Link
            href={`/products`}
            className={`text-white text-sm font-semibold px-8 py-3.5 ${radius}`}
            style={{ backgroundColor: tokens.accentColor }}
          >
            {t.checkout.continueShopping}
          </Link>
        </div>
      </div>
    )
  }

  if (!cart || (cart.items.length === 0 && cart.bundleItems.length === 0)) {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className={`font-black text-2xl mb-4 ${surface.text}`}>{t.checkout.emptyHeading}</h1>
          <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.text}`}>
            {t.checkout.viewProducts}
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
          {t.checkout.backToCart}
        </Link>
        <h1 className={`font-black text-3xl tracking-tight mb-10 ${surface.text}`}>{t.checkout.pageHeading}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <form
            className="lg:col-span-3 flex flex-col gap-5"
            onSubmit={e => {
              e.preventDefault()
              checkout.mutate({
                customerName: fullName,
                email,
                phone,
                address: isPickup ? tokens.pickupAddress : address,
                latitude: isPickup ? null : coords?.lat ?? null,
                longitude: isPickup ? null : coords?.lng ?? null,
                paymentMethod,
                shippingZoneId: hasShippingZones && !isPickup ? shippingZoneId : null,
                ref: getStoreRef(slug),
                customerNote: tokens.checkoutNotesEnabled ? orderNote.trim() || null : null,
                discountCode: appliedDiscount?.code ?? null,
                isPickup,
                lang,
              })
            }}
          >
            <Section title={t.checkout.personalInfo} surface={surface} radius={radius}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.checkout.firstName} <span className="text-red-400">*</span></label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t.checkout.firstNamePlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.checkout.lastName} <span className="text-red-400">*</span></label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t.checkout.lastNamePlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.checkout.email} <span className="text-red-400">*</span></label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.checkout.emailPlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.checkout.phone} <span className="text-red-400">*</span></label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.checkout.phonePlaceholder} className={inputClass} />
                </div>
              </div>
            </Section>

            {tokens.pickupEnabled && (
              <Section title={t.checkout.deliveryMethod} surface={surface} radius={radius}>
                <div className="grid grid-cols-2 gap-3">
                  {(['delivery', 'pickup'] as const).map(method => {
                    const isSelected = deliveryMethod === method
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDeliveryMethod(method)}
                        className={`flex items-center justify-center gap-2 p-4 border-2 transition-colors text-sm font-semibold ${radius} ${surface.card}`}
                        style={{ borderColor: isSelected ? tokens.accentColor : undefined, color: isSelected ? tokens.accentColor : undefined }}
                      >
                        {method === 'delivery' ? t.checkout.delivery : t.checkout.pickup}
                      </button>
                    )
                  })}
                </div>
              </Section>
            )}

            {isPickup ? (
              <Section title={t.checkout.pickupAddressSection} surface={surface} radius={radius}>
                <p className={`text-sm font-medium ${surface.text}`}>{tokens.pickupAddress}</p>
                {getThemeText(tokens, 'pickupInstructions', lang) && (
                  <p className={`text-xs whitespace-pre-line ${surface.muted}`}>{getThemeText(tokens, 'pickupInstructions', lang)}</p>
                )}
              </Section>
            ) : (
              <Section title={t.checkout.deliveryAddressSection} surface={surface} radius={radius}>
                <div>
                  <label className={labelClass}>{t.checkout.address} <span className="text-red-400">*</span></label>
                  <input required value={address} onChange={e => setAddress(e.target.value)} placeholder={t.checkout.addressPlaceholder} className={inputClass} />
                </div>
                <LocationPicker
                  surface={surface}
                  radius={radius}
                  t={t}
                  onLocationChange={loc => {
                    setAddress(loc.address)
                    setCoords({ lat: loc.lat, lng: loc.lng })
                  }}
                />
              </Section>
            )}

            {hasShippingZones && !isPickup && (
              <Section title={t.checkout.shippingZone} surface={surface} radius={radius}>
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
                        <p className={`font-semibold text-sm flex-1 min-w-0 break-words ${surface.text}`}>{resolveThemeText(zone.name, zone.translations?.en, zone.translations?.ru, lang)}</p>
                        <span className={`text-sm font-bold shrink-0 ${surface.text}`}>
                          {qualifiesForFreeShipping ? t.checkout.free : `₾${zone.price.toFixed(2)}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {!qualifiesForFreeShipping && tokens.freeShippingThreshold != null && (
                  <p className={`text-xs ${surface.muted}`}>
                    {t.checkout.freeShippingNudge2((tokens.freeShippingThreshold - cartTotal).toFixed(2))}
                  </p>
                )}
              </Section>
            )}

            <Section title={t.checkout.paymentMethodSection} surface={surface} radius={radius}>
              {enabledPaymentOptions.length === 0 && (
                <p className={`text-sm ${surface.muted}`}>{t.checkout.noPaymentMethodsAvailable}</p>
              )}
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
              <Section title={t.checkout.orderNotes} surface={surface} radius={radius}>
                <textarea
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  rows={3}
                  placeholder={t.checkout.notesPlaceholder}
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
                  {t.checkout.tosPrefix}{' '}
                  <Link href={`/pages/${tosPage.slug}`} target="_blank" className="underline underline-offset-2">
                    {getPageTitle(tosPage, lang)}
                  </Link>
                </span>
              </label>
            )}

            {!meetsMinOrder && tokens.minOrderAmount != null && (
              <p className="text-amber-500 text-sm">
                {t.checkout.minOrderNotMet(tokens.minOrderAmount.toFixed(2), (tokens.minOrderAmount - cartTotal).toFixed(2))}
              </p>
            )}

            {checkout.isError && <p className="text-red-400 text-sm">{t.checkout.genericError}</p>}

            <button
              type="submit"
              disabled={checkout.isPending || (tosRequired && !tosAccepted) || !meetsMinOrder || enabledPaymentOptions.length === 0}
              className={`py-4 text-white text-sm font-semibold uppercase tracking-wide disabled:opacity-40 ${radius} theme-cta-btn`}
              style={{ backgroundColor: tokens.accentColor, '--btn-hover-bg': getButtonHoverColor(tokens) } as React.CSSProperties}
            >
              {checkout.isPending ? t.checkout.submitPending : t.checkout.submitIdle}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className={`${surface.card} border ${surface.border} ${radius} p-5 lg:sticky lg:top-20`}>
              <h3 className={`font-bold text-sm mb-4 pb-4 border-b ${surface.border} ${surface.text}`}>{t.checkout.orderSummarySidebar}</h3>
              <div className={`flex flex-col divide-y ${surface.border} mb-4`}>
                {cart.bundleItems.map(item => {
                  const bundleName = resolveThemeText(item.bundleName, item.bundleNameEn, item.bundleNameRu, lang)
                  return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className={`w-11 h-11 shrink-0 overflow-hidden ${radius} ${surface.border} border`}>
                      {item.imageUrl ? (
                        <CImg src={item.imageUrl} alt={bundleName} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-[8px] ${surface.muted}`}>—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${surface.text}`}>{bundleName} <span className="font-normal opacity-60">{t.checkout.bundleTag}</span></p>
                      <p className={`text-[10px] ${surface.muted}`}>×{item.quantity}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${surface.text}`}>₾{(item.bundlePrice * item.quantity).toFixed(2)}</span>
                  </div>
                  )
                })}
                {cart.items.map(item => {
                  const productName = resolveThemeText(item.productName, item.productNameEn, item.productNameRu, lang)
                  return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className={`w-11 h-11 shrink-0 overflow-hidden ${radius} ${surface.border} border`}>
                      {item.imageUrl ? (
                        <CImg src={item.imageUrl} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-[8px] ${surface.muted}`}>—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${surface.text}`}>{productName}</p>
                      {item.options.length > 0 && (
                        <p className={`text-[10px] truncate ${surface.muted}`}>
                          {item.options.map(o => resolveThemeText(o.value, o.valueEn, o.valueRu, lang)).join(' / ')}
                        </p>
                      )}
                      <p className={`text-[10px] ${surface.muted}`}>×{item.quantity}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${surface.text}`}>₾{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  )
                })}
              </div>
              <div className={`flex flex-col gap-1.5 border-t ${surface.border} pt-4 mb-1`}>
                <div className={`flex justify-between text-sm ${surface.muted}`}>
                  <span>{t.checkout.subtotal}</span>
                  <span>₾{cart.total.toFixed(2)}</span>
                </div>
                {isPickup ? (
                  <div className={`flex justify-between text-sm ${surface.muted}`}>
                    <span>{t.checkout.shipping}</span>
                    <span>{t.checkout.pickup}</span>
                  </div>
                ) : hasShippingZones && (
                  <div className={`flex justify-between text-sm ${surface.muted}`}>
                    <span>{t.checkout.shipping}{selectedZone ? ` (${selectedZone.name})` : ''}</span>
                    <span>{shippingFee === 0 ? t.checkout.free : `₾${shippingFee.toFixed(2)}`}</span>
                  </div>
                )}
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>{t.checkout.discountRow(appliedDiscount.code)}</span>
                    <span>−₾{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {appliedDiscount ? (
                  <div className={`flex items-center justify-between gap-2 px-3 py-2 border ${surface.border} ${radius}`}>
                    <span className={`text-xs font-mono font-semibold ${surface.text}`}>{appliedDiscount.code}</span>
                    <button
                      type="button"
                      onClick={handleRemoveDiscountCode}
                      className={`text-xs underline underline-offset-2 ${surface.muted} hover:opacity-80`}
                    >
                      {t.checkout.removeDiscount}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCodeInput}
                      onChange={e => setDiscountCodeInput(e.target.value)}
                      placeholder={t.checkout.discountCodePlaceholder}
                      className={`${inputClass} flex-1 uppercase`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscountCode}
                      disabled={validateDiscount.isPending || !discountCodeInput.trim()}
                      className={`px-4 text-xs font-semibold shrink-0 border ${surface.border} ${radius} disabled:opacity-40`}
                      style={{ color: tokens.accentColor }}
                    >
                      {validateDiscount.isPending ? t.checkout.applyPending : t.checkout.apply}
                    </button>
                  </div>
                )}
                {discountError && <p className="text-xs text-red-400 mt-1.5">{discountError}</p>}
              </div>

              <div className={`border-t ${surface.border} pt-4 flex justify-between font-black text-base ${surface.text}`}>
                <span>{t.checkout.grandTotal}</span>
                <span>₾{orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
