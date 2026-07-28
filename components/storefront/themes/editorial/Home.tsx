import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { ProductScrollRow } from '@/components/storefront/shared/ProductScrollRow'
import { HeroCarousel } from '@/components/storefront/shared/HeroCarousel'
import { ScrollIndicator } from '@/components/storefront/shared/ScrollIndicator'
import { getBannerBackgroundStyle, getHeroBackgroundImageClass, getHeroButtonRowClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroSecondaryCtaHref, getHeroSecondaryCtaLabel, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, getSectionBackgroundStyle, hasBanner, hasContentBlock, hasHeroVideo, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { getLandingCategories } from '@/lib/store/landing-categories'
import { getLandingCollections } from '@/lib/store/landing-collections'
import { ContentBlock } from '@/components/storefront/shared/ContentBlock'
import { FaqAccordion } from '@/components/storefront/shared/FaqAccordion'
import type { CategoryResponse, CollectionResponse, HomeSectionKey, ProductSummaryResponse, StoreResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

export function Home({
  slug,
  store,
  categories,
  collections,
  collectionProducts,
  products,
  tokens,
  t,
}: {
  slug: string
  store: StoreResponse
  categories: CategoryResponse[]
  collections: CollectionResponse[]
  collectionProducts: Map<string, ProductSummaryResponse[]>
  products: ProductSummaryResponse[]
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const landingCategories = getLandingCategories(categories, tokens)
  const landingCollections = getLandingCollections(collections, tokens)
  function buildHero(cfg: Required<ThemeConfig>) {
    const isSplitHero = (cfg.heroLayout === 'imageLeft' || cfg.heroLayout === 'imageRight') && !!cfg.heroImageUrl
    const isBackgroundHero = cfg.heroLayout === 'background' && !!cfg.heroImageUrl
    const heightClass = HERO_HEIGHT_CLASS[cfg.heroHeight]
    const bannerActive = hasBanner(cfg)
    const bannerStyle = getBannerBackgroundStyle(cfg)
    const sectionBanner = bannerActive && !isBackgroundHero && (!isSplitHero || cfg.bannerPlacement === 'section')
    const imageBanner = bannerActive && isSplitHero && cfg.bannerPlacement === 'behindImage'
    const overlayStyle = getHeroOverlayStyle(cfg)
    const sectionStyle = sectionBanner
      ? cfg.bannerType === 'image'
        ? {
            backgroundImage: `linear-gradient(rgba(255,255,255,0.75),rgba(255,255,255,0.92)), url(${cfg.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : bannerStyle
      : {}
    const pos = HERO_TEXT_POSITION_CLASS[cfg.heroTextPosition]
    const desktopImageFirst = cfg.heroLayout === 'imageLeft'
    const mobileImageFirst = cfg.heroMobileImagePosition === 'inherit'
      ? desktopImageFirst
      : cfg.heroMobileImagePosition === 'top'
    const imageOrderClass = `${mobileImageFirst ? 'order-1' : 'order-2'} ${desktopImageFirst ? 'md:order-1' : 'md:order-2'}`
    const textOrderClass = `${mobileImageFirst ? 'order-2' : 'order-1'} ${desktopImageFirst ? 'md:order-2' : 'md:order-1'}`
    const heroImageHiddenMobile = cfg.heroMobileImage === 'hide'
    const textAlignClass = getHeroTextAlignClass(cfg)

    const heroText = (
      <div className={`w-full max-w-xl ${textAlignClass}`}>
        {cfg.heroEyebrow && (
          <p className={`italic font-serif ${HERO_EYEBROW_SIZE_CLASS[cfg.heroEyebrowSize]} ${getHeroTextColorClass(cfg, 'eyebrow', 'text-[#767676]')} mb-4`}>{cfg.heroEyebrow}</p>
        )}
        <h1 className={`font-serif tracking-tight leading-[0.95] mb-6 ${getHeroTextColorClass(cfg, 'headline', 'text-[#111111]')} ${HERO_HEADLINE_SIZE_CLASS[cfg.heroHeadlineSize]}`}>
          {cfg.heroHeadline || store.name}
        </h1>
        {cfg.heroSubheadline && (
          <p className={`${getHeroTextColorClass(cfg, 'subheadline', 'text-[#767676]')} ${HERO_SUBHEADLINE_SIZE_CLASS[cfg.heroSubheadlineSize]} mb-9`}>{cfg.heroSubheadline}</p>
        )}
        {(cfg.heroCtaEnabled || cfg.heroSecondaryCtaEnabled) && (
          <div className={`flex flex-wrap items-center gap-6 ${getHeroButtonRowClass(cfg)}`}>
            {cfg.heroCtaEnabled && (
              <Link
                href={getHeroCtaHref(cfg, categories)}
                className={`inline-flex items-center justify-center gap-2 border-2 text-xs uppercase tracking-widest font-medium px-8 py-3.5 transition-colors ${
                  cfg.heroTextTheme === 'light'
                    ? 'border-white text-white hover:bg-white hover:text-black'
                    : 'border-black text-[#111111] hover:bg-black hover:text-white'
                }`}
              >
                {getHeroCtaLabel(cfg, t.home.heroPrimaryCta)}
              </Link>
            )}
            {cfg.heroSecondaryCtaEnabled && (
              <Link
                href={getHeroSecondaryCtaHref(cfg, categories)}
                className={`text-xs uppercase tracking-widest font-medium underline underline-offset-4 transition-opacity hover:opacity-70 ${
                  cfg.heroTextTheme === 'light' ? 'text-white' : 'text-[#111111]'
                }`}
              >
                {getHeroSecondaryCtaLabel(cfg, t.home.heroSecondaryCta)}
              </Link>
            )}
          </div>
        )}
      </div>
    )

    const heroImage = (
      <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
        {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
        <div className="relative h-full flex items-center justify-center overflow-hidden">
          <CImg src={cfg.heroImageUrl} cldWidth={1400} alt={cfg.heroHeadline || store.name} className={getHeroImageClass(cfg)} fetchPriority="high" />
        </div>
      </div>
    )

    return (
      <section className="relative overflow-hidden" style={sectionStyle}>
        {isBackgroundHero ? (
          <div className={`relative flex flex-col ${pos.wrapper} ${heightClass}`}>
            <div className="absolute inset-0">
              {hasHeroVideo(cfg) ? (
                <>
                  <video
                    key={cfg.heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={cfg.heroImageUrl}
                    className={`${getHeroBackgroundImageClass(cfg)} ${cfg.heroVideoMobileEnabled ? '' : 'hidden md:block'}`}
                  >
                    <source src={cfg.heroVideoUrl} />
                  </video>
                  {!cfg.heroVideoMobileEnabled && (
                    <CImg src={cfg.heroImageUrl} cldWidth={1800} alt={cfg.heroHeadline || store.name} className={`${getHeroBackgroundImageClass(cfg)} md:hidden`} fetchPriority="high" />
                  )}
                </>
              ) : (
                <CImg src={cfg.heroImageUrl} cldWidth={1800} alt={cfg.heroHeadline || store.name} className={`${getHeroBackgroundImageClass(cfg)} ${cfg.heroKenBurnsEnabled ? 'animate-ken-burns' : ''}`} fetchPriority="high" />
              )}
              {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
            </div>
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
            {cfg.heroScrollIndicatorEnabled && <ScrollIndicator colorClassName={cfg.heroTextTheme === 'light' ? 'text-white' : 'text-[#111111]'} />}
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
  }

  const featuredProducts = products.slice(0, 8)

  const heroSlideConfigs = tokens.heroSlides.length > 0
    ? tokens.heroSlides.map(slide => ({
        ...tokens,
        heroImageUrl: slide.imageUrl,
        heroVideoUrl: slide.videoUrl,
        heroEyebrow: slide.eyebrow,
        heroHeadline: slide.headline,
        heroSubheadline: slide.subheadline,
        heroCtaEnabled: slide.ctaEnabled,
        heroCtaText: slide.ctaText,
        heroCtaLinkType: slide.ctaLinkType,
        heroCtaCategoryId: slide.ctaCategoryId,
        heroCtaCustomUrl: slide.ctaCustomUrl,
        heroSecondaryCtaEnabled: slide.secondaryCtaEnabled,
        heroSecondaryCtaText: slide.secondaryCtaText,
        heroSecondaryCtaLinkType: slide.secondaryCtaLinkType,
        heroSecondaryCtaCategoryId: slide.secondaryCtaCategoryId,
        heroSecondaryCtaCustomUrl: slide.secondaryCtaCustomUrl,
      }))
    : [tokens]

  const heroSection = (
    <div key="hero">
      <HeroCarousel slides={heroSlideConfigs.map(buildHero)} />
    </div>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-t border-black/10" style={getSectionBackgroundStyle(tokens, 'categories')}>
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
    <section key="products" style={getSectionBackgroundStyle(tokens, 'products')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-black/10">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-serif italic text-3xl text-[#111111]">{t.home.allProductsHeading}</h2>
          <Link href={`/products`} className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4">
            {t.home.viewAll}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#767676] text-sm py-20 text-center">{t.home.noProductsYet}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                slug={slug}
                product={product}
                categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                tokens={tokens}
                t={t}
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

  const collectionsSection = landingCollections.length > 0 && (
    <section key="collections" className="border-t border-black/10" style={getSectionBackgroundStyle(tokens, 'collections')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-16">
        {landingCollections.map(collection => (
          <ProductScrollRow
            key={collection.id}
            title={tokens.landingCollectionTitleOverrides[collection.id] || collection.name}
            viewAllHref={`/products/collection/${collection.slug}`}
            items={(collectionProducts.get(collection.id) ?? []).map(product => ({
              key: product.id,
              node: (
                <div className="w-48 sm:w-56">
                  <ProductCard
                    slug={slug}
                    product={product}
                    categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                    tokens={tokens}
                    t={t}
                  />
                </div>
              ),
            }))}
            titleClassName="font-serif italic text-3xl text-[#111111]"
            viewAllClassName="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4"
            emptyMessageClassName="text-[#767676] text-sm py-16 text-center"
          />
        ))}
      </div>
    </section>
  )

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-t border-black/10" style={getSectionBackgroundStyle(tokens, 'content')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <ContentBlock
          tokens={tokens}
          headingClassName="font-serif italic text-2xl sm:text-3xl text-[#111111] mb-5"
          bodyClassName="text-[#767676] text-sm sm:text-base leading-relaxed mb-8"
          buttonClassName="inline-flex items-center gap-2 border-2 border-black text-[#111111] text-xs uppercase tracking-widest font-medium px-8 py-3.5 hover:bg-black hover:text-white transition-colors"
        />
      </div>
    </section>
  )

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-t border-black/10" style={getSectionBackgroundStyle(tokens, 'faq')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <FaqAccordion
          tokens={tokens}
          t={t}
          headingClassName="font-serif italic text-2xl sm:text-3xl text-[#111111] mb-6"
          questionClassName="text-sm text-[#111111]"
          answerClassName="text-sm text-[#767676] leading-relaxed"
          borderClassName="divide-black/10"
        />
      </div>
    </section>
  )

  const sections: Record<HomeSectionKey, React.ReactNode> = {
    hero: heroSection,
    categories: categoriesSection,
    products: productsSection,
    collections: collectionsSection,
    faq: faqSection,
    content: contentSection,
  }

  return (
    <div className="bg-white min-h-screen">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
