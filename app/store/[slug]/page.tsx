import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { getLandingCollections } from '@/lib/store/landing-collections'
import { isThemeId } from '@/lib/storefront-themes'
import { getStoreUrl } from '@/lib/store/seo'
import { Home as MinimalHome } from '@/components/storefront/themes/minimal/Home'
import { Home as BoldHome } from '@/components/storefront/themes/bold/Home'
import { Home as ClassicHome } from '@/components/storefront/themes/classic/Home'
import { Home as LuxuryHome } from '@/components/storefront/themes/luxury/Home'
import { Home as VibrantHome } from '@/components/storefront/themes/vibrant/Home'
import { Home as CommerceHome } from '@/components/storefront/themes/commerce/Home'
import { Home as EditorialHome } from '@/components/storefront/themes/editorial/Home'
import { Home as FlowerHome } from '@/components/storefront/themes/flower/Home'
import { Home as KidsHome } from '@/components/storefront/themes/kids/Home'
import { Home as SportsHome } from '@/components/storefront/themes/sports/Home'
import { Home as ChocolateHome } from '@/components/storefront/themes/chocolate/Home'
import type { PaginatedResult } from '@/lib/types/shared'
import type { CategoryResponse, CollectionResponse, ProductSummaryResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const HOME_COMPONENTS = { minimal: MinimalHome, bold: BoldHome, classic: ClassicHome, luxury: LuxuryHome, vibrant: VibrantHome, commerce: CommerceHome, editorial: EditorialHome, flower: FlowerHome, kids: KidsHome, sports: SportsHome, chocolate: ChocolateHome }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  return { alternates: { canonical: getStoreUrl(slug, '', store.customDomain) } }
}

export default async function StoreHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [store, categories, collections] = await Promise.all([
    apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    apiFetch<CollectionResponse[]>(`/api/stores/${slug}/collections`, null),
  ])
  const tokens = parseThemeConfig(store.themeConfig)
  const landingCollections = getLandingCollections(collections, tokens)

  // Neither depends on the other's result (only on tokens/landingCollections, both already in
  // hand), so they go in parallel instead of the products fetch fully finishing before the
  // per-collection fetches even start.
  const [products, collectionProductLists] = await Promise.all([
    tokens.featuredProductsMode === 'curated' && tokens.featuredProductIds.length > 0
      // No backend "fetch by ids" endpoint — pull a generous page and filter/reorder here instead.
      ? apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/stores/${slug}/products?pageSize=200`, null)
          .then(page => {
            const byId = new Map(page.items.map(p => [p.id, p]))
            return tokens.featuredProductIds.map(id => byId.get(id)).filter((p): p is ProductSummaryResponse => !!p)
          })
      : apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/stores/${slug}/products?pageSize=8`, null)
          .then(page => page.items),
    Promise.all(
      landingCollections.map(collection =>
        apiFetch<PaginatedResult<ProductSummaryResponse>>(
          `/api/stores/${slug}/products?collectionSlug=${collection.slug}&pageSize=${tokens.landingCollectionProductLimit}`,
          null
        )
      )
    ),
  ])
  const collectionProducts = new Map(
    landingCollections.map((collection, i) => [collection.id, collectionProductLists[i].items])
  )

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const HomeComponent = HOME_COMPONENTS[themeId]

  return (
    <HomeComponent
      slug={slug}
      store={store}
      categories={categories}
      collections={collections}
      collectionProducts={collectionProducts}
      products={products}
      tokens={tokens}
    />
  )
}
