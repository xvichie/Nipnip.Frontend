import Link from 'next/link'
import { getThemeDefinition, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { getRadiusClass } from '@/lib/store/theme-config'
import { SocialLinks } from './SocialLinks'
import { ContactForm } from './ContactForm'
import { LocationMap } from './LocationMap'
import { getThemeText } from '@/lib/store/translations'
import type { ThemeConfig, ThemeId } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'

function getRows(t: StorefrontStrings): { key: keyof Pick<Required<ThemeConfig>, 'contactEmail' | 'contactPhone' | 'contactAddress'>; label: string; icon: React.ReactNode }[] {
  return [
    {
      key: 'contactEmail',
      label: t.contactPage.email,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M3.5 6l8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: 'contactPhone',
      label: t.contactPage.phone,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 3h4l2 5-2.5 2a11 11 0 0 0 6.5 6.5l2-2.5 5 2v4a2 2 0 0 1-2 2C10.5 22 2 13.5 2 5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: 'contactAddress',
      label: t.contactPage.address,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      ),
    },
  ]
}

export function ContactPage({
  slug,
  storeName,
  themeId,
  tokens,
  t,
  lang,
}: {
  slug: string
  storeName: string
  themeId: ThemeId
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const surface = SURFACE_CLASSES[themeId]
  const themeDef = getThemeDefinition(themeId)
  const radius = getRadiusClass(themeId, tokens)
  const rows = getRows(t).filter(row => tokens[row.key])
  const contactLabel = getThemeText(tokens, 'contactLabel', lang)

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${surface.muted}`}>{storeName}</p>
        <h1 className={`font-black text-3xl sm:text-4xl tracking-tight mb-10 ${surface.text}`}>{contactLabel}</h1>

        {rows.length > 0 ? (
          <div className={`${surface.card} border ${surface.border} ${radius} divide-y ${surface.border}`}>
            {rows.map(row => {
              const href = row.key === 'contactEmail' ? `mailto:${tokens[row.key]}` : row.key === 'contactPhone' ? `tel:${tokens[row.key]}` : undefined
              return (
                <div key={row.key} className="flex items-center gap-4 px-6 py-5">
                  <span className={surface.muted} style={{ color: tokens.accentColor }}>{row.icon}</span>
                  <div>
                    <p className={`text-xs uppercase tracking-wider mb-0.5 ${surface.muted}`}>{row.label}</p>
                    {href ? (
                      <a href={href} className={`text-sm font-medium hover:underline ${surface.text}`}>
                        {tokens[row.key]}
                      </a>
                    ) : (
                      <p className={`text-sm font-medium ${surface.text}`}>{tokens[row.key]}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className={`text-sm ${surface.muted}`}>{t.contactPage.emptyState}</p>
        )}

        {tokens.contactLatitude !== null && tokens.contactLongitude !== null && (
          <div className={`mt-6 border ${surface.border} ${radius}`}>
            <LocationMap lat={tokens.contactLatitude} lng={tokens.contactLongitude} radius={radius} />
          </div>
        )}

        <SocialLinks tokens={tokens} className="mt-6" />

        {tokens.footerContactForm === 'off' && (
          <div className={`mt-10 pt-10 border-t ${surface.border}`}>
            <ContactForm slug={slug} tokens={tokens} variant={themeDef.dark ? 'dark' : 'light'} radiusClass={radius} />
          </div>
        )}

        <div className="mt-10">
          <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.muted} hover:opacity-80`}>
            {t.contactPage.backToStore}
          </Link>
        </div>
      </div>
    </div>
  )
}
