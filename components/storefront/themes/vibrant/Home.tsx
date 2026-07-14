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
          backgroundImage: `linear-gradient(rgba(255,255,255,0.7),rgba(255,255,255,0.9)), url(${tokens.bannerUrl})`,
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
        <p
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: `${tokens.accentColor}18`, color: tokens.accentColor }}
        >
          {tokens.heroEyebrow}
        </p>
      )}
      <h1 className={`font-black text-[#1a1a1a] tracking-tight mb-5 leading-[1.05] ${isSplitHero ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl'}`}>
        {tokens.heroHeadline || store.name}
      </h1>
      {tokens.heroSubheadline && (
        <p className="text-[#6b6058] text-base mb-8">{tokens.heroSubheadline}</p>
      )}
      <Link
        href={`/products`}
        className="inline-flex items-center gap-2 rounded-full text-white text-sm font-bold px-8 py-4 transition-transform hover:scale-105"
        style={{ backgroundColor: tokens.accentColor, boxShadow: `0 16px 40px -12px ${tokens.accentColor}88` }}
      >
        ყველა პროდუქტის ნახვა
      </Link>
    </div>
  )

  const heroImage = (
    <div className={`relative h-full ${imageOrderClass} ${heroImageHiddenMobile ? 'hidden md:block' : ''}`}>
      {imageBanner && <div className="absolute -inset-4 sm:-inset-6 rounded-[2rem]" style={bannerStyle} />}
      <div
        className={`relative h-full flex items-center justify-center overflow-hidden rounded-[2rem] ${imageBanner || sectionBanner ? '' : 'bg-white'}`}
        style={{ boxShadow: `0 24px 60px -20px ${tokens.accentColor}40` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tokens.heroImageUrl} alt={tokens.heroHeadline || store.name} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  )

  return (
    <div className="bg-[#fffaf5] min-h-screen">

      <section className="relative overflow-hidden" style={sectionStyle}>
        {isSplitHero ? (
          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 ${heightClass}`}>
            {heroImage}
            <div className={`h-full flex flex-col ${pos.wrapper} ${textOrderClass}`}>{heroText}</div>
          </div>
        ) : (
          <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col ${pos.wrapper} ${heightClass}`}>
            {heroText}
          </div>
        )}
      </section>

      {landingCategories.length > 0 && (
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className={`grid ${LANDING_CATEGORY_GRID_CLASS[tokens.landingCategoryColumns]} gap-3`}>
              {landingCategories.map((category, i) => {
                const palette = ['#ff5a3c', '#ffb238', '#3ec6c6', '#7d6bff', '#ff6bb0']
                const color = palette[i % palette.length]
                return (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className="flex flex-col items-center justify-center gap-2.5 rounded-[1.5rem] px-4 py-6 text-center transition-transform hover:scale-105"
                    style={{ backgroundColor: `${color}12` }}
                  >
                    {(category.iconUrl || category.iconKey || category.iconEmoji) && (
                      <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                        <CategoryIcon iconUrl={category.iconUrl} iconKey={category.iconKey} iconEmoji={category.iconEmoji} className="w-5 h-5" />
                      </span>
                    )}
                    <span className="text-sm font-bold" style={{ color }}>{category.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-black text-3xl text-[#1a1a1a] tracking-tight">ყველა პროდუქტი</h2>
            <Link
              href={`/products`}
              className="text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: tokens.accentColor }}
            >
              ყველას ნახვა →
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-[#a89a90] text-sm py-20 text-center">პროდუქტები ჯერ არ არის.</p>
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

    </div>
  )
}
