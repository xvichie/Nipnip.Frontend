import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { getStoreUrl } from '@/lib/store/seo'
import { Home as MinimalHome } from '@/components/storefront/themes/minimal/Home'
import { Home as BoldHome } from '@/components/storefront/themes/bold/Home'
import { Home as ClassicHome } from '@/components/storefront/themes/classic/Home'
import { Home as LuxuryHome } from '@/components/storefront/themes/luxury/Home'
import { Home as VibrantHome } from '@/components/storefront/themes/vibrant/Home'
import { Home as CommerceHome } from '@/components/storefront/themes/commerce/Home'
import { Home as EditorialHome } from '@/components/storefront/themes/editorial/Home'
import type { PaginatedResult } from '@/lib/types/shared'
import type { CategoryResponse, ProductSummaryResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const HOME_COMPONENTS = { minimal: MinimalHome, bold: BoldHome, classic: ClassicHome, luxury: LuxuryHome, vibrant: VibrantHome, commerce: CommerceHome, editorial: EditorialHome }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { alternates: { canonical: getStoreUrl(slug) } }
}

export default async function StoreHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [store, categories, productsPage] = await Promise.all([
    apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/stores/${slug}/products?pageSize=8`, null),
  ])
  const products = productsPage.items

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const HomeComponent = HOME_COMPONENTS[themeId]

  return <HomeComponent slug={slug} store={store} categories={categories} products={products} tokens={tokens} />
}
