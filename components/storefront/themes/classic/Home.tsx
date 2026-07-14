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
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{tokens.heroEyebrow}</p>
      )}
      <h1 className={`font-bold text-gray-900 tracking-tight mb-5 ${isSplitHero ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className="text-gray-500 text-base mb-8">{tokens.heroSubheadline}</p>
      )}
      <Link
        href={`/store/${slug}/products`}
        className="inline-flex items-center gap-2 rounded-md text-white text-sm font-semibold px-7 py-3 shadow-sm hover:shadow-md transition-shadow"
        style={{ backgroundColor: tokens.accentColor }}
      >
        ყველა პროდუქტის ნახვა
      </Link>
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-md" style={bannerStyle} />}
      <div className={`relative h-full flex items-center justify-center overflow-hidden rounded-md ${imageBanner || sectionBanner ? '' : 'bg-white shadow-sm'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tokens.heroImageUrl} alt={tokens.heroHeadline || store.name} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  )

  return (
    <div className="bg-[#fafafa] min-h-screen">

      <section className="bg-white relative overflow-hidden" style={sectionStyle}>
        {isSplitHero ? (
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

      {landingCategories.length > 0 && (
        <section className="border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
              {landingCategories.map(category => (
                <Link
                  key={category.id}
                  href={`/store/${slug}/products/category/${category.slug}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow px-4 py-6 text-center text-sm font-medium text-gray-700"
                >
                  <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5" style={{ color: tokens.accentColor }} />
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-bold text-2xl text-gray-900">ყველა პროდუქტი</h2>
            <Link href={`/store/${slug}/products`} className="text-sm font-medium hover:underline" style={{ color: tokens.accentColor }}>
              ყველას ნახვა →
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-400 text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
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

    </div>
  )
}
