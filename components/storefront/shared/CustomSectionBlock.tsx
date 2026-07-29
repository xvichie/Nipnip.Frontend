import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import type { CustomSection, HeroMobileTextAlign } from '@/lib/types/storefront'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import { resolveThemeText } from '@/lib/store/translations'
import { CImg } from '@/components/ui/CImg'

type Align = 'left' | 'center' | 'right'

const TEXT_ALIGN_CLASS: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }
const TEXT_ALIGN_CLASS_MD: Record<Align, string> = { left: 'md:text-left', center: 'md:text-center', right: 'md:text-right' }
const ITEMS_CLASS: Record<Align, string> = { left: 'items-start', center: 'items-center', right: 'items-end' }
const ITEMS_CLASS_MD: Record<Align, string> = { left: 'md:items-start', center: 'md:items-center', right: 'md:items-end' }

// Same "mobile overrides desktop only when explicitly set" combining rule as the hero section's
// getHeroTextAlignClass — 'inherit' (the default) means mobile just uses the same alignment as
// desktop, no separate mobile-only classes needed.
function getAlignClasses(mobileTextAlign: HeroMobileTextAlign | undefined, desktopAlign: Align): string {
  if (!mobileTextAlign || mobileTextAlign === 'inherit') {
    return `${TEXT_ALIGN_CLASS[desktopAlign]} ${ITEMS_CLASS[desktopAlign]}`
  }
  return `${TEXT_ALIGN_CLASS[mobileTextAlign]} ${ITEMS_CLASS[mobileTextAlign]} ${TEXT_ALIGN_CLASS_MD[desktopAlign]} ${ITEMS_CLASS_MD[desktopAlign]}`
}

// Renders one merchant-created homepage section — like ContentBlock (which this is modeled on),
// but there can be any number of these, and the image can additionally go full-bleed as a
// background (mirroring the hero section's own left/right/background layout options), with the
// same per-device image-order/visibility/text-align overrides the hero section already has.
export function CustomSectionBlock({
  section,
  lang,
  headingClassName,
  bodyClassName,
  buttonClassName,
  buttonStyle,
}: {
  section: CustomSection
  lang: StorefrontLanguage
  headingClassName: string
  bodyClassName: string
  buttonClassName: string
  buttonStyle?: CSSProperties
}): ReactNode {
  const heading = resolveThemeText(section.heading, section.translations?.en?.heading, section.translations?.ru?.heading, lang)
  const body = resolveThemeText(section.body, section.translations?.en?.body, section.translations?.ru?.body, lang)
  const buttonText = resolveThemeText(section.buttonText, section.translations?.en?.buttonText, section.translations?.ru?.buttonText, lang)
  const hasButton = !!(buttonText.trim() && section.buttonLink?.trim())
  const layout = section.imageLayout ?? 'left'
  const hasImage = !!section.imageUrl

  if (hasImage && layout === 'background') {
    const alignClass = getAlignClasses(section.mobileTextAlign, 'center')
    return (
      <div className="relative min-h-[22rem] flex overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <CImg src={section.imageUrl} cldWidth={1600} alt={heading || ''} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className={`relative z-10 flex flex-col justify-center w-full px-6 py-16 sm:px-12 ${alignClass}`}>
          <div className="max-w-xl">
            {heading && <h2 className={`${headingClassName} text-white`}>{heading}</h2>}
            {body && <p className={`${bodyClassName} text-white/85`}>{body}</p>}
            {hasButton && (
              <Link href={section.buttonLink!} className={buttonClassName} style={buttonStyle}>
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const desktopImageFirst = layout === 'left'
  const mobileImagePosition = section.mobileImagePosition ?? 'inherit'
  const mobileImageFirst = mobileImagePosition === 'inherit' ? desktopImageFirst : mobileImagePosition === 'top'
  const imageOrderClass = `${mobileImageFirst ? 'order-1' : 'order-2'} ${desktopImageFirst ? 'md:order-1' : 'md:order-2'}`
  const textOrderClass = `${mobileImageFirst ? 'order-2' : 'order-1'} ${desktopImageFirst ? 'md:order-2' : 'md:order-1'}`
  const imageHiddenMobile = (section.mobileImage ?? 'show') === 'hide'
  const textAlignClass = getAlignClasses(section.mobileTextAlign, 'left')

  return (
    <div className={`grid ${hasImage ? 'md:grid-cols-2' : ''} gap-8 md:gap-14 items-center`}>
      {hasImage && (
        <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${imageOrderClass} ${imageHiddenMobile ? 'hidden md:block' : ''}`}>
          <CImg src={section.imageUrl} cldWidth={1000} alt={heading || ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`flex flex-col ${textAlignClass} ${hasImage ? textOrderClass : ''}`}>
        {heading && <h2 className={headingClassName}>{heading}</h2>}
        {body && <p className={bodyClassName}>{body}</p>}
        {hasButton && (
          <Link href={section.buttonLink!} className={buttonClassName} style={buttonStyle}>
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}
