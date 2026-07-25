import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { buildBreadcrumbJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import { ProductGrid as MinimalProductGrid } from '@/components/storefront/themes/minimal/ProductGrid'
import { ProductGrid as BoldProductGrid } from '@/components/storefront/themes/bold/ProductGrid'
import { ProductGrid as ClassicProductGrid } from '@/components/storefront/themes/classic/ProductGrid'
import { ProductGrid as LuxuryProductGrid } from '@/components/storefront/themes/luxury/ProductGrid'
import { ProductGrid as VibrantProductGrid } from '@/components/storefront/themes/vibrant/ProductGrid'
import { ProductGrid as CommerceProductGrid } from '@/components/storefront/themes/commerce/ProductGrid'
import { ProductGrid as EditorialProductGrid } from '@/components/storefront/themes/editorial/ProductGrid'
import { ProductGrid as FlowerProductGrid } from '@/components/storefront/themes/flower/ProductGrid'
import { ProductGrid as KidsProductGrid } from '@/components/storefront/themes/kids/ProductGrid'
import type { CategoryResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const GRID_COMPONENTS = { minimal: MinimalProductGrid, bold: BoldProductGrid, classic: ClassicProductGrid, luxury: LuxuryProductGrid, vibrant: VibrantProductGrid, commerce: CommerceProductGrid, editorial: EditorialProductGrid, flower: FlowerProductGrid, kids: KidsProductGrid }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>
}): Promise<Metadata> {
  const { slug, categorySlug } = await params
  const [store, categories] = await Promise.all([
    apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
  ])
  const category = categories.find(c => c.slug === categorySlug)
  const categoryName = category?.name ?? categorySlug

  return {
    title: categoryName,
    description: truncateDescription(`დაათვალიერეთ ${categoryName} კატეგორიის პროდუქტები ${store.name}-ში.`),
    alternates: { canonical: getStoreUrl(slug, `/products/category/${categorySlug}`, store.customDomain) },
  }
}

export default async function ProductsByCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>
}) {
  const { slug, categorySlug } = await params

  const [store, categories] = await Promise.all([
    apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
  ])

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const GridComponent = GRID_COMPONENTS[themeId]
  const category = categories.find(c => c.slug === categorySlug)

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        { name: 'ყველა პროდუქტი', url: getStoreUrl(slug, '/products', store.customDomain) },
        { name: category?.name ?? categorySlug, url: getStoreUrl(slug, `/products/category/${categorySlug}`, store.customDomain) },
      ])} />
      <GridComponent
        slug={slug}
        categories={categories}
        activeCategorySlug={categorySlug}
        tokens={tokens}
      />
    </>
  )
}
