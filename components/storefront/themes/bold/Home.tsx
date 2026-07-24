import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { ProductScrollRow } from '@/components/storefront/shared/ProductScrollRow'
import { HeroCarousel } from '@/components/storefront/shared/HeroCarousel'
import { getBannerBackgroundStyle, getHeroBackgroundImageClass, getHeroCtaHref, getHeroCtaLabel, getHeroImageClass, getHeroOverlayStyle, getHeroTextAlignClass, getHeroTextColorClass, getHomeSectionOrder, glowShadow, hasBanner, hasContentBlock, HERO_EYEBROW_SIZE_CLASS, HERO_HEADLINE_SIZE_CLASS, HERO_HEIGHT_CLASS, HERO_SUBHEADLINE_SIZE_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS, shadeColor } from '@/lib/store/theme-config'
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
  const gradient = `linear-gradient(135deg, ${tokens.accentColor}, ${shadeColor(tokens.accentColor, -30)})`

  function buildHero(t: Required<ThemeConfig>) {
    const gradient = `linear-gradient(135deg, ${t.accentColor}, ${shadeColor(t.accentColor, -30)})`
    const isSplitHero = (t.heroLayout === 'imageLeft' || t.heroLayout === 'imageRight') && !!t.heroImageUrl
    const isBackgroundHero = t.heroLayout === 'background' && !!t.heroImageUrl
    const heightClass = HERO_HEIGHT_CLASS[t.heroHeight]
    const bannerActive = hasBanner(t)
    const bannerStyle = getBannerBackgroundStyle(t)
    const sectionBanner = bannerActive && !isBackgroundHero && (!isSplitHero || t.bannerPlacement === 'section')
    const imageBanner = bannerActive && isSplitHero && t.bannerPlacement === 'behindImage'
    const showCenterOverlay = !sectionBanner || t.bannerType === 'image'
    const overlayStyle = getHeroOverlayStyle(t)
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
          <p className={`${HERO_EYEBROW_SIZE_CLASS[t.heroEyebrowSize]} font-bold uppercase tracking-[0.3em] ${getHeroTextColorClass(t, 'eyebrow', 'text-white/70')} mb-4`}>{t.heroEyebrow}</p>
        )}
        <h1 className={`font-black tracking-tight mb-6 leading-none ${getHeroTextColorClass(t, 'headline', 'text-white')} ${HERO_HEADLINE_SIZE_CLASS[t.heroHeadlineSize]}`}>
          {t.heroHeadline || store.name}
        </h1>
        {t.heroSubheadline && (
          <p className={`${getHeroTextColorClass(t, 'subheadline', 'text-white/80')} ${HERO_SUBHEADLINE_SIZE_CLASS[t.heroSubheadlineSize]} mb-10`}>{t.heroSubheadline}</p>
        )}
        {t.heroCtaEnabled && (
          <Link
            href={getHeroCtaHref(t, categories)}
            className="inline-flex items-center gap-2 rounded-full text-white text-sm font-bold px-9 py-4 transition-transform hover:scale-105"
            style={{ background: gradient, boxShadow: glowShadow(t.accentColor, '88') }}
          >
            {getHeroCtaLabel(t, 'ყველა პროდუქტის ნახვა')}
          </Link>
        )}
      </div>
    )

    const heroImage = (
      <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
        {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-2xl" style={bannerStyle} />}
        <div
          className={`relative h-full flex items-center justify-center overflow-hidden rounded-2xl ${imageBanner || sectionBanner ? '' : 'bg-white/[0.04]'}`}
          style={{ boxShadow: glowShadow(t.accentColor) }}
        >
          <CImg src={t.heroImageUrl} cldWidth={1400} alt={t.heroHeadline || store.name} className={getHeroImageClass(t)} />
        </div>
      </div>
    )

    return (
      <section className="relative overflow-hidden border-b border-white/10">
        {isBackgroundHero ? (
          <div className={`relative flex flex-col ${pos.wrapper} ${heightClass}`}>
            <div className="absolute inset-0">
              <CImg src={t.heroImageUrl} cldWidth={1800} alt={t.heroHeadline || store.name} className={getHeroBackgroundImageClass(t)} />
              {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
            </div>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 w-full">
              {heroText}
            </div>
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
        heroEyebrow: slide.eyebrow,
        heroHeadline: slide.headline,
        heroSubheadline: slide.subheadline,
        heroCtaEnabled: slide.ctaEnabled,
        heroCtaText: slide.ctaText,
        heroCtaLinkType: slide.ctaLinkType,
        heroCtaCategoryId: slide.ctaCategoryId,
        heroCtaCustomUrl: slide.ctaCustomUrl,
      }))
    : [tokens]

  const heroSection = (
    <div key="hero">
      <HeroCarousel slides={heroSlideConfigs.map(buildHero)} />
    </div>
  )

  const categoriesSection = landingCategories.length > 0 && (
    <section key="categories" className="border-b border-white/10">
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
              <span className="text-sm font-medium text-white/80">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section key="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-black text-3xl text-white tracking-tight">ყველა პროდუქტი</h2>
          <Link
            href={`/products`}
            className="text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: tokens.accentColor }}
          >
            ყველას ნახვა →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-white/40 text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
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
    <section key="collections" className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-16">
        {landingCollections.map(collection => (
          <ProductScrollRow
            key={collection.id}
            title={tokens.landingCollectionTitleOverrides[collection.id] || collection.name}
            viewAllHref={`/products/collection/${collection.slug}`}
            items={collectionProducts.get(collection.id) ?? []}
            keyOf={product => product.id}
            titleClassName="font-black text-3xl text-white tracking-tight"
            viewAllClassName="text-sm font-semibold transition-opacity hover:opacity-80"
            viewAllStyle={{ color: tokens.accentColor }}
            emptyMessageClassName="text-white/40 text-sm py-16 text-center"
            renderItem={product => (
              <div className="w-48 sm:w-60">
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
    <section key="content" className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <ContentBlock
          tokens={tokens}
          headingClassName="font-black text-2xl sm:text-3xl text-white tracking-tight mb-4"
          bodyClassName="text-white/70 text-sm sm:text-base leading-relaxed mb-6"
          buttonClassName="inline-flex items-center gap-2 rounded-full text-white text-sm font-bold px-8 py-3.5 transition-transform hover:scale-105"
          buttonStyle={{ background: gradient, boxShadow: glowShadow(tokens.accentColor, '88') }}
        />
      </div>
    </section>
  )

  const faqSection = tokens.showFaqSection && tokens.faqItems.length > 0 && (
    <section key="faq" className="border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <FaqAccordion
          tokens={tokens}
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
      {getHomeSectionOrder(tokens).map(key => sections[key])}
    </div>
  )
}
