'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/queries/analytics'
import { getOrCreateVisitorId } from '@/lib/store/visitor-session'

// Renders nothing — fires a fire-and-forget pageview beacon on first load and on every
// client-side route change within the storefront. Lives in the store layout so it covers
// every page (home, products, contact, etc.) without each page needing its own tracking call.
export function PageViewTracker({ slug }: { slug: string }) {
  const pathname = usePathname()

  useEffect(() => {
    const visitorId = getOrCreateVisitorId(slug)
    trackPageView(slug, {
      path: pathname,
      referrer: document.referrer || undefined,
      visitorId,
    })
  }, [pathname, slug])

  return null
}
