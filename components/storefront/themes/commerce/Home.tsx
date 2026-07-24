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
import { CImg } from '@/components/ui/CImg'

export function Home({
  slug,
  store,
  categories,
  collections,
  collectionProducts,
  products,
  tokens,
}: {
  slug: string
  store: StoreResponse
  categories: CategoryResponse[]
  collections: CollectionResponse[]
  collectionProducts: Map<string, ProductSummaryResponse[]>
  products: ProductSummaryResponse[]
  tokens: Required<ThemeConfig>
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const landingCategories = getLandingCategories(categories, tokens)
  const landingCollections = getLandingCollections(collections, tokens)
  function buildHero(t: Required<ThemeConfig>) {
    const isSplitHero = (t.heroLayout === 'imageLeft' || t.heroLayout === 'imageRight') && !!t.heroImageUrl
    const isBackgroundHero = t.heroLayout === 'background' && !!t.heroImageUrl
    const heightClass = HERO_HEIGHT_CLASS[t.heroHeight]
    const bannerActive = hasBanner(t)
    const bannerStyle = getBannerBackgroundStyle(t)
    const sectionBanner = bannerActive && !isBackgroundHero && (!isSplitHero || t.bannerPlacement === 'section')
    const imageBanner = bannerActive && isSplitHero && t.bannerPlacement === 'behindImage'
    const overlayStyle = getHeroOverlayStyle(t)
    const sectionStyle = sectionBanner
      ? t.bannerType === 'image'
        ? {
            backgroundImage: `linear-gradient(rgba(255,255,255,0.75),rgba(255,255,255,0.9)), url(${t.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : bannerStyle
      : {}
    const pos = HERO_TEXT_POSITION_CLASS[t.heroTextPosition]
    const desktopImageFirst = t.heroLayout === 'imageLeft'
    const mobileImageFirst = t.heroMobileImagePosition === 'inherit'
      ? desktopImageFirst
      : t.heroMobileImagePosition === 'top'
    const imageOrderClass = `${mobileImageFirst ? 'order-1' : 'order-2'} ${desktopImageFirst ? 'md:order-1' : 'md:order-2'}`
    const textOrderClass = `${mobileImageFirst ? 'order-2' : 'order-1'} ${desktopImageFirst ? 'md:order-2' : 'md:order-1'}`
    const heroImageHiddenMobile = t.heroMobileImage === 'hide'
    const textAlignClass = getHeroTextAlignClass(t)

    const heroText = (
      <div className={`w-full max-w-xl ${textAlignClass}`}>
        {t.heroEyebrow && (
          <p className={`flex items-center gap-2 ${HERO_EYEBROW_SIZE_CLASS[t.heroEyebrowSize]} font-semibold uppercase tracking-widest ${getHeroTextColorClass(t, 'eyebrow', 'text-slate-500')} mb-3`}>
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: t.accentColor }} aria-hidden />
            {t.heroEyebrow}
          </p>
        )}
        <h1 className={`font-black tracking-tight mb-5 ${getHeroTextColorClass(t, 'headline', 'text-slate-900')} ${HERO_HEADLINE_SIZE_CLASS[t.heroHeadlineSize]}`}>
          {t.heroHeadline || store.name}
        </h1>
        {t.heroSubheadline && (
          <p className={`${getHeroTextColorClass(t, 'subheadline', 'text-slate-500')} ${HERO_SUBHEADLINE_SIZE_CLASS[t.heroSubheadlineSize]} mb-8`}>{t.heroSubheadline}</p>
        )}
        {(t.heroCtaEnabled || t.heroSecondaryCtaEnabled) && (
          <div className={`flex flex-wrap items-center gap-3 ${getHeroButtonRowClass(t)}`}>
            {t.heroCtaEnabled && (
              <Link
                href={getHeroCtaHref(t, categories)}
                className="inline-flex items-center gap-2 rounded-md text-white text-sm font-semibold px-7 py-3 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: t.accentColor }}
              >
                {getHeroCtaLabel(t, 'ყველა პროდუქტის ნახვა')}
              </Link>
            )}
            {t.heroSecondaryCtaEnabled && (
              <Link
                href={getHeroSecondaryCtaHref(t, categories)}
                className="inline-flex items-center gap-2 rounded-md border text-sm font-semibold px-7 py-3 transition-colors"
                style={{ borderColor: t.accentColor, color: t.accentColor }}
              >
                {getHeroSecondaryCtaLabel(t, 'მეტის ნახვა')}
              </Link>
            )}
          </div>
        )}
      </div>
    )

    const heroImage = (
      <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
        {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-md" style={bannerStyle} />}
        <div className={`relative h-full flex items-center justify-center overflow-hidden rounded-md ${imageBanner || sectionBanner ? '' : 'bg-white border border-slate-200'}`}>
          <CImg src={t.heroImageUrl} cldWidth={1400} alt={t.heroHeadline || store.name} className={getHeroImageClass(t)} />
        </div>
      </div>
    )

    return (
      <section className="bg-white relative overflow-hidden" style={sectionStyle}>
        {isBackgroundHero ? (
          <div className={`relative flex flex-col ${pos.wrapper} ${heightClass}`}>
            <div className="absolute inset-0">
              {hasHeroVideo(t) ? (
                <>
                  <video
                    key={t.heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={t.heroImageUrl}
                    className={`${getHeroBackgroundImageClass(t)} ${t.heroVideoMobileEnabled ? '' : 'hidden md:block'}`}
                  >
                    <source src={t.heroVideoUrl} />
                  </video>
                  {!t.heroVideoMobileEnabled && (
                    <CImg src={t.heroImageUrl} cldWidth={1800} alt={t.heroHeadline || store.name} className={`${getHeroBackgroundImageClass(t)} md:hidden`} />
                  )}
                </>
              ) : (
                <CImg src={t.heroImageUrl} cldWidth={1800} alt={t.heroHeadline || store.name} className={`${getHeroBackgroundImageClass(t)} ${t.heroKenBurnsEnabled ? 'animate-ken-burns' : ''}`} />
              )}
              {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
            </div>
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
            {t.heroScrollIndicatorEnabled && <ScrollIndicator colorClassName={t.heroTextTheme === 'dark' ? 'text-slate-900' : 'text-white'} />}
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
      }))
    : [tokens]

  const heroSection = (
    <div key="hero">
      <HeroCarousel slides={heroSlideConfigs.map(buildHero)} />
    </div>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-t border-slate-200" style={getSectionBackgroundStyle(tokens, 'categories')}>
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
    <section key="products" style={getSectionBackgroundStyle(tokens, 'products')}>
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

  const collectionsSection = landingCollections.length > 0 && (
    <section key="collections" className="border-t border-slate-200" style={getSectionBackgroundStyle(tokens, 'collections')}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 flex flex-col gap-14">
        {landingCollections.map(collection => (
          <ProductScrollRow
            key={collection.id}
            title={tokens.landingCollectionTitleOverrides[collection.id] || collection.name}
            viewAllHref={`/products/collection/${collection.slug}`}
            items={collectionProducts.get(collection.id) ?? []}
            keyOf={product => product.id}
            titleClassName="flex items-center gap-2 font-bold text-2xl text-slate-900"
            viewAllClassName="text-sm font-semibold hover:underline"
            viewAllStyle={{ color: tokens.accentColor }}
            emptyMessageClassName="text-slate-400 text-sm py-16 text-center"
            renderItem={product => (
              <div className="w-44 sm:w-52">
                <ProductCard
                  slug={slug}
                  product={product}
                  categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                  tokens={tokens}
                />
              </div>
            )}
          />
        ))}
      </div>
    </section>
  )

  const contentSection = hasContentBlock(tokens) && (
    <section key="content" className="border-t border-slate-200" style={getSectionBackgroundStyle(tokens, 'content')}>
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

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-t border-slate-200" style={getSectionBackgroundStyle(tokens, 'faq')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <FaqAccordion
          tokens={tokens}
          headingClassName="font-bold text-2xl sm:text-3xl text-slate-900 mb-6"
          questionClassName="font-semibold text-sm text-slate-900"
          answerClassName="text-sm text-slate-500 leading-relaxed"
          borderClassName="divide-slate-200"
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
