'use client'

import { Suspense, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/queries/storefront'
import { usePublicOrderStatus } from '@/lib/queries/flitt'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { getThemeDefinition, isThemeId, RADIUS_CLASS, SURFACE_CLASSES } from '@/lib/storefront-themes'
import type { ThemeId } from '@/lib/types/storefront'

// Where Flitt's response_url sends the customer's browser back to after a hosted-checkout
// payment attempt — a full page navigation, so it can't reuse Checkout.tsx's in-memory
// mutation state and instead re-fetches the order by id.
export default function CheckoutConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <Suspense>
      <ConfirmationContent slug={slug} />
    </Suspense>
  )
}

function ConfirmationContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { data: store, isLoading: storeLoading } = useStore(slug)
  const { data: order, isLoading: orderLoading, isError } = usePublicOrderStatus(slug, orderId)

  if (storeLoading || orderLoading || !store) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const surface = SURFACE_CLASSES[themeId]
  const radius = RADIUS_CLASS[getThemeDefinition(themeId).radius]

  if (!orderId || isError || !order) {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center flex flex-col items-center gap-4">
          <h1 className={`font-black text-2xl ${surface.text}`}>შეკვეთა ვერ მოიძებნა</h1>
          <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.text}`}>
            მთავარ გვერდზე დაბრუნება →
          </Link>
        </div>
      </div>
    )
  }

  if (order.status === 'Cancelled') {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
          <div className={`w-16 h-16 border-2 border-red-500 flex items-center justify-center ${radius}`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M8 8l12 12M20 8 8 20" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className={`font-black text-3xl mb-2 ${surface.text}`}>გადახდა ვერ შესრულდა</h1>
            <p className={`text-sm ${surface.muted}`}>თქვენი ბარათიდან თანხის ჩამოჭრა ვერ მოხერხდა. სცადეთ თავიდან ან აირჩიეთ სხვა გადახდის მეთოდი.</p>
          </div>
          <Link
            href={`/cart`}
            className={`text-white text-sm font-semibold px-8 py-3.5 ${radius}`}
            style={{ backgroundColor: tokens.accentColor }}
          >
            კალათაში დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  if (order.status === 'Pending') {
    return (
      <div className={`${surface.page} min-h-screen`}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
          <div className={`w-12 h-12 border-2 border-t-transparent animate-spin rounded-full`} style={{ borderColor: tokens.accentColor, borderTopColor: 'transparent' }} />
          <div>
            <h1 className={`font-black text-2xl mb-2 ${surface.text}`}>გადახდის დადასტურება...</h1>
            <p className={`text-sm ${surface.muted}`}>გთხოვთ დაელოდოთ, ვადასტურებთ თქვენს გადახდას.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-6">
        <div className={`w-16 h-16 border-2 border-emerald-500 flex items-center justify-center ${radius}`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M4 14l7 7 13-13" stroke="#2d6a2d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className={`font-black text-3xl mb-2 ${surface.text}`}>შეკვეთა გაფორმდა!</h1>
          <p className={`text-sm break-words ${surface.muted}`}>
            გმადლობთ, {order.customerName}. თქვენი შეკვეთა #{order.id.slice(0, 8)} მიღებულია. დეტალები გამოგზავნილია {order.email}-ზე.
          </p>
          <p className={`text-sm font-bold mt-3 ${surface.text}`}>
            სულ: ₾{order.total.toFixed(2)}
            {order.shippingZoneName && (
              <span className={`font-normal ${surface.muted}`}>
                {' '}(მათ შორის მიწოდება{order.shippingFee > 0 ? ` — ₾${order.shippingFee.toFixed(2)}` : ' — უფასო'}, {order.shippingZoneName})
              </span>
            )}
          </p>
        </div>
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
