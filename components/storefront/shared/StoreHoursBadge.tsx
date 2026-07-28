'use client'

import { useEffect, useState } from 'react'
import type { ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'

type Status = { open: boolean; label: string }

// Georgia has a single timezone with no DST, and this only ever renders client-side, so the
// visitor's own local clock is already correct — no timezone-conversion code needed.
function getStatus(storeHours: Required<ThemeConfig>['storeHours'], t: StorefrontStrings): Status {
  const now = new Date()
  const today = storeHours.find(d => d.day === now.getDay())
  if (!today || today.closed) return { open: false, label: t.storeHours.closedToday }

  const [openH, openM] = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  if (minutesNow >= openMinutes && minutesNow < closeMinutes) {
    return { open: true, label: t.storeHours.openUntil(today.close) }
  }
  if (minutesNow < openMinutes) {
    return { open: false, label: t.storeHours.opensAt(today.open) }
  }
  return { open: false, label: t.storeHours.closedToday }
}

export function StoreHoursBadge({ tokens, t }: { tokens: Required<ThemeConfig>; t: StorefrontStrings }) {
  // Starts null so the server-rendered markup has nothing time-dependent to mismatch on
  // hydration — filled in immediately on mount, then refreshed once a minute.
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    function update() {
      setStatus(getStatus(tokens.storeHours, t))
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [tokens.storeHours, t])

  if (!status) return null

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${status.open ? 'text-emerald-600' : 'text-red-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.open ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status.label}
    </span>
  )
}
