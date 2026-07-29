import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'
import { SURFACE_CLASSES } from '@/lib/storefront-themes'
import { getPageContentHtml, getPageTitleHtml } from '@/lib/store/translations'
import { RICH_TEXT_CONTENT_CLASS } from '@/components/dashboard/store/RichTranslatedField'
import { unwrapParagraph } from '@/lib/html'
import type { StorePageResponse, ThemeId } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'

// Title/content are authored as HTML in the merchant dashboard's rich-text editor — sanitized
// here (not just trusted from the API) since this is the one place that content actually gets
// rendered as live markup rather than reused as a plain-text label elsewhere.
function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'br'], ALLOWED_ATTR: ['href', 'target', 'rel'] })
}

export function StorePageView({
  slug,
  page,
  themeId,
  t,
  lang,
}: {
  slug: string
  page: StorePageResponse
  themeId: ThemeId
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const surface = SURFACE_CLASSES[themeId]

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <h1
          className={`font-black text-3xl sm:text-4xl tracking-tight mb-8 [&_a]:underline ${surface.text}`}
          dangerouslySetInnerHTML={{ __html: unwrapParagraph(sanitize(getPageTitleHtml(page, lang))) }}
        />
        <div
          className={`text-sm leading-relaxed ${RICH_TEXT_CONTENT_CLASS} ${surface.text}`}
          dangerouslySetInnerHTML={{ __html: sanitize(getPageContentHtml(page, lang)) }}
        />

        <div className="mt-10">
          <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.muted} hover:opacity-80`}>
            {t.contactPage.backToStore}
          </Link>
        </div>
      </div>
    </div>
  )
}
