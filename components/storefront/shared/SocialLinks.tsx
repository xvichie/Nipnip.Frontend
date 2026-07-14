import type { ThemeConfig } from '@/lib/types/storefront'

const ICONS: Record<'instagram' | 'facebook' | 'tiktok' | 'youtube', React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 8.5h2V5h-2.5C12.6 5 11 6.6 11 8.5V11H9v3.5h2V21h3.5v-6.5H17l.5-3.5h-3V9c0-.3.2-.5.5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 3v11.5a3 3 0 1 1-2.5-2.96" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 3c.3 2.4 2 4.3 4.5 4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor"/>
    </svg>
  ),
}

export function SocialLinks({ tokens, className = '' }: { tokens: Required<ThemeConfig>; className?: string }) {
  const links: { key: keyof typeof ICONS; url: string }[] = [
    { key: 'instagram', url: tokens.socialInstagram },
    { key: 'facebook', url: tokens.socialFacebook },
    { key: 'tiktok', url: tokens.socialTiktok },
    { key: 'youtube', url: tokens.socialYoutube },
  ].filter(l => l.url) as { key: keyof typeof ICONS; url: string }[]

  if (links.length === 0) return null

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(link => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.key}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          {ICONS[link.key]}
        </a>
      ))}
    </div>
  )
}
