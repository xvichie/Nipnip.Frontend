'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type { CreateWebsiteInquiryRequest, WebsiteInquiryResponse } from '@/lib/types'

// Public "I want a website" lead capture — anonymous, no store slug (see the footer form and
// NipNip.Modules.Merchants/WebsiteInquiryController on the backend).
export function useSubmitWebsiteInquiry() {
  return useMutation({
    mutationFn: (body: CreateWebsiteInquiryRequest) =>
      apiFetch<WebsiteInquiryResponse>('/api/website-inquiries', null, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  })
}

// Same endpoint, but called with the signed-in user's own token — used by the post-signup
// /onboarding page (see app/onboarding/page.tsx) so the backend can attach their Clerk user ID
// and dedupe repeat submissions.
export function useSubmitOnboardingInquiry() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async (body: CreateWebsiteInquiryRequest) => {
      const token = await getToken()
      return apiFetch<WebsiteInquiryResponse>('/api/website-inquiries', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
}

// Whether the signed-in user already submitted the onboarding inquiry — lets /onboarding show
// the "thanks, we'll be in touch" screen directly on a later visit instead of the form again.
export function useMyWebsiteInquiry(enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['website-inquiries', 'me'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<WebsiteInquiryResponse | null>('/api/website-inquiries/me', token)
    },
    enabled,
  })
}
