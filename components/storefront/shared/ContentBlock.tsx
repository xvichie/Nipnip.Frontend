import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

// Renders the merchant-authored homepage "About us / Why shop with us" block. Each theme's
// Home.tsx supplies its own typography/button classes so the block matches that theme's look,
// while the layout (optional image left/right, heading, body, optional button) stays shared.
export function ContentBlock({
  tokens,
  headingClassName,
  bodyClassName,
  buttonClassName,
  buttonStyle,
}: {
  tokens: Required<ThemeConfig>
  headingClassName: string
  bodyClassName: string
  buttonClassName: string
  buttonStyle?: CSSProperties
}): ReactNode {
  const imageFirst = tokens.contentImagePosition === 'left'
  const hasButton = !!(tokens.contentButtonText.trim() && tokens.contentButtonLink.trim())

  return (
    <div className={`grid ${tokens.contentImageUrl ? 'md:grid-cols-2' : ''} gap-8 md:gap-14 items-center`}>
      {tokens.contentImageUrl && (
        <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${imageFirst ? 'md:order-1' : 'md:order-2'}`}>
          <CImg src={tokens.contentImageUrl} cldWidth={1000} alt={tokens.contentHeading || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className={imageFirst ? 'md:order-2' : 'md:order-1'}>
        {tokens.contentHeading && <h2 className={headingClassName}>{tokens.contentHeading}</h2>}
        {tokens.contentBody && <p className={bodyClassName}>{tokens.contentBody}</p>}
        {hasButton && (
          <Link href={tokens.contentButtonLink} className={buttonClassName} style={buttonStyle}>
            {tokens.contentButtonText}
          </Link>
        )}
      </div>
    </div>
  )
}
