import type { CSSProperties } from 'react'
import type { ThemeConfig } from '@/lib/types/storefront'

export const DEFAULT_THEME_CONFIG: Required<ThemeConfig> = {
  accentColor: '#111111',
  font: 'sans',
  logoUrl: '',
  showStoreName: false,
  heroImageUrl: '',
  bannerType: 'image',
  bannerUrl: '',
  bannerColor: '',
  bannerPattern: 'dots',
  bannerPlacement: 'section',
  heroLayout: 'center',
  heroHeight: 'medium',
  heroTextPosition: 'middle-center',
  heroMobileImage: 'show',
  heroMobileImagePosition: 'inherit',
  heroMobileTextAlign: 'inherit',
  heroEyebrow: 'მოგესალმებით',
  heroHeadline: '',
  heroSubheadline: '',
  seoTagline: '',
  seoDescription: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactLatitude: null,
  contactLongitude: null,
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialYoutube: '',
  socialsPosition: 'footer',
  showSaleCategory: false,
  showSaleCategoryIcon: true,
  navPageIds: [],
  categoryMenuMode: 'flat',
  categoryMenuScope: 'all',
  categoryMenuSelectedIds: [],
  showLandingCategories: true,
  landingCategoryScope: 'all',
  landingCategorySelectedIds: [],
  landingCategoryColumns: 4,
  footerContactForm: 'off',
  showContactInNav: false,
  contactLabel: 'კონტაქტი',
  codEnabled: true,
  codNotes: '',
  bankTransferEnabled: true,
  bankTransferNotes: '',
  flittEnabled: false,
  tbcEnabled: false,
  shippingZones: [],
  freeShippingThreshold: null,
}

export function parseThemeConfig(raw: string): Required<ThemeConfig> {
  try {
    const parsed = JSON.parse(raw) as ThemeConfig
    return { ...DEFAULT_THEME_CONFIG, ...parsed }
  } catch {
    return DEFAULT_THEME_CONFIG
  }
}

export const LANDING_CATEGORY_GRID_CLASS: Record<Required<ThemeConfig>['landingCategoryColumns'], string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

export const HERO_HEIGHT_CLASS: Record<Required<ThemeConfig>['heroHeight'], string> = {
  small: 'min-h-[280px] sm:min-h-[340px]',
  medium: 'min-h-[420px] sm:min-h-[520px]',
  large: 'min-h-[560px] sm:min-h-[680px]',
}

export const HERO_TEXT_POSITION_CLASS: Record<Required<ThemeConfig>['heroTextPosition'], { wrapper: string; align: string }> = {
  'top-left': { wrapper: 'justify-start items-start', align: 'text-left' },
  'top-center': { wrapper: 'justify-start items-center', align: 'text-center' },
  'top-right': { wrapper: 'justify-start items-end', align: 'text-right' },
  'middle-left': { wrapper: 'justify-center items-start', align: 'text-left' },
  'middle-center': { wrapper: 'justify-center items-center', align: 'text-center' },
  'middle-right': { wrapper: 'justify-center items-end', align: 'text-right' },
  'bottom-left': { wrapper: 'justify-end items-start', align: 'text-left' },
  'bottom-center': { wrapper: 'justify-end items-center', align: 'text-center' },
  'bottom-right': { wrapper: 'justify-end items-end', align: 'text-right' },
}

type HeroHorizontalAlign = 'left' | 'center' | 'right'

const HERO_ALIGN_CLASS: Record<HeroHorizontalAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const HERO_ALIGN_CLASS_MD: Record<HeroHorizontalAlign, string> = {
  left: 'md:text-left',
  center: 'md:text-center',
  right: 'md:text-right',
}

export function getHeroTextAlignClass(tokens: Required<ThemeConfig>): string {
  const desktopHorizontal = tokens.heroTextPosition.split('-')[1] as HeroHorizontalAlign

  if (tokens.heroMobileTextAlign === 'inherit') {
    return HERO_ALIGN_CLASS[desktopHorizontal]
  }

  return `${HERO_ALIGN_CLASS[tokens.heroMobileTextAlign]} ${HERO_ALIGN_CLASS_MD[desktopHorizontal]}`
}

export const HERO_TEXT_POSITIONS: Required<ThemeConfig>['heroTextPosition'][] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export const BANNER_PATTERNS: { value: Required<ThemeConfig>['bannerPattern']; label: string }[] = [
  { value: 'dots', label: 'Dots' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'grid', label: 'Grid' },
  { value: 'checkers', label: 'Checkers' },
]

export function hasBanner(tokens: Required<ThemeConfig>): boolean {
  if (tokens.bannerType === 'pattern') return true
  if (tokens.bannerType === 'color') return !!tokens.bannerColor
  return !!tokens.bannerUrl
}

export function getBannerPatternStyle(
  pattern: Required<ThemeConfig>['bannerPattern'],
  tintHex: string
): CSSProperties {
  const clean = /^#[0-9a-fA-F]{6}$/.test(tintHex) ? tintHex : '#111111'
  const tint = (alpha: string) => `${clean}${alpha}`

  switch (pattern) {
    case 'stripes':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${tint('26')}, ${tint('26')} 10px, transparent 10px, transparent 20px)`,
      }
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${tint('26')} 1px, transparent 1px), linear-gradient(90deg, ${tint('26')} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }
    case 'checkers':
      return {
        backgroundImage: [
          `linear-gradient(45deg, ${tint('26')} 25%, transparent 25%)`,
          `linear-gradient(-45deg, ${tint('26')} 25%, transparent 25%)`,
          `linear-gradient(45deg, transparent 75%, ${tint('26')} 75%)`,
          `linear-gradient(-45deg, transparent 75%, ${tint('26')} 75%)`,
        ].join(', '),
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
      }
    case 'dots':
    default:
      return {
        backgroundImage: `radial-gradient(${tint('44')} 2px, transparent 2px)`,
        backgroundSize: '18px 18px',
      }
  }
}

export function getBannerBackgroundStyle(tokens: Required<ThemeConfig>): CSSProperties {
  if (tokens.bannerType === 'image' && tokens.bannerUrl) {
    return { backgroundImage: `url(${tokens.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  if (tokens.bannerType === 'color' && tokens.bannerColor) {
    return { backgroundColor: tokens.bannerColor }
  }
  if (tokens.bannerType === 'pattern') {
    return getBannerPatternStyle(tokens.bannerPattern, tokens.bannerColor || tokens.accentColor)
  }
  return {}
}

export const FONT_STACKS: Record<Required<ThemeConfig>['font'], string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex
  const num = parseInt(clean, 16)
  const amt = Math.round(2.55 * percent)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amt)
  const g = clamp(((num >> 8) & 0x00ff) + amt)
  const b = clamp((num & 0x0000ff) + amt)
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

export function glowShadow(hex: string, alphaHex = '55'): string {
  const clean = hex.replace('#', '')
  return /^[0-9a-fA-F]{6}$/.test(clean) ? `0 0 32px 0 #${clean}${alphaHex}` : 'none'
}
