import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { buildBreadcrumbJsonLd, buildProductJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import type { CategoryResponse, ProductDetailResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

// ProductDetail is a Client Component in every theme (variant/quantity state) — dynamic() per
// theme means this page only ever ships the ONE active theme's detail JS to the browser, instead
// of all nine bundled together.
const DETAIL_COMPONENTS = {
  minimal: dynamic(() => import('@/components/storefront/themes/minimal/ProductDetail').then(m => m.ProductDetail)),
  bold: dynamic(() => import('@/components/storefront/themes/bold/ProductDetail').then(m => m.ProductDetail)),
  classic: dynamic(() => import('@/components/storefront/themes/classic/ProductDetail').then(m => m.ProductDetail)),
  luxury: dynamic(() => import('@/components/storefront/themes/luxury/ProductDetail').then(m => m.ProductDetail)),
  vibrant: dynamic(() => import('@/components/storefront/themes/vibrant/ProductDetail').then(m => m.ProductDetail)),
  commerce: dynamic(() => import('@/components/storefront/themes/commerce/ProductDetail').then(m => m.ProductDetail)),
  editorial: dynamic(() => import('@/components/storefront/themes/editorial/ProductDetail').then(m => m.ProductDetail)),
  flower: dynamic(() => import('@/components/storefront/themes/flower/ProductDetail').then(m => m.ProductDetail)),
  kids: dynamic(() => import('@/components/storefront/themes/kids/ProductDetail').then(m => m.ProductDetail)),
  sports: dynamic(() => import('@/components/storefront/themes/sports/ProductDetail').then(m => m.ProductDetail)),
  chocolate: dynamic(() => import('@/components/storefront/themes/chocolate/ProductDetail').then(m => m.ProductDetail)),
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}): Promise<Metadata> {
  const { slug, productSlug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  let product: ProductDetailResponse
  try {
    product = await apiFetch<ProductDetailResponse>(`/api/stores/${slug}/products/${productSlug}`, null)
  } catch {
    return {}
  }

  const description = truncateDescription(
    product.description || `შეიძინეთ ${product.name} მაღაზია ${store.name}-ში.`
  )
  const image = product.images[0]?.url

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: getStoreUrl(slug, `/products/${productSlug}`, store.customDomain) },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params

  // None of these three depend on each other's result (only on slug/productSlug), so they go in
  // parallel instead of one after another.
  let store: StoreResponse
  let product: ProductDetailResponse
  let categories: CategoryResponse[]
  try {
    [store, product, categories] = await Promise.all([
      apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
      apiFetch<ProductDetailResponse>(`/api/stores/${slug}/products/${productSlug}`, null),
      apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    ])
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const DetailComponent = DETAIL_COMPONENTS[themeId]

  const category = categories.find(c => c.id === product.categoryId)

  const categoryCrumb = category
    ? { name: category.name, url: getStoreUrl(slug, `/products/category/${category.slug}`, store.customDomain) }
    : { name: 'ყველა პროდუქტი', url: getStoreUrl(slug, '/products', store.customDomain) }

  return (
    <>
      <JsonLd data={buildProductJsonLd(slug, store.name, product, store.customDomain)} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        categoryCrumb,
        { name: product.name, url: getStoreUrl(slug, `/products/${productSlug}`, store.customDomain) },
      ])} />
      <DetailComponent slug={slug} product={product} category={category} tokens={tokens} />
    </>
  )
}
