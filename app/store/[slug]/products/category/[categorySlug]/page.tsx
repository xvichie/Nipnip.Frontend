import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { buildBreadcrumbJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { getStorefrontStrings } from '@/lib/storefront-i18n-server'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import type { CategoryResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

// ProductGrid is a Client Component in every theme (search/filter/sort state) — dynamic() per
// theme means this page only ever ships the ONE active theme's grid JS to the browser, instead
// of all nine bundled together.
const GRID_COMPONENTS = {
  minimal: dynamic(() => import('@/components/storefront/themes/minimal/ProductGrid').then(m => m.ProductGrid)),
  bold: dynamic(() => import('@/components/storefront/themes/bold/ProductGrid').then(m => m.ProductGrid)),
  classic: dynamic(() => import('@/components/storefront/themes/classic/ProductGrid').then(m => m.ProductGrid)),
  luxury: dynamic(() => import('@/components/storefront/themes/luxury/ProductGrid').then(m => m.ProductGrid)),
  vibrant: dynamic(() => import('@/components/storefront/themes/vibrant/ProductGrid').then(m => m.ProductGrid)),
  commerce: dynamic(() => import('@/components/storefront/themes/commerce/ProductGrid').then(m => m.ProductGrid)),
  editorial: dynamic(() => import('@/components/storefront/themes/editorial/ProductGrid').then(m => m.ProductGrid)),
  flower: dynamic(() => import('@/components/storefront/themes/flower/ProductGrid').then(m => m.ProductGrid)),
  kids: dynamic(() => import('@/components/storefront/themes/kids/ProductGrid').then(m => m.ProductGrid)),
  sports: dynamic(() => import('@/components/storefront/themes/sports/ProductGrid').then(m => m.ProductGrid)),
  chocolate: dynamic(() => import('@/components/storefront/themes/chocolate/ProductGrid').then(m => m.ProductGrid)),
  athletic: dynamic(() => import('@/components/storefront/themes/athletic/ProductGrid').then(m => m.ProductGrid)),
  handmade: dynamic(() => import('@/components/storefront/themes/handmade/ProductGrid').then(m => m.ProductGrid)),
  furniture: dynamic(() => import('@/components/storefront/themes/furniture/ProductGrid').then(m => m.ProductGrid)),
  varsity: dynamic(() => import('@/components/storefront/themes/varsity/ProductGrid').then(m => m.ProductGrid)),
  wooden: dynamic(() => import('@/components/storefront/themes/wooden/ProductGrid').then(m => m.ProductGrid)),
  industrial: dynamic(() => import('@/components/storefront/themes/industrial/ProductGrid').then(m => m.ProductGrid)),
}

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
  const t = await getStorefrontStrings()

  return {
    title: categoryName,
    description: truncateDescription(t.seo.categoryDescription(categoryName, store.name)),
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
  const t = await getStorefrontStrings()

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        { name: t.seo.productsPageTitle, url: getStoreUrl(slug, '/products', store.customDomain) },
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
