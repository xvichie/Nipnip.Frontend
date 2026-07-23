import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { getBannerBackgroundStyle, getHeroBackgroundImageClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, hasBanner, hasContentBlock, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { getLandingCategories } from '@/lib/store/landing-categories'
import { ContentBlock } from '@/components/storefront/shared/ContentBlock'
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
          backgroundImage: `linear-gradient(rgba(255,255,255,0.75),rgba(255,255,255,0.9)), url(${tokens.bannerUrl})`,
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
        <p className={`flex items-center gap-2 ${HERO_EYEBROW_SIZE_CLASS[tokens.heroEyebrowSize]} font-semibold uppercase tracking-widest ${getHeroTextColorClass(tokens, 'eyebrow', 'text-slate-500')} mb-3`}>
          <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
          {tokens.heroEyebrow}
        </p>
      )}
      <h1 className={`font-black tracking-tight mb-5 ${getHeroTextColorClass(tokens, 'headline', 'text-slate-900')} ${HERO_HEADLINE_SIZE_CLASS[tokens.heroHeadlineSize]}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className={`${getHeroTextColorClass(tokens, 'subheadline', 'text-slate-500')} ${HERO_SUBHEADLINE_SIZE_CLASS[tokens.heroSubheadlineSize]} mb-8`}>{tokens.heroSubheadline}</p>
      )}
      {tokens.heroCtaEnabled && (
        <Link
          href={getHeroCtaHref(tokens, categories)}
          className="inline-flex items-center gap-2 rounded-md text-white text-sm font-semibold px-7 py-3 shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: tokens.accentColor }}
        >
          {getHeroCtaLabel(tokens, 'ყველა პროდუქტის ნახვა')}
        </Link>
      )}
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-md" style={bannerStyle} />}
      <div className={`relative h-full flex items-center justify-center overflow-hidden rounded-md ${imageBanner || sectionBanner ? '' : 'bg-white border border-slate-200'}`}>
        <CImg src={tokens.heroImageUrl} cldWidth={1400} alt={tokens.heroHeadline || store.name} className={getHeroImageClass(tokens)} />
      </div>
    </div>
  )

  const heroSection = (
    <section key="hero" className="bg-white relative overflow-hidden" style={sectionStyle}>
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
    <section key="categories" className="border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-slate-200 bg-white hover:border-slate-900 transition-colors px-4 py-6 text-center uppercase text-xs font-semibold tracking-wide text-slate-700"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="flex items-center gap-2 font-bold text-2xl text-slate-900">
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
            ყველა პროდუქტი
          </h2>
          <Link href={`/products`} className="text-sm font-semibold hover:underline" style={{ color: tokens.accentColor }}>
            ყველას ნახვა →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-slate-400 text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <ContentBlock
          tokens={tokens}
          headingClassName="font-bold text-2xl sm:text-3xl text-slate-900 mb-4"
          bodyClassName="text-slate-500 text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 rounded-md text-white text-sm font-semibold px-7 py-3 shadow-sm hover:shadow-md transition-shadow"
          buttonStyle={{ backgroundColor: tokens.accentColor }}
        />
      </div>
    </section>
  )

  const sections: Record<HomeSectionKey, React.ReactNode> = {
    hero: heroSection,
    categories: categoriesSection,
    products: productsSection,
    content: contentSection,
  }

  return (
    <div className="bg-white min-h-screen">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
