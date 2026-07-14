import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { CategoryIcon } from '@/components/storefront/shared/CategoryIcon'
import { getBannerBackgroundStyle, getHeroTextAlignClass, hasBanner, HERO_HEIGHT_CLASS, HERO_TEXT_POSITION_CLASS, LANDING_CATEGORY_GRID_CLASS } from '@/lib/store/theme-config'
import { getLandingCategories } from '@/lib/store/landing-categories'
import type { CategoryResponse, ProductSummaryResponse, StoreResponse, ThemeConfig } from '@/lib/types/storefront'

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
  const isSplitHero = tokens.heroLayout !== 'center' && !!tokens.heroImageUrl
  const heightClass = HERO_HEIGHT_CLASS[tokens.heroHeight]
  const bannerActive = hasBanner(tokens)
  const bannerStyle = getBannerBackgroundStyle(tokens)
  const sectionBanner = bannerActive && (!isSplitHero || tokens.bannerPlacement === 'section')
  const imageBanner = bannerActive && isSplitHero && tokens.bannerPlacement === 'behindImage'
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#999] mb-4">{tokens.heroEyebrow}</p>
      )}
      <h1 className={`font-black text-[#111] tracking-tight mb-4 ${isSplitHero ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-6xl'}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className="text-[#666] text-sm mb-6">{tokens.heroSubheadline}</p>
      )}
      <Link
        href={`/products`}
        className="inline-flex items-center gap-2 text-white text-xs font-bold px-7 py-3.5 transition-opacity hover:opacity-90 uppercase tracking-widest"
        style={{ backgroundColor: tokens.accentColor }}
      >
        ყველა პროდუქტის ნახვა
      </Link>
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6" style={bannerStyle} />}
      <div className={`relative h-full flex items-center justify-center overflow-hidden ${imageBanner || sectionBanner ? '' : 'bg-[#f7f7f7]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tokens.heroImageUrl} alt={tokens.heroHeadline || store.name} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  )

  return (
    <div className="bg-white">

      <section
        className="border-b border-[#e5e5e5] relative overflow-hidden"
        style={sectionBanner ? bannerStyle : {}}
      >
        {sectionBanner && tokens.bannerType === 'image' && <div className="absolute inset-0 bg-white/80" />}

        {isSplitHero ? (
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

      {landingCategories.length > 0 && (
        <section className="border-b border-[#e5e5e5]">
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
      )}

      <section>
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
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
