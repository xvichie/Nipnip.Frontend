import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { ProductScrollRow } from '@/components/storefront/shared/ProductScrollRow'
import { HeroCarousel } from '@/components/storefront/shared/HeroCarousel'
import { getBannerBackgroundStyle, getCustomSectionId, getHeroBackgroundImageClass, getHeroButtonRowClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroSecondaryCtaHref, getHeroSecondaryCtaLabel, getHeroSlideTranslations, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, getSectionBackgroundStyle, glowShadow, hasBanner, hasContentBlock, hasHeroVideo, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS, shadeColor } from '@/lib/store/theme-config'
import { ScrollIndicator } from '@/components/storefront/shared/ScrollIndicator'
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
  const gradient = `linear-gradient(135deg, ${tokens.accentColor}, ${shadeColor(tokens.accentColor, -30)})`

  function buildHero(cfg: Required<ThemeConfig>) {
    const gradient = `linear-gradient(135deg, ${cfg.accentColor}, ${shadeColor(cfg.accentColor, -30)})`
    const isSplitHero = (cfg.heroLayout === 'imageLeft' || cfg.heroLayout === 'imageRight') && !!cfg.heroImageUrl
    const isBackgroundHero = cfg.heroLayout === 'background' && !!cfg.heroImageUrl
    const heightClass = HERO_HEIGHT_CLASS[cfg.heroHeight]
    const bannerActive = hasBanner(cfg)
    const bannerStyle = getBannerBackgroundStyle(cfg)
    const sectionBanner = bannerActive && !isBackgroundHero && (!isSplitHero || cfg.bannerPlacement === 'section')
    const imageBanner = bannerActive && isSplitHero && cfg.bannerPlacement === 'behindImage'
    const showCenterOverlay = !sectionBanner || cfg.bannerType === 'image'
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
          <p className={`${HERO_EYEBROW_SIZE_CLASS[cfg.heroEyebrowSize]} font-bold uppercase tracking-[0.3em] ${getHeroTextColorClass(cfg, 'eyebrow', 'text-white/70')} mb-4`}>{heroEyebrow}</p>
        )}
        <h1 className={`font-black tracking-tight mb-6 leading-none ${getHeroTextColorClass(cfg, 'headline', 'text-white')} ${HERO_HEADLINE_SIZE_CLASS[cfg.heroHeadlineSize]}`}>
          {heroHeadline || store.name}
        </h1>
        {heroSubheadline && (
          <p className={`${getHeroTextColorClass(cfg, 'subheadline', 'text-white/80')} ${HERO_SUBHEADLINE_SIZE_CLASS[cfg.heroSubheadlineSize]} mb-10`}>{heroSubheadline}</p>
        )}
        {(cfg.heroCtaEnabled || cfg.heroSecondaryCtaEnabled) && (
          <div className={`flex flex-wrap items-center gap-3 ${getHeroButtonRowClass(cfg)}`}>
            {cfg.heroCtaEnabled && (
              <Link
                href={getHeroCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 rounded-full text-sm font-bold px-9 py-4 theme-cta-btn"
                style={{ background: gradient, color: cfg.buttonTextColor, boxShadow: glowShadow(cfg.accentColor, '88') } as React.CSSProperties}
              >
                {getHeroCtaLabel(cfg, t.home.heroPrimaryCta, lang)}
              </Link>
            )}
            {cfg.heroSecondaryCtaEnabled && (
              <Link
                href={getHeroSecondaryCtaHref(cfg, categories)}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white text-sm font-bold px-9 py-4 transition-colors hover:bg-white/10"
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
        {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-2xl" style={bannerStyle} />}
        <div
          className={`relative h-full flex items-center justify-center overflow-hidden rounded-2xl ${imageBanner || sectionBanner ? '' : 'bg-white/[0.04]'}`}
          style={{ boxShadow: glowShadow(cfg.accentColor) }}
        >
          <CImg src={cfg.heroImageUrl} cldWidth={1400} alt={heroHeadline || store.name} className={getHeroImageClass(cfg)} fetchPriority="high" />
        </div>
      </div>
    )

    return (
      <section className="relative overflow-hidden border-b border-white/10">
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
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
            {cfg.heroScrollIndicatorEnabled && <ScrollIndicator />}
          </div>
        ) : isSplitHero ? (
          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 ${heightClass}`}>
            {heroImage}
            <div className={`h-full flex flex-col ${pos.wrapper} ${textOrderClass}`}>{heroText}</div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0" style={sectionBanner ? bannerStyle : { background: gradient }} />
            {showCenterOverlay && <div className="absolute inset-0 bg-[#0a0a0a]/60" />}
            <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col ${pos.wrapper} ${heightClass}`}>
              {heroText}
            </div>
          </>
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
    <section key="categories" className="border-b border-white/10" style={getSectionBackgroundStyle(tokens, 'categories')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
          {landingCategories.map(category => (
            <Link
              key={category.id}
              href={`/products/category/${category.slug}`}
              className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 text-center hover:border-white/25 transition-colors"
            >
              {(category.iconUrl || category.iconKey || category.iconEmoji) && (
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: gradient }}>
                  <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5" />
                </span>
              )}
              <span className="text-sm font-medium text-white/80">{getCategoryName(category, lang)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products" style={getSectionBackgroundStyle(tokens, 'products')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-black text-3xl text-white tracking-tight">{t.home.allProductsHeading}</h2>
          <Link
            href={`/products`}
            className="text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: tokens.accentColor }}
          >
            {t.home.viewAll}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-white/40 text-sm py-20 text-center">{t.home.noProductsYet}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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

  const collectionsSection = landingCollections.length > 0 && (
    <section key="collections" className="border-b border-white/10" style={getSectionBackgroundStyle(tokens, 'collections')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-16">
        {landingCollections.map(collection => (
          <ProductScrollRow
            key={collection.id}
            title={getCollectionTitleOverride(tokens.landingCollectionTitleOverrides[collection.id], getCollectionName(collection, lang), lang)}
            viewAllHref={`/products/collection/${collection.slug}`}
            items={(collectionProducts.get(collection.id) ?? []).map(product => ({
              key: product.id,
              node: (
                <div className="w-48 sm:w-60">
                  <ProductCard
                    slug={slug}
                    product={product}
                    categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                    tokens={tokens}
                  />
                </div>
              ),
            }))}
            titleClassName="font-black text-3xl text-white tracking-tight"
            viewAllClassName="text-sm font-semibold transition-opacity hover:opacity-80"
            viewAllStyle={{ color: tokens.accentColor }}
            emptyMessageClassName="text-white/40 text-sm py-16 text-center"
          />
        ))}
      </div>
    </section>
  )

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-b border-white/10" style={getSectionBackgroundStyle(tokens, 'content')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <ContentBlock
          tokens={tokens}
          lang={lang}
          headingClassName="font-black text-2xl sm:text-3xl text-white tracking-tight mb-4"
          bodyClassName="text-white/70 text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 rounded-full text-white text-sm font-bold px-8 py-3.5 transition-transform hover:scale-105"
          buttonStyle={{ background: gradient, boxShadow: glowShadow(tokens.accentColor, '88') }}
        />
      </div>
    </section>
  )

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-b border-white/10" style={getSectionBackgroundStyle(tokens, 'faq')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <FaqAccordion
          tokens={tokens}
          t={t}
          lang={lang}
          headingClassName="font-black text-2xl sm:text-3xl text-white tracking-tight mb-6"
          questionClassName="font-semibold text-sm text-white"
          answerClassName="text-sm text-white/70 leading-relaxed"
          borderClassName="divide-white/10"
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
    <div className="bg-[#0a0a0a]">
      {getHomeSectionOrder(tokens).map(key => {
        const customId = getCustomSectionId(key)
        if (!customId) return sections[key as HomeSectionKey]
        const section = tokens.customSections.find(s => s.id === customId)
        if (!section) return null
        return (
          <section key={key} className="border-b border-white/10" style={{ backgroundColor: section.backgroundColor || undefined }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
              <CustomSectionBlock
                section={section}
                lang={lang}
                headingClassName="font-black text-2xl sm:text-3xl text-white tracking-tight mb-4"
                bodyClassName="text-white/70 text-sm sm:text-base leading-relaxed mb-6"
                buttonClassName="inline-flex items-center gap-2 rounded-full text-white text-sm font-bold px-8 py-3.5 transition-transform hover:scale-105"
                buttonStyle={{ background: gradient, boxShadow: glowShadow(tokens.accentColor, '88') }}
              />
            </div>
          </section>
        )
      })}
    </div>
  )
}
