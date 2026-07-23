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
          backgroundImage: `linear-gradient(rgba(255,255,255,0.75),rgba(255,255,255,0.92)), url(${tokens.bannerUrl})`,
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
        <p className={`italic font-serif ${HERO_EYEBROW_SIZE_CLASS[tokens.heroEyebrowSize]} ${getHeroTextColorClass(tokens, 'eyebrow', 'text-[#767676]')} mb-4`}>{tokens.heroEyebrow}</p>
      )}
      <h1 className={`font-serif tracking-tight leading-[0.95] mb-6 ${getHeroTextColorClass(tokens, 'headline', 'text-[#111111]')} ${HERO_HEADLINE_SIZE_CLASS[tokens.heroHeadlineSize]}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className={`${getHeroTextColorClass(tokens, 'subheadline', 'text-[#767676]')} ${HERO_SUBHEADLINE_SIZE_CLASS[tokens.heroSubheadlineSize]} mb-9`}>{tokens.heroSubheadline}</p>
      )}
      {tokens.heroCtaEnabled && (
        <Link
          href={getHeroCtaHref(tokens, categories)}
          className={`inline-flex items-center justify-center gap-2 border-2 text-xs uppercase tracking-widest font-medium px-8 py-3.5 transition-colors ${
            tokens.heroTextTheme === 'light'
              ? 'border-white text-white hover:bg-white hover:text-black'
              : 'border-black text-[#111111] hover:bg-black hover:text-white'
          }`}
        >
          {getHeroCtaLabel(tokens, 'ყველა პროდუქტის ნახვა')}
        </Link>
      )}
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
      <div className="relative h-full flex items-center justify-center overflow-hidden">
        <CImg src={tokens.heroImageUrl} cldWidth={1400} alt={tokens.heroHeadline || store.name} className={getHeroImageClass(tokens)} />
      </div>
    </div>
  )

  const featuredProducts = products.slice(0, 8)

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
        <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 md:gap-14 ${heightClass}`}>
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
    <section key="categories" className="border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-6`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2 text-center group"
            >
              <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5 text-[#111111]" />
              <span className="text-xs uppercase tracking-widest text-[#111111] group-hover:underline underline-offset-4">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-black/10">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-serif italic text-3xl text-[#111111]">ყველა პროდუქტი</h2>
          <Link href={`/products`} className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4">
            ყველას ნახვა →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#767676] text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                slug={slug}
                product={product}
                categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                tokens={tokens}
                // The first product becomes a large featured tile in this theme's
                // asymmetric lookbook grid; everything else renders 1x1.
                className={index === 0 ? 'col-span-2 row-span-2' : ''}
                featured={index === 0}
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
    <div className="bg-white min-h-screen">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
