'use client'

import { useEffect, useState } from 'react'
import type { ThemeConfig } from '@/lib/types/storefront'

type Status = { open: boolean; label: string }

// Georgia has a single timezone with no DST, and this only ever renders client-side, so the
// visitor's own local clock is already correct — no timezone-conversion code needed.
function getStatus(storeHours: Required<ThemeConfig>['storeHours']): Status {
  const now = new Date()
  const today = storeHours.find(d => d.day === now.getDay())
  if (!today || today.closed) return { open: false, label: 'დღეს დაკეტილია' }

  const [openH, openM] = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  if (minutesNow >= openMinutes && minutesNow < closeMinutes) {
    return { open: true, label: `ღიაა — იხურება ${today.close}-ზე` }
  }
  if (minutesNow < openMinutes) {
    return { open: false, label: `იხსნება ${today.open}-ზე` }
  }
  return { open: false, label: 'დღეს დაკეტილია' }
}

export function StoreHoursBadge({ tokens }: { tokens: Required<ThemeConfig> }) {
  // Starts null so the server-rendered markup has nothing time-dependent to mismatch on
  // hydration — filled in immediately on mount, then refreshed once a minute.
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    function update() {
      setStatus(getStatus(tokens.storeHours))
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [tokens.storeHours])

  if (!status) return null

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${status.open ? 'text-emerald-600' : 'text-red-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.open ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status.label}
    </span>
  )
}
