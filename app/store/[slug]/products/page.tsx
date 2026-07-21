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
import type { CategoryResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const GRID_COMPONENTS = { minimal: MinimalProductGrid, bold: BoldProductGrid, classic: ClassicProductGrid, luxury: LuxuryProductGrid, vibrant: VibrantProductGrid, commerce: CommerceProductGrid, editorial: EditorialProductGrid }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  return {
    title: 'ყველა პროდუქტი',
    description: truncateDescription(`დაათვალიერეთ ${store.name}-ის ყველა პროდუქტი.`),
    alternates: { canonical: getStoreUrl(slug, '/products', store.customDomain) },
  }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [store, categories] = await Promise.all([
    apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
  ])

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const GridComponent = GRID_COMPONENTS[themeId]

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        { name: 'ყველა პროდუქტი', url: getStoreUrl(slug, '/products', store.customDomain) },
      ])} />
      <GridComponent
        slug={slug}
        categories={categories}
        tokens={tokens}
      />
    </>
  )
}
