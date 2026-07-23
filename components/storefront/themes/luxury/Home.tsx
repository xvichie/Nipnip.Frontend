import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { getBannerBackgroundStyle, getHeroBackgroundImageClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, hasBanner, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { getLandingCategories } from '@/lib/store/landing-categories'
import type { CategoryResponse, HomeSectionKey, ProductSummaryResponse, StoreResponse, ThemeConfig } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

export function Home({
  slug,
  store,
  categories,
  products,
  tokens,
}: {
  slug: string
  store: StoreResponse
  categories: CategoryResponse[]
  products: ProductSummaryResponse[]
  tokens: Required<ThemeConfig>
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const landingCategories = getLandingCategories(categories, tokens)
  const isSplitHero = (tokens.heroLayout === 'imageLeft' || tokens.heroLayout === 'imageRight') && !!tokens.heroImageUrl
  const isBackgroundHero = tokens.heroLayout === 'background' && !!tokens.heroImageUrl
  const heightClass = HERO_HEIGHT_CLASS[tokens.heroHeight]
  const bannerActive = hasBanner(tokens)
  const bannerStyle = getBannerBackgroundStyle(tokens)
  const sectionBanner = bannerActive && !isBackgroundHero && (!isSplitHero || tokens.bannerPlacement === 'section')
  const imageBanner = bannerActive && isSplitHero && tokens.bannerPlacement === 'behindImage'
  const overlayStyle = getHeroOverlayStyle(tokens)
  const sectionStyle = sectionBanner
    ? tokens.bannerType === 'image'
      ? {
          backgroundImage: `linear-gradient(rgba(250,247,242,0.8),rgba(250,247,242,0.92)), url(${tokens.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : bannerStyle
    : {}
  const pos = HERO_TEXT_POSITION_CLASS[tokens.heroTextPosition]
  const desktopImageFirst = tokens.heroLayout === 'imageLeft'
  const mobileImageFirst = tokens.heroMobileImagePosition === 'inherit'
    ? desktopImageFirst
    : tokens.heroMobileImagePosition === 'top'
  const imageOrderClass = `${mobileImageFirst ? 'order-1' : 'order-2'} ${desktopImageFirst ? 'md:order-1' : 'md:order-2'}`
  const textOrderClass = `${mobileImageFirst ? 'order-2' : 'order-1'} ${desktopImageFirst ? 'md:order-2' : 'md:order-1'}`
  const heroImageHiddenMobile = tokens.heroMobileImage === 'hide'
  const textAlignClass = getHeroTextAlignClass(tokens)

  const heroText = (
    <div className={`w-full max-w-xl ${textAlignClass}`}>
      {tokens.heroEyebrow && (
        <p className={`${HERO_EYEBROW_SIZE_CLASS[tokens.heroEyebrowSize]} uppercase tracking-[0.3em] ${getHeroTextColorClass(tokens, 'eyebrow', 'text-[#9c7a4a]')} mb-4`}>{tokens.heroEyebrow}</p>
      )}
      <h1 className={`font-serif tracking-tight mb-6 ${getHeroTextColorClass(tokens, 'headline', 'text-[#1c1a17]')} ${HERO_HEADLINE_SIZE_CLASS[tokens.heroHeadlineSize]}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className={`${getHeroTextColorClass(tokens, 'subheadline', 'text-[#6b6255]')} ${HERO_SUBHEADLINE_SIZE_CLASS[tokens.heroSubheadlineSize]} mb-9`}>{tokens.heroSubheadline}</p>
      )}
      {tokens.heroCtaEnabled && (
        <Link
          href={getHeroCtaHref(tokens, categories)}
          className="inline-flex items-center gap-2 border text-xs uppercase tracking-widest px-8 py-3.5 transition-colors"
          style={{ borderColor: tokens.accentColor, color: tokens.accentColor }}
        >
          {getHeroCtaLabel(tokens, 'ყველა პროდუქტის ნახვა')}
        </Link>
      )}
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
      <div className={`relative h-full flex items-center justify-center overflow-hidden ${imageBanner || sectionBanner ? '' : 'bg-white border border-[#1c1a17]/10'}`}>
        <CImg src={tokens.heroImageUrl} cldWidth={1400} alt={tokens.heroHeadline || store.name} className={getHeroImageClass(tokens)} />
      </div>
    </div>
  )

  const heroSection = (
    <section key="hero" className="relative overflow-hidden" style={sectionStyle}>
      {isBackgroundHero ? (
        <div className={`relative ${heightClass}`}>
          <div className="absolute inset-0">
            <CImg src={tokens.heroImageUrl} cldWidth={1800} alt={tokens.heroHeadline || store.name} className={getHeroBackgroundImageClass(tokens)} />
            {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
          </div>
          <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col ${pos.wrapper}`}>
            {heroText}
          </div>
        </div>
      ) : isSplitHero ? (
        <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 md:gap-16 ${heightClass}`}>
          {heroImage}
          <div className={`h-full flex flex-col ${pos.wrapper} ${textOrderClass}`}>{heroText}</div>
        </div>
      ) : (
        <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col ${pos.wrapper} ${heightClass}`}>
          {heroText}
        </div>
      )}
    </section>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-t border-[#1c1a17]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-4`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2.5 border border-[#1c1a17]/10 hover:border-[#1c1a17]/30 transition-colors px-4 py-7 text-center text-xs uppercase tracking-widest text-[#1c1a17]/70"
            >
              <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5" style={{ color: tokens.accentColor }} />
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-2xl text-[#1c1a17]">ყველა პროდუქტი</h2>
          <Link href={`/products`} className="text-xs uppercase tracking-widest hover:underline underline-offset-4" style={{ color: tokens.accentColor }}>
            ყველას ნახვა →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#9c8f7e] text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard
                key={product.id}
                slug={slug}
                product={product}
                categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                tokens={tokens}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )

  const sections: Record<HomeSectionKey, React.ReactNode> = {
    hero: heroSection,
    categories: categoriesSection,
    products: productsSection,
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
