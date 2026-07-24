import type { ThemeConfig } from '@/lib/types/storefront'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    ttq?: { track: (...args: unknown[]) => void }
  }
}

/**
 * Fires the standard "purchase completed" event on whichever pixels the merchant has
 * configured — called once from the checkout success screen. Safe to call even when no
 * pixel scripts were loaded (tokens.*PixelId empty): each branch just no-ops.
 */
export function trackPurchase(tokens: Required<ThemeConfig>, orderId: string, total: number) {
  if (typeof window === 'undefined') return

  if (tokens.facebookPixelId && window.fbq) {
    window.fbq('track', 'Purchase', { value: total, currency: 'GEL', content_ids: [orderId] })
  }
  if (tokens.googleAnalyticsId && window.gtag) {
    window.gtag('event', 'purchase', { transaction_id: orderId, value: total, currency: 'GEL' })
  }
  if (tokens.tiktokPixelId && window.ttq) {
    window.ttq.track('CompletePayment', { value: total, currency: 'GEL', content_id: orderId })
  }
}
