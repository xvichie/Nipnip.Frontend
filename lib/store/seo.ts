import type { ProductDetailResponse, StoreResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import { getProductDescription, getProductName } from '@/lib/store/translations'

export const STOREFRONT_ROOT_DOMAIN = 'nipnip.ge'

// Falls back to the nipnip.ge subdomain unless a verified custom domain is passed — callers
// only ever have a custom domain here once it's actually verified (the API never returns an
// unverified one), so there's no risk of pointing search engines at a domain that isn't live.
export function getStoreOrigin(slug: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`
  return `https://${slug}.${STOREFRONT_ROOT_DOMAIN}`
}

export function getStoreUrl(slug: string, path = '', customDomain?: string | null): string {
  const origin = getStoreOrigin(slug, customDomain)
  if (!path || path === '/') return origin
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function truncateDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`
}

export function getStoreOgImage(tokens: Required<ThemeConfig>): string | undefined {
  return tokens.socialImageUrl || tokens.heroImageUrl || tokens.logoUrl || undefined
}

export function getStoreTitle(store: StoreResponse, tokens: Required<ThemeConfig>): string {
  return tokens.seoTagline ? `${store.name} — ${tokens.seoTagline}` : store.name
}

export function getStoreDescription(store: StoreResponse, tokens: Required<ThemeConfig>): string {
  if (tokens.seoDescription) return truncateDescription(tokens.seoDescription)
  const parts = [tokens.heroHeadline, tokens.heroSubheadline].filter(Boolean)
  if (parts.length > 0) return truncateDescription(parts.join(' — '))
  return truncateDescription(`შეიძინეთ პროდუქტები მაღაზია ${store.name}-ში ${STOREFRONT_ROOT_DOMAIN}-ზე.`)
}

export function buildStoreJsonLd(slug: string, store: StoreResponse, tokens: Required<ThemeConfig>) {
  const url = getStoreOrigin(slug, store.customDomain)
  const sameAs = [tokens.socialInstagram, tokens.socialFacebook, tokens.socialTiktok, tokens.socialYoutube].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${url}#store`,
    name: store.name,
    url,
    logo: tokens.logoUrl || undefined,
    image: tokens.logoUrl || tokens.heroImageUrl || undefined,
    telephone: tokens.contactPhone || undefined,
    email: tokens.contactEmail || undefined,
    address: tokens.contactAddress ? { '@type': 'PostalAddress', streetAddress: tokens.contactAddress } : undefined,
    geo: tokens.contactLatitude !== null && tokens.contactLongitude !== null
      ? { '@type': 'GeoCoordinates', latitude: tokens.contactLatitude, longitude: tokens.contactLongitude }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}

export function buildProductJsonLd(slug: string, storeName: string, product: ProductDetailResponse, customDomain: string | null | undefined, lang: StorefrontLanguage) {
  const url = getStoreUrl(slug, `/products/${product.slug}`, customDomain)
  const images = product.images.map(img => img.url)
  const prices = product.variants.map(v => v.salePrice ?? v.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.salePrice ?? product.basePrice
  const maxPrice = prices.length > 0 ? Math.max(...prices) : product.salePrice ?? product.basePrice
  // No variants yet means it still sells at the base price with unlimited stock.
  const inStock = product.variants.length === 0 || product.variants.some(v => v.stock === null || v.stock > 0)
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

  const offers = prices.length > 1 && minPrice !== maxPrice
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: 'GEL',
        lowPrice: minPrice,
        highPrice: maxPrice,
        offerCount: product.variants.length,
        availability,
        url,
      }
    : {
        '@type': 'Offer',
        priceCurrency: 'GEL',
        price: minPrice,
        availability,
        url,
      }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: getProductName(product, lang),
    description: getProductDescription(product, lang) || undefined,
    image: images.length > 0 ? images : undefined,
    sku: product.variants[0]?.sku || product.id,
    brand: { '@type': 'Brand', name: storeName },
    offers,
    url,
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
