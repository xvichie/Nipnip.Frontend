'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { LanguageProvider } from '@/lib/i18n'
import { OnboardingGate } from '@/components/OnboardingGate'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <OnboardingGate>{children}</OnboardingGate>
      </QueryClientProvider>
    </LanguageProvider>
  )
}
