'use client'

import dynamic from 'next/dynamic'

const LocationDisplayMap = dynamic(() => import('./LocationDisplayMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center text-xs opacity-50">იტვირთება რუკა...</div>,
})

export function LocationMap({
  lat,
  lng,
  radius = '',
}: {
  lat: number
  lng: number
  radius?: string
}) {
  return (
    <div className={`overflow-hidden ${radius}`}>
      <LocationDisplayMap lat={lat} lng={lng} />
    </div>
  )
}
