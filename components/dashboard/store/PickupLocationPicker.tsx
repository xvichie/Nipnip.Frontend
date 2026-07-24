'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const LocationPickerMap = dynamic(() => import('@/components/storefront/shared/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center text-xs text-white/30">რუკა იტვირთება...</div>,
})

interface PickupLocationPickerProps {
  initialPosition?: { lat: number; lng: number } | null
  onLocationChange: (loc: { address: string; lat: number; lng: number }) => void
}

// Dashboard-styled counterpart to components/storefront/shared/LocationPicker.tsx (that one
// is themed for the public checkout page) — reuses the same underlying LocationPickerMap
// (Leaflet) and Nominatim reverse-geocode so a merchant's pickup address round-trips through
// the exact same "address + lat/lng" shape an order's dropoff address already uses.
export function PickupLocationPicker({ initialPosition = null, onLocationChange }: PickupLocationPickerProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isLocating, setIsLocating] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  async function resolveAndReport(lat: number, lng: number) {
    setPosition({ lat, lng })
    setIsResolving(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`)
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
          onClick={useMyLocation}
          disabled={isLocating}
          className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 disabled:opacity-50"
        >
          {isLocating ? 'მდებარეობის დადგენა…' : 'ჩემი მდებარეობის გამოყენება'}
        </button>
        <span className="text-xs text-white/25">ან დააჭირეთ რუკას</span>
        {isResolving && <span className="text-xs text-white/30">მისამართის დადგენა…</span>}
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden relative">
        <LocationPickerMap position={position} onPick={resolveAndReport} />
      </div>

      {position && (
        <p className="text-xs text-white/30">არჩეულია ({position.lat.toFixed(5)}, {position.lng.toFixed(5)})</p>
      )}
    </div>
  )
}
