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
        <p className={`${HERO_EYEBROW_SIZE_CLASS[tokens.heroEyebrowSize]} font-semibold uppercase tracking-[0.28em] ${getHeroTextColorClass(tokens, 'eyebrow', 'text-[#999]')} mb-4`}>{tokens.heroEyebrow}</p>
      )}
      <h1 className={`font-black tracking-tight mb-4 ${getHeroTextColorClass(tokens, 'headline', 'text-[#111]')} ${HERO_HEADLINE_SIZE_CLASS[tokens.heroHeadlineSize]}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className={`${getHeroTextColorClass(tokens, 'subheadline', 'text-[#666]')} ${HERO_SUBHEADLINE_SIZE_CLASS[tokens.heroSubheadlineSize]} mb-6`}>{tokens.heroSubheadline}</p>
      )}
      {tokens.heroCtaEnabled && (
        <Link
          href={getHeroCtaHref(tokens, categories)}
          className="inline-flex items-center gap-2 text-white text-xs font-bold px-7 py-3.5 transition-opacity hover:opacity-90 uppercase tracking-widest"
          style={{ backgroundColor: tokens.accentColor }}
        >
          {getHeroCtaLabel(tokens, 'ყველა პროდუქტის ნახვა')}
        </Link>
      )}
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
      <div className={`relative h-full flex items-center justify-center overflow-hidden ${imageBanner || sectionBanner ? '' : 'bg-[#f7f7f7]'}`}>
        <CImg src={tokens.heroImageUrl} cldWidth={1400} alt={tokens.heroHeadline || store.name} className={getHeroImageClass(tokens)} />
      </div>
    </div>
  )

  const heroSection = (
    <section
      key="hero"
      className="border-b border-[#e5e5e5] relative overflow-hidden"
      style={sectionBanner ? bannerStyle : {}}
    >
      {sectionBanner && tokens.bannerType === 'image' && <div className="absolute inset-0 bg-white/80" />}

      {isBackgroundHero ? (
        <div className={`relative ${heightClass}`}>
          <div className="absolute inset-0">
            <CImg src={tokens.heroImageUrl} cldWidth={1800} alt={tokens.heroHeadline || store.name} className={getHeroBackgroundImageClass(tokens)} />
            {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
          </div>
          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col ${pos.wrapper}`}>
            {heroText}
          </div>
        </div>
      ) : isSplitHero ? (
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 md:gap-16 ${heightClass}`}>
          {heroImage}
          <div className={`h-full flex flex-col ${pos.wrapper} ${textOrderClass}`}>{heroText}</div>
        </div>
      ) : (
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col ${pos.wrapper} ${heightClass}`}>
          {heroText}
        </div>
      )}
    </section>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2 border border-[#e5e5e5] rounded-lg px-4 py-5 text-center hover:border-[#111] transition-colors"
            >
              <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-6 h-6 text-[#111]" />
              <span className="text-sm text-[#555]">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-black text-2xl text-[#111] tracking-tight">ყველა პროდუქტი</h2>
          <Link
            href={`/products`}
            className="text-xs font-medium text-[#555] hover:text-[#111] transition-colors underline underline-offset-4"
          >
            ყველას ნახვა →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#999] text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
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
    <section key="content" className="border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <ContentBlock
          tokens={tokens}
          headingClassName="font-black text-2xl sm:text-3xl text-[#111] tracking-tight mb-4"
          bodyClassName="text-[#666] text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 text-white text-xs font-bold px-6 py-3 uppercase tracking-widest hover:opacity-90 transition-opacity"
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
    <div className="bg-white">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
