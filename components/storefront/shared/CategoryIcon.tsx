import type { CSSProperties } from 'react'
import { getCategoryIcon } from '@/lib/store/category-icons'

export function CategoryIcon({
  iconUrl,
  iconKey,
  iconEmoji,
  className = 'w-6 h-6',
  style,
}: {
  iconUrl: string | null
  iconKey: string | null
  iconEmoji: string | null
  className?: string
  style?: CSSProperties
}) {
  // getCategoryIcon looks up a stable reference from a static module-level map — not a fresh component per render.
  const Icon = getCategoryIcon(iconKey)

  if (iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={iconUrl} alt="" className={`${className} object-cover rounded-full`} />
  }
  if (Icon) {
    // eslint-disable-next-line react-hooks/static-components
    return <Icon className={className} style={style} strokeWidth={1.5} aria-hidden />
  }
  if (iconEmoji) {
    return <span className={`${className} flex items-center justify-center leading-none`} style={style} aria-hidden>{iconEmoji}</span>
  }
  return null
}
