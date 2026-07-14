import Link from 'next/link'
import { SURFACE_CLASSES } from '@/lib/storefront-themes'
import type { StorePageResponse, ThemeId } from '@/lib/types/storefront'

export function StorePageView({
  slug,
  page,
  themeId,
}: {
  slug: string
  page: StorePageResponse
  themeId: ThemeId
}) {
  const surface = SURFACE_CLASSES[themeId]

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <h1 className={`font-black text-3xl sm:text-4xl tracking-tight mb-8 ${surface.text}`}>{page.title}</h1>
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${surface.text}`}>{page.content}</p>

        <div className="mt-10">
          <Link href={`/store/${slug}`} className={`text-sm underline underline-offset-2 ${surface.muted} hover:opacity-80`}>
            ← მაღაზიაში დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  )
}
