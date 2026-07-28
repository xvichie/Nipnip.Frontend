import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { ProductScrollRow } from '@/components/storefront/shared/ProductScrollRow'
import { HeroCarousel } from '@/components/storefront/shared/HeroCarousel'
import { getBannerBackgroundStyle, getHeroBackgroundImageClass, getHeroButtonRowClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroSecondaryCtaHref, getHeroSecondaryCtaLabel, getHeroSlideTranslations, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, getSectionBackgroundStyle, hasBanner, hasContentBlock, hasHeroVideo, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { ScrollIndicator } from '@/components/storefront/shared/ScrollIndicator'
import { getLandingCategories } from '@/lib/store/landing-categories'
import { getLandingCollections } from '@/lib/store/landing-collections'
import { ContentBlock } from '@/components/storefront/shared/ContentBlock'
import { FaqAccordion } from '@/components/storefront/shared/FaqAccordion'
import { getCategoryName, getCollectionName, getCollectionTitleOverride, getThemeText } from '@/lib/store/translations'
import type { CategoryResponse, CollectionResponse, HomeSectionKey, ProductSummaryResponse, StoreResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'
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
  lang,
}: {
  slug: string
  store: StoreResponse
  categories: CategoryResponse[]
  collections: CollectionResponse[]
  collectionProducts: Map<string, ProductSummaryResponse[]>
  products: ProductSummaryResponse[]
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const categoryNames = new Map(categories.map(c => [c.id, getCategoryName(c, lang)]))
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
    const pos = HERO_TEXT_POSITION_CLASS[cfg.heroTextPosition]
    const desktopImageFirst = cfg.heroLayout === 'imageLeft'
    const mobileImageFirst = cfg.heroMobileImagePosition === 'inherit'
      ? desktopImageFirst
      : cfg.heroMobileImagePosition === 'top'
    const imageOrderClass = `${mobileImageFirst ? 'order-1' : 'order-2'} ${desktopImageFirst ? 'md:order-1' : 'md:order-2'}`
    const textOrderClass = `${mobileImageFirst ? 'order-2' : 'order-1'} ${desktopImageFirst ? 'md:order-2' : 'md:order-1'}`
    const heroImageHiddenMobile = cfg.heroMobileImage === 'hide'
    const textAlignClass = getHeroTextAlignClass(cfg)
    const heroEyebrow = getThemeText(cfg, 'heroEyebrow', lang)
    const heroHeadline = getThemeText(cfg, 'heroHeadline', lang)
    const heroSubheadline = getThemeText(cfg, 'heroSubheadline', lang)

    const heroText = (
      <div className={`w-full max-w-xl ${textAlignClass}`}>
        {heroEyebrow && (
          <p className={`${HERO_EYEBROW_SIZE_CLASS[cfg.heroEyebrowSize]} font-semibold uppercase tracking-[0.28em] ${getHeroTextColorClass(cfg, 'eyebrow', 'text-[#999]')} mb-4`}>{heroEyebrow}</p>
        )}
        <h1 className={`font-black tracking-tight mb-4 ${getHeroTextColorClass(cfg, 'headline', 'text-[#111]')} ${HERO_HEADLINE_SIZE_CLASS[cfg.heroHeadlineSize]}`}>
          {heroHeadline || store.name}
        </h1>
        {heroSubheadline && (
          <p className={`${getHeroTextColorClass(cfg, 'subheadline', 'text-[#666]')} ${HERO_SUBHEADLINE_SIZE_CLASS[cfg.heroSubheadlineSize]} mb-6`}>{heroSubheadline}</p>
        )}
        {(cfg.heroCtaEnabled || cfg.heroSecondaryCtaEnabled) && (
          <div className={`flex flex-wrap items-center gap-3 ${getHeroButtonRowClass(cfg)}`}>
            {cfg.heroCtaEnabled && (
              <Link
                href={getHeroCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 text-white text-xs font-bold px-7 py-3.5 transition-opacity hover:opacity-90 uppercase tracking-widest"
                style={{ backgroundColor: cfg.accentColor }}
              >
                {getHeroCtaLabel(cfg, t.home.heroPrimaryCta, lang)}
              </Link>
            )}
            {cfg.heroSecondaryCtaEnabled && (
              <Link
                href={getHeroSecondaryCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 border text-xs font-bold px-7 py-3.5 transition-colors uppercase tracking-widest"
                style={{ borderColor: cfg.accentColor, color: cfg.accentColor }}
              >
                {getHeroSecondaryCtaLabel(cfg, t.home.heroSecondaryCta, lang)}
              </Link>
            )}
          </div>
        )}
      </div>
    )

    const heroImage = (
      <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
        {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
        <div className={`relative h-full flex items-center justify-center overflow-hidden ${imageBanner || sectionBanner ? '' : 'bg-[#f7f7f7]'}`}>
          <CImg src={cfg.heroImageUrl} cldWidth={1400} alt={heroHeadline || store.name} className={getHeroImageClass(cfg)} fetchPriority="high" />
        </div>
      </div>
    )

    return (
      <section
        className="border-b border-[#e5e5e5] relative overflow-hidden"
        style={sectionBanner ? bannerStyle : {}}
      >
        {sectionBanner && cfg.bannerType === 'image' && <div className="absolute inset-0 bg-white/80" />}

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
                    <CImg src={cfg.heroImageUrl} cldWidth={1800} alt={heroHeadline || store.name} className={`${getHeroBackgroundImageClass(cfg)} md:hidden`} fetchPriority="high" />
                  )}
                </>
              ) : (
                <CImg src={cfg.heroImageUrl} cldWidth={1800} alt={heroHeadline || store.name} className={`${getHeroBackgroundImageClass(cfg)} ${cfg.heroKenBurnsEnabled ? 'animate-ken-burns' : ''}`} fetchPriority="high" />
              )}
              {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
            {cfg.heroScrollIndicatorEnabled && <ScrollIndicator colorClassName={cfg.heroTextTheme === 'dark' ? 'text-[#111]' : 'text-white'} />}
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
  }

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
        translations: getHeroSlideTranslations(tokens, slide),
      }))
    : [tokens]

  const heroSection = (
    <div key="hero">
      <HeroCarousel slides={heroSlideConfigs.map(buildHero)} />
    </div>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-b border-[#e5e5e5]" style={getSectionBackgroundStyle(tokens, 'categories')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2 border border-[#e5e5e5] rounded-lg px-4 py-5 text-center hover:border-[#111] transition-colors"
            >
              <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-6 h-6 text-[#111]" />
              <span className="text-sm text-[#555]">{getCategoryName(category, lang)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products" style={getSectionBackgroundStyle(tokens, 'products')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-black text-2xl text-[#111] tracking-tight">{t.home.allProductsHeading}</h2>
          <Link
            href={`/products`}
            className="text-xs font-medium text-[#555] hover:text-[#111] transition-colors underline underline-offset-4"
          >
            {t.home.viewAll}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#999] text-sm py-20 text-center">{t.home.noProductsYet}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map(product => (
              <ProductCard
                key={product.id}
                slug={slug}
                product={product}
                categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                tokens={tokens}
                t={t}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )

  const collectionsSection = landingCollections.length > 0 && (
    <section key="collections" className="border-b border-[#e5e5e5]" style={getSectionBackgroundStyle(tokens, 'collections')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-col gap-14">
        {landingCollections.map(collection => (
          <ProductScrollRow
            key={collection.id}
            title={getCollectionTitleOverride(tokens.landingCollectionTitleOverrides[collection.id], getCollectionName(collection, lang), lang)}
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
                    lang={lang}
                  />
                </div>
              ),
            }))}
            titleClassName="font-black text-2xl text-[#111] tracking-tight"
            viewAllClassName="text-xs font-medium text-[#555] hover:text-[#111] transition-colors underline underline-offset-4"
            emptyMessageClassName="text-[#999] text-sm py-10 text-center"
          />
        ))}
      </div>
    </section>
  )

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-b border-[#e5e5e5]" style={getSectionBackgroundStyle(tokens, 'content')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <ContentBlock
          tokens={tokens}
          lang={lang}
          headingClassName="font-black text-2xl sm:text-3xl text-[#111] tracking-tight mb-4"
          bodyClassName="text-[#666] text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 text-white text-xs font-bold px-6 py-3 uppercase tracking-widest hover:opacity-90 transition-opacity"
          buttonStyle={{ backgroundColor: tokens.accentColor }}
        />
      </div>
    </section>
  )

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-b border-[#e5e5e5]" style={getSectionBackgroundStyle(tokens, 'faq')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <FaqAccordion
          tokens={tokens}
          t={t}
          lang={lang}
          headingClassName="font-black text-2xl sm:text-3xl text-[#111] tracking-tight mb-6"
          questionClassName="font-semibold text-sm text-[#111]"
          answerClassName="text-sm text-[#666] leading-relaxed"
          borderClassName="divide-[#e5e5e5]"
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
    <div className="bg-white">
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
