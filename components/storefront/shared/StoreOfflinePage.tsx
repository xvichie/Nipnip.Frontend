import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { getThemeText } from '@/lib/store/translations'
import type { StoreResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

function formatReopenDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// Rendered instead of the themed storefront when a merchant switches their store inactive —
// deliberately theme-agnostic (a visitor here isn't browsing the real store) so it doesn't need
// a variant per theme.
export function StoreOfflinePage({
  store,
  tokens,
  t,
  lang,
}: {
  store: StoreResponse
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const heading = tokens.offlineMode === 'comingSoon' ? t.storeOffline.comingSoonHeading : t.storeOffline.closedHeading
  const offlineMessage = getThemeText(tokens, 'offlineMessage', lang)

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full flex flex-col items-center text-center gap-5">
        {tokens.logoUrl ? (
          <CImg src={tokens.logoUrl} alt={store.name} className="h-14 w-auto object-contain" />
        ) : (
          <h1 className="font-black text-2xl tracking-tight">{store.name}</h1>
        )}

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${tokens.accentColor}22` }}
        >
          <span className="text-lg" style={{ color: tokens.accentColor }}>
            {tokens.offlineMode === 'comingSoon' ? '🚀' : '🔒'}
          </span>
        </div>

        <h2 className="font-bold text-xl">{heading}</h2>

        {offlineMessage && (
          <p className="text-white/60 text-sm leading-relaxed">{offlineMessage}</p>
        )}

        {tokens.offlineReopenDate && (
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {t.storeOffline.reopenDate(formatReopenDate(tokens.offlineReopenDate, t.storeOffline.dateLocale))}
          </p>
        )}

        <SocialLinks tokens={tokens} className="mt-2" />
      </div>
    </div>
  )
}
