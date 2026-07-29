import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { ProductScrollRow } from '@/components/storefront/shared/ProductScrollRow'
import { HeroCarousel } from '@/components/storefront/shared/HeroCarousel'
import { ScrollIndicator } from '@/components/storefront/shared/ScrollIndicator'
import { getBannerBackgroundStyle, getButtonHoverColor, getCustomSectionId, getHeroBackgroundImageClass, getHeroButtonRowClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroSecondaryCtaHref, getHeroSecondaryCtaLabel, getHeroSlideTranslations, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, getSectionBackgroundStyle, hasBanner, hasContentBlock, hasHeroVideo, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { getLandingCategories } from '@/lib/store/landing-categories'
import { getLandingCollections } from '@/lib/store/landing-collections'
import { ContentBlock } from '@/components/storefront/shared/ContentBlock'
import { FaqAccordion } from '@/components/storefront/shared/FaqAccordion'
import { CustomSectionBlock } from '@/components/storefront/shared/CustomSectionBlock'
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
    const sectionStyle = sectionBanner
      ? cfg.bannerType === 'image'
        ? {
            backgroundImage: `linear-gradient(rgba(28,28,28,0.75),rgba(28,28,28,0.92)), url(${cfg.bannerUrl})`,
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
    const heroEyebrow = getThemeText(cfg, 'heroEyebrow', lang)
    const heroHeadline = getThemeText(cfg, 'heroHeadline', lang)
    const heroSubheadline = getThemeText(cfg, 'heroSubheadline', lang)

    const heroText = (
      <div className={`w-full max-w-xl ${textAlignClass}`}>
        {heroEyebrow && (
          <p className={`flex items-center gap-2 ${HERO_EYEBROW_SIZE_CLASS[cfg.heroEyebrowSize]} font-semibold uppercase tracking-widest ${getHeroTextColorClass(cfg, 'eyebrow', 'text-[#8a8a86]')} mb-3`}>
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: cfg.accentColor }} aria-hidden />
            {heroEyebrow}
          </p>
        )}
        <h1 className={`font-black tracking-tight mb-5 ${getHeroTextColorClass(cfg, 'headline', 'text-[#f2f2f0]')} ${HERO_HEADLINE_SIZE_CLASS[cfg.heroHeadlineSize]}`}>
          {heroHeadline || store.name}
        </h1>
        {heroSubheadline && (
          <p className={`${getHeroTextColorClass(cfg, 'subheadline', 'text-[#b5b5b0]')} ${HERO_SUBHEADLINE_SIZE_CLASS[cfg.heroSubheadlineSize]} mb-8`}>{heroSubheadline}</p>
        )}
        {(cfg.heroCtaEnabled || cfg.heroSecondaryCtaEnabled) && (
          <div className={`flex flex-wrap items-center gap-3 ${getHeroButtonRowClass(cfg)}`}>
            {cfg.heroCtaEnabled && (
              <Link
                href={getHeroCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 theme-cta-btn"
                style={{ backgroundColor: cfg.accentColor, color: cfg.buttonTextColor, '--btn-hover-bg': getButtonHoverColor(cfg) } as React.CSSProperties}
              >
                {getHeroCtaLabel(cfg, t.home.heroPrimaryCta, lang)}
              </Link>
            )}
            {cfg.heroSecondaryCtaEnabled && (
              <Link
                href={getHeroSecondaryCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 border text-sm font-semibold px-7 py-3 theme-cta-btn"
                style={{ borderColor: cfg.secondaryColor, color: cfg.secondaryColor, '--btn-hover-bg': getButtonHoverColor(cfg, cfg.secondaryColor), '--btn-hover-fg': cfg.buttonTextColor } as React.CSSProperties}
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
        <div className={`relative h-full flex items-center justify-center overflow-hidden ${imageBanner || sectionBanner ? '' : 'bg-[#242422] border border-[#3a3a38]'}`}>
          <CImg src={cfg.heroImageUrl} cldWidth={1400} alt={heroHeadline || store.name} className={getHeroImageClass(cfg)} fetchPriority="high" />
        </div>
      </div>
    )

    return (
      <section className="bg-[#1c1c1c] relative overflow-hidden" style={sectionStyle}>
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
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
            {cfg.heroScrollIndicatorEnabled && <ScrollIndicator colorClassName={cfg.heroTextTheme === 'dark' ? 'text-[#f2f2f0]' : 'text-white'} />}
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
    <section key="categories" className="border-t border-[#3a3a38]" style={getSectionBackgroundStyle(tokens, 'categories')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2.5 border border-[#3a3a38] bg-[#242422] hover:border-[#54544e] transition-colors px-4 py-7 text-center uppercase text-xs font-semibold tracking-wide text-[#b5b5b0]"
            >
              <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5" style={{ color: tokens.accentColor }} />
              {getCategoryName(category, lang)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products" style={getSectionBackgroundStyle(tokens, 'products')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="flex items-center gap-2 font-bold text-2xl text-[#f2f2f0]">
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
            {t.home.allProductsHeading}
          </h2>
          <Link href={`/products`} className="text-sm font-semibold hover:underline" style={{ color: tokens.accentColor }}>
            {t.home.viewAll}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#6f6f6b] text-sm py-20 text-center">{t.home.noProductsYet}</p>
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
    <section key="collections" className="border-t border-[#3a3a38]" style={getSectionBackgroundStyle(tokens, 'collections')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-16">
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
            titleClassName="font-bold text-2xl text-[#f2f2f0]"
            viewAllClassName="text-sm font-semibold hover:underline"
            viewAllStyle={{ color: tokens.accentColor }}
            emptyMessageClassName="text-[#6f6f6b] text-sm py-16 text-center"
          />
        ))}
      </div>
    </section>
  )

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-t border-[#3a3a38]" style={getSectionBackgroundStyle(tokens, 'content')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <ContentBlock
          tokens={tokens}
          lang={lang}
          headingClassName="font-bold text-2xl sm:text-3xl text-[#f2f2f0] mb-4"
          bodyClassName="text-[#b5b5b0] text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
          buttonStyle={{ backgroundColor: tokens.accentColor }}
        />
      </div>
    </section>
  )

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-t border-[#3a3a38]" style={getSectionBackgroundStyle(tokens, 'faq')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <FaqAccordion
          tokens={tokens}
          t={t}
          lang={lang}
          headingClassName="font-bold text-2xl sm:text-3xl text-[#f2f2f0] mb-6"
          questionClassName="font-semibold text-sm text-[#f2f2f0]"
          answerClassName="text-sm text-[#b5b5b0] leading-relaxed"
          borderClassName="divide-[#3a3a38]"
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
    <div className="bg-[#1c1c1c] min-h-screen">
      {getHomeSectionOrder(tokens).map(key => {
        const customId = getCustomSectionId(key)
        if (!customId) return sections[key as HomeSectionKey]
        const section = tokens.customSections.find(s => s.id === customId)
        if (!section) return null
        return (
          <section key={key} className="border-t border-[#3a3a38]" style={{ backgroundColor: section.backgroundColor || undefined }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
              <CustomSectionBlock
                section={section}
                lang={lang}
                headingClassName="font-bold text-2xl sm:text-3xl text-[#f2f2f0] mb-4"
                bodyClassName="text-[#b5b5b0] text-sm sm:text-base leading-relaxed mb-6"
                buttonClassName="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
                buttonStyle={{ backgroundColor: tokens.accentColor }}
              />
            </div>
          </section>
        )
      })}
    </div>
  )
}
