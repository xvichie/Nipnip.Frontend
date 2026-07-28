'use client'

import dynamic from 'next/dynamic'

// Next's dynamic() `loading` callback runs outside the component tree (no props/context
// available), so it can't show translated text — a bare spinner sidesteps that instead.
const LocationDisplayMap = dynamic(() => import('./LocationDisplayMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center"><span className="loading loading-spinner loading-sm opacity-50" /></div>,
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
