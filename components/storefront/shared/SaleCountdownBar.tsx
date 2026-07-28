'use client'

import { useEffect, useState } from 'react'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'
import type { ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'

function getRemaining(endsAt: string, t: StorefrontStrings): { done: boolean; text: string } {
  const diffMs = new Date(endsAt).getTime() - Date.now()
  if (diffMs <= 0) return { done: true, text: '' }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const text = days > 0
    ? `${days}${t.saleCountdown.dayAbbr} ${pad(hours)}${t.saleCountdown.hourAbbr} ${pad(minutes)}${t.saleCountdown.minuteAbbr}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return { done: false, text }
}

export function SaleCountdownBar({ tokens }: { tokens: Required<ThemeConfig> }) {
  const { t } = useStorefrontLanguage()
  // Starts null so the server-rendered markup has nothing time-dependent to mismatch on
  // hydration — filled in immediately on mount, then refreshed once a second.
  const [remaining, setRemaining] = useState<{ done: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!tokens.saleCountdownEndsAt) return

    function update() {
      const next = getRemaining(tokens.saleCountdownEndsAt!, t)
      setRemaining(next)
      // Stop ticking once the countdown ends instead of running a no-op timer forever.
      if (next.done) clearInterval(interval)
    }

    const interval = setInterval(update, 1000)
    update()
    return () => clearInterval(interval)
  }, [tokens.saleCountdownEndsAt, t])

  if (!tokens.saleCountdownEnabled || !tokens.saleCountdownEndsAt || !remaining || remaining.done) return null

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white"
      style={{ backgroundColor: tokens.accentColor }}
    >
      <span>{tokens.saleCountdownText || t.saleCountdown.defaultLabel}</span>
      <span className="font-mono tabular-nums tracking-wide">{remaining.text}</span>
    </div>
  )
}
