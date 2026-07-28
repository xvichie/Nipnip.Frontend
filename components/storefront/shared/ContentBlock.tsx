import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import { getThemeText } from '@/lib/store/translations'
import { CImg } from '@/components/ui/CImg'

// Renders the merchant-authored homepage "About us / Why shop with us" block. Each theme's
// Home.tsx supplies its own typography/button classes so the block matches that theme's look,
// while the layout (optional image left/right, heading, body, optional button) stays shared.
export function ContentBlock({
  tokens,
  lang,
  headingClassName,
  bodyClassName,
  buttonClassName,
  buttonStyle,
}: {
  tokens: Required<ThemeConfig>
  lang: StorefrontLanguage
  headingClassName: string
  bodyClassName: string
  buttonClassName: string
  buttonStyle?: CSSProperties
}): ReactNode {
  const imageFirst = tokens.contentImagePosition === 'left'
  const hasButton = !!(tokens.contentButtonText.trim() && tokens.contentButtonLink.trim())
  const heading = getThemeText(tokens, 'contentHeading', lang)
  const body = getThemeText(tokens, 'contentBody', lang)
  const buttonText = getThemeText(tokens, 'contentButtonText', lang)

  return (
    <div className={`grid ${tokens.contentImageUrl ? 'md:grid-cols-2' : ''} gap-8 md:gap-14 items-center`}>
      {tokens.contentImageUrl && (
        <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${imageFirst ? 'md:order-1' : 'md:order-2'}`}>
          <CImg src={tokens.contentImageUrl} cldWidth={1000} alt={heading || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className={imageFirst ? 'md:order-2' : 'md:order-1'}>
        {heading && <h2 className={headingClassName}>{heading}</h2>}
        {body && <p className={bodyClassName}>{body}</p>}
        {hasButton && (
          <Link href={tokens.contentButtonLink} className={buttonClassName} style={buttonStyle}>
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}
