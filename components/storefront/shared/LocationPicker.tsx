'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center text-xs opacity-50">იტვირთება რუკა...</div>,
})

export function LocationPicker({
  surface,
  radius,
  initialPosition = null,
  onLocationChange,
}: {
  surface: { border: string; text: string; muted: string }
  radius: string
  initialPosition?: { lat: number; lng: number } | null
  onLocationChange: (loc: { address: string; lat: number; lng: number }) => void
}) {
  const [open, setOpen] = useState(!!initialPosition)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition)
  const [isLocating, setIsLocating] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  async function resolveAndReport(lat: number, lng: number) {
    setPosition({ lat, lng })
    setIsResolving(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ka`
      )
      const data = await res.json()
      const address = typeof data?.display_name === 'string' ? data.display_name : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      onLocationChange({ address, lat, lng })
    } catch {
      onLocationChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng })
    } finally {
      setIsResolving(false)
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false)
        setOpen(true)
        resolveAndReport(pos.coords.latitude, pos.coords.longitude)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider underline underline-offset-2 ${surface.text}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6"/>
          </svg>
          {open ? 'რუკის დამალვა' : 'მდებარეობის არჩევა რუკაზე'}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={isLocating}
          className={`text-xs font-semibold uppercase tracking-wider underline underline-offset-2 disabled:opacity-50 ${surface.text}`}
        >
          {isLocating ? 'ეძებს მდებარეობას...' : 'ჩემი მდებარეობის გამოყენება'}
        </button>
      </div>

      {open && (
        <div className={`border ${surface.border} ${radius} overflow-hidden relative`}>
          <LocationPickerMap position={position} onPick={resolveAndReport} />
          {isResolving && (
            <div className="absolute top-2 right-2 bg-black/75 text-white text-[11px] px-2 py-1 rounded">
              მისამართის ძებნა...
            </div>
          )}
        </div>
      )}

      {position && (
        <p className={`text-xs ${surface.muted}`}>
          მდებარეობა შერჩეულია ({position.lat.toFixed(5)}, {position.lng.toFixed(5)})
        </p>
      )}
    </div>
  )
}
