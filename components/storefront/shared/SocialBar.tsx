import { SURFACE_CLASSES } from '@/lib/storefront-themes'
import { SocialLinks } from './SocialLinks'
import type { ThemeConfig, ThemeId } from '@/lib/types/storefront'

export function SocialBar({
  themeId,
  tokens,
  edge,
}: {
  themeId: ThemeId
  tokens: Required<ThemeConfig>
  edge: 'top' | 'bottom'
}) {
  const surface = SURFACE_CLASSES[themeId]
  const hasSocials = tokens.socialInstagram || tokens.socialFacebook || tokens.socialTiktok || tokens.socialYoutube

  if (!hasSocials) return null

  return (
    <div className={`${surface.page} ${surface.text} ${edge === 'top' ? 'border-b' : 'border-t'} ${surface.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-end">
        <SocialLinks tokens={tokens} />
      </div>
    </div>
  )
}
