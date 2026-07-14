'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const TBILISI = { lat: 41.7151, lng: 44.8271 }

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: e => onPick(e.latlng.lat, e.latlng.lng),
  })
  return null
}

export default function LocationPickerMap({
  position,
  onPick,
}: {
  position: { lat: number; lng: number } | null
  onPick: (lat: number, lng: number) => void
}) {
  const center = useMemo(() => position ?? TBILISI, [position])

  return (
    <MapContainer center={center} zoom={position ? 15 : 12} style={{ height: '260px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {position && (
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: e => {
              const marker = e.target as L.Marker
              const { lat, lng } = marker.getLatLng()
              onPick(lat, lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}
