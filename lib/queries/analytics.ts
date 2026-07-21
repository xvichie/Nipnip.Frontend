'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { StoreAnalyticsSummaryResponse, TrackPageViewRequest } from '@/lib/types'

export function useStoreAnalytics(days: number) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'analytics', days],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StoreAnalyticsSummaryResponse>(`/api/stores/me/analytics?days=${days}`, token)
    },
  })
}

// Anonymous, fire-and-forget — used by the storefront's own PageViewTracker, never awaited by
// its caller. A failed beacon must never affect the visitor's browsing experience.
export function trackPageView(slug: string, body: TrackPageViewRequest) {
  apiFetch<void>(`/api/stores/${slug}/track-pageview`, null, {
    method: 'POST',
    body: JSON.stringify(body),
  }).catch(() => {})
}
