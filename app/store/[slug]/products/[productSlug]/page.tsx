import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { buildBreadcrumbJsonLd, buildProductJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import { ProductDetail as MinimalProductDetail } from '@/components/storefront/themes/minimal/ProductDetail'
import { ProductDetail as BoldProductDetail } from '@/components/storefront/themes/bold/ProductDetail'
import { ProductDetail as ClassicProductDetail } from '@/components/storefront/themes/classic/ProductDetail'
import { ProductDetail as LuxuryProductDetail } from '@/components/storefront/themes/luxury/ProductDetail'
import { ProductDetail as VibrantProductDetail } from '@/components/storefront/themes/vibrant/ProductDetail'
import { ProductDetail as CommerceProductDetail } from '@/components/storefront/themes/commerce/ProductDetail'
import { ProductDetail as EditorialProductDetail } from '@/components/storefront/themes/editorial/ProductDetail'
import type { ProductDetailResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const DETAIL_COMPONENTS = { minimal: MinimalProductDetail, bold: BoldProductDetail, classic: ClassicProductDetail, luxury: LuxuryProductDetail, vibrant: VibrantProductDetail, commerce: CommerceProductDetail, editorial: EditorialProductDetail }

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
    alternates: { canonical: getStoreUrl(slug, `/products/${productSlug}`) },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  let product: ProductDetailResponse
  try {
    product = await apiFetch<ProductDetailResponse>(`/api/stores/${slug}/products/${productSlug}`, null)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const DetailComponent = DETAIL_COMPONENTS[themeId]

  return (
    <>
      <JsonLd data={buildProductJsonLd(slug, store.name, product)} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug) },
        { name: 'ყველა პროდუქტი', url: getStoreUrl(slug, '/products') },
        { name: product.name, url: getStoreUrl(slug, `/products/${productSlug}`) },
      ])} />
      <DetailComponent slug={slug} product={product} tokens={tokens} />
    </>
  )
}
