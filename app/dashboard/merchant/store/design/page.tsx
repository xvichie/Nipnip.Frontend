'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { useMyCategories, useMyCollections, useMyPages, useMyProducts, useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { uploadImage, uploadVideo } from '@/lib/uploadImage'
import { BANNER_PATTERNS, DEFAULT_THEME_CONFIG, getContrastRatio, HERO_TEXT_POSITIONS, parseThemeConfig, shadeColor } from '@/lib/store/theme-config'
import { ALL_FONT_VARIABLE_CLASSES, FONT_OPTIONS, getFontOption, type FontCategory } from '@/lib/storefront-fonts'
import { getThemeDefinition, isThemeId, SURFACE_CLASSES, THEME_CATEGORIES, THEMES, type ThemeCategory } from '@/lib/storefront-themes'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { PreviewFrame, type PreviewMode } from '@/components/dashboard/store/PreviewFrame'
import { AnnouncementBar } from '@/components/storefront/shared/AnnouncementBar'
import { StorefrontLanguageProvider } from '@/components/storefront/shared/StorefrontLanguageProvider'
import { ka as storefrontT } from '@/strings/storefront-ka'
import { IconButton } from '@/components/ui/IconButton'
import { TranslatedField, type TranslatedFieldValue } from '@/components/dashboard/store/TranslatedField'
import {
  BannerIcon,
  ButtonIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeaderBarIcon,
  HeroSectionIcon,
  ImageIcon,
  PaletteIcon,
  PlusIcon,
  StackIcon,
  SwatchIcon,
  TagBadgeIcon,
  XIcon,
} from '@/components/ui/icons'
import { DeviceFieldToggle, type DeviceKind } from '@/components/dashboard/store/DeviceFieldToggle'
import { Header as MinimalHeader } from '@/components/storefront/themes/minimal/Header'
import { Footer as MinimalFooter } from '@/components/storefront/themes/minimal/Footer'
import { Home as MinimalHome } from '@/components/storefront/themes/minimal/Home'
import { Header as BoldHeader } from '@/components/storefront/themes/bold/Header'
import { Footer as BoldFooter } from '@/components/storefront/themes/bold/Footer'
import { Home as BoldHome } from '@/components/storefront/themes/bold/Home'
import { Header as ClassicHeader } from '@/components/storefront/themes/classic/Header'
import { Footer as ClassicFooter } from '@/components/storefront/themes/classic/Footer'
import { Home as ClassicHome } from '@/components/storefront/themes/classic/Home'
import { Header as LuxuryHeader } from '@/components/storefront/themes/luxury/Header'
import { Footer as LuxuryFooter } from '@/components/storefront/themes/luxury/Footer'
import { Home as LuxuryHome } from '@/components/storefront/themes/luxury/Home'
import { Header as VibrantHeader } from '@/components/storefront/themes/vibrant/Header'
import { Footer as VibrantFooter } from '@/components/storefront/themes/vibrant/Footer'
import { Home as VibrantHome } from '@/components/storefront/themes/vibrant/Home'
import { Header as CommerceHeader } from '@/components/storefront/themes/commerce/Header'
import { Footer as CommerceFooter } from '@/components/storefront/themes/commerce/Footer'
import { Home as CommerceHome } from '@/components/storefront/themes/commerce/Home'
import { Header as EditorialHeader } from '@/components/storefront/themes/editorial/Header'
import { Footer as EditorialFooter } from '@/components/storefront/themes/editorial/Footer'
import { Home as EditorialHome } from '@/components/storefront/themes/editorial/Home'
import { Header as FlowerHeader } from '@/components/storefront/themes/flower/Header'
import { Footer as FlowerFooter } from '@/components/storefront/themes/flower/Footer'
import { Home as FlowerHome } from '@/components/storefront/themes/flower/Home'
import { Header as KidsHeader } from '@/components/storefront/themes/kids/Header'
import { Footer as KidsFooter } from '@/components/storefront/themes/kids/Footer'
import { Home as KidsHome } from '@/components/storefront/themes/kids/Home'
import { Header as SportsHeader } from '@/components/storefront/themes/sports/Header'
import { Footer as SportsFooter } from '@/components/storefront/themes/sports/Footer'
import { Home as SportsHome } from '@/components/storefront/themes/sports/Home'
import { Header as ChocolateHeader } from '@/components/storefront/themes/chocolate/Header'
import { Footer as ChocolateFooter } from '@/components/storefront/themes/chocolate/Footer'
import { Home as ChocolateHome } from '@/components/storefront/themes/chocolate/Home'
import { Header as AthleticHeader } from '@/components/storefront/themes/athletic/Header'
import { Footer as AthleticFooter } from '@/components/storefront/themes/athletic/Footer'
import { Home as AthleticHome } from '@/components/storefront/themes/athletic/Home'
import { Header as HandmadeHeader } from '@/components/storefront/themes/handmade/Header'
import { Footer as HandmadeFooter } from '@/components/storefront/themes/handmade/Footer'
import { Home as HandmadeHome } from '@/components/storefront/themes/handmade/Home'
import { Header as FurnitureHeader } from '@/components/storefront/themes/furniture/Header'
import { Footer as FurnitureFooter } from '@/components/storefront/themes/furniture/Footer'
import { Home as FurnitureHome } from '@/components/storefront/themes/furniture/Home'
import { Header as VarsityHeader } from '@/components/storefront/themes/varsity/Header'
import { Footer as VarsityFooter } from '@/components/storefront/themes/varsity/Footer'
import { Home as VarsityHome } from '@/components/storefront/themes/varsity/Home'
import { Header as WoodenHeader } from '@/components/storefront/themes/wooden/Header'
import { Footer as WoodenFooter } from '@/components/storefront/themes/wooden/Footer'
import { Home as WoodenHome } from '@/components/storefront/themes/wooden/Home'
import { Header as IndustrialHeader } from '@/components/storefront/themes/industrial/Header'
import { Footer as IndustrialFooter } from '@/components/storefront/themes/industrial/Footer'
import { Home as IndustrialHome } from '@/components/storefront/themes/industrial/Home'
import { CImg } from '@/components/ui/CImg'
import type {
  BannerPattern,
  BannerPlacement,
  BannerType,
  ButtonHoverAnimation,
  CategoryMenuMode,
  CategoryResponse,
  CategoryMenuScope,
  FooterContactFormPosition,
  HeroCtaLinkType,
  HeroHeight,
  HeroSlide,
  HeroImageFit,
  HeroImagePosition,
  HeroLayout,
  HeroMobileImagePosition,
  HeroMobileImageVisibility,
  HeroMobileTextAlign,
  HeroTextPosition,
  HeroTextSize,
  HeroTextTheme,
  LandingCategoryColumns,
  ProductSummaryResponse,
  SearchBarLocation,
  SocialsPosition,
  ThemeConfig,
  ThemeId,
  TranslatableThemeText,
} from '@/lib/types/storefront'

const HEADERS = { minimal: MinimalHeader, bold: BoldHeader, classic: ClassicHeader, luxury: LuxuryHeader, vibrant: VibrantHeader, commerce: CommerceHeader, editorial: EditorialHeader, flower: FlowerHeader, kids: KidsHeader, sports: SportsHeader, chocolate: ChocolateHeader, athletic: AthleticHeader, handmade: HandmadeHeader, furniture: FurnitureHeader, varsity: VarsityHeader, wooden: WoodenHeader, industrial: IndustrialHeader }
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter, flower: FlowerFooter, kids: KidsFooter, sports: SportsFooter, chocolate: ChocolateFooter, athletic: AthleticFooter, handmade: HandmadeFooter, furniture: FurnitureFooter, varsity: VarsityFooter, wooden: WoodenFooter, industrial: IndustrialFooter }
const HOMES = { minimal: MinimalHome, bold: BoldHome, classic: ClassicHome, luxury: LuxuryHome, vibrant: VibrantHome, commerce: CommerceHome, editorial: EditorialHome, flower: FlowerHome, kids: KidsHome, sports: SportsHome, chocolate: ChocolateHome, athletic: AthleticHome, handmade: HandmadeHome, furniture: FurnitureHome, varsity: VarsityHome, wooden: WoodenHome, industrial: IndustrialHome }

const PLACEHOLDER_PRODUCTS: ProductSummaryResponse[] = [
  { id: 'preview-1', slug: 'preview-1', categoryId: null, name: 'ნიმუშის პროდუქტი', nameKa: 'ნიმუშის პროდუქტი', nameEn: null, nameRu: null, basePrice: 49.99, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-2', slug: 'preview-2', categoryId: null, name: 'სხვა ნივთი', nameKa: 'სხვა ნივთი', nameEn: null, nameRu: null, basePrice: 89, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-3', slug: 'preview-3', categoryId: null, name: 'ბესთსელერი', nameKa: 'ბესთსელერი', nameEn: null, nameRu: null, basePrice: 129.5, salePrice: 99.5, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-4', slug: 'preview-4', categoryId: null, name: 'ახალი ჩამოსვლა', nameKa: 'ახალი ჩამოსვლა', nameEn: null, nameRu: null, basePrice: 34, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
]

// Order-independent equality for the unsaved-changes check below — a plain JSON.stringify
// comparison would false-positive whenever an object's key insertion order merely differs
// between the hydrated baseline and the freshly-built current snapshot (e.g. sectionBackgroundColors).
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  const aKeys = Object.keys(a as Record<string, unknown>)
  const bKeys = Object.keys(b as Record<string, unknown>)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(key => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

function ImageField({
  label,
  value,
  uploading,
  onFile,
  onClear,
}: {
  label: string
  value: string
  uploading: boolean
  onFile: (file: File) => void
  onClear: () => void
}) {
  return (
    <div className="fieldset gap-2">
      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
          {uploading ? (
            <span className="loading loading-spinner loading-sm text-fuchsia-400" />
          ) : value ? (
            <CImg src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-[10px]">არცერთი</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer w-fit">
            ატვირთვა
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
          </label>
          {value && (
            <button type="button" onClick={onClear} className="text-xs text-white/30 hover:text-red-400 text-left">
              წაშლა
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoField({
  label,
  value,
  uploading,
  onFile,
  onClear,
}: {
  label: string
  value: string
  uploading: boolean
  onFile: (file: File) => void
  onClear: () => void
}) {
  return (
    <div className="fieldset gap-2">
      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
          {uploading ? (
            <span className="loading loading-spinner loading-sm text-fuchsia-400" />
          ) : value ? (
            <video src={value} muted loop autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-[10px]">არცერთი</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer w-fit">
            ატვირთვა
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
          </label>
          {value && (
            <button type="button" onClick={onClear} className="text-xs text-white/30 hover:text-red-400 text-left">
              წაშლა
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const FONT_CATEGORY_LABELS: { category: FontCategory; title: string }[] = [
  { category: 'default', title: 'ნაგულისხმევი' },
  { category: 'georgian', title: 'ქართული' },
  { category: 'latin', title: 'ლათინური' },
]

function FontPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [search, setSearch] = useState('')
  const filtered = FONT_OPTIONS.filter(f => f.label.toLowerCase().includes(search.toLowerCase()))
  const current = getFontOption(value)

  return (
    <div className={`flex flex-col gap-2 ${ALL_FONT_VARIABLE_CLASSES}`}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/4">
        <span className="text-white/40 text-xs uppercase tracking-wider shrink-0">არჩეული</span>
        <span style={{ fontFamily: current.fontFamily }} className="text-white text-sm truncate">{current.label}</span>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ფონტების ძიება…"
        className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
      />
      <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white/2 divide-y divide-white/5">
        {FONT_CATEGORY_LABELS.map(group => {
          const items = filtered.filter(f => f.category === group.category)
          if (items.length === 0) return null
          return (
            <div key={group.category}>
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 bg-white/2 sticky top-0">{group.title}</p>
              {items.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChange(opt.key)}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${value === opt.key ? 'bg-fuchsia-500/10' : 'hover:bg-white/4'}`}
                >
                  <span className="min-w-0 flex-1">
                    <span style={{ fontFamily: opt.fontFamily }} className="block text-white text-sm truncate">{opt.label}</span>
                    {opt.sampleText && (
                      <span style={{ fontFamily: opt.fontFamily }} className="block text-white/50 text-xs truncate mt-0.5">{opt.sampleText}</span>
                    )}
                  </span>
                  {value === opt.key && <span className="text-fuchsia-400 text-xs shrink-0">✓</span>}
                </button>
              ))}
            </div>
          )
        })}
        {filtered.length === 0 && <p className="px-3 py-4 text-white/30 text-xs text-center">ფონტები ვერ მოიძებნა.</p>}
      </div>
    </div>
  )
}

const TEXT_SIZE_OPTIONS: { value: HeroTextSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
]

function HeroTextSizePicker({ value, onChange }: { value: HeroTextSize; onChange: (v: HeroTextSize) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TEXT_SIZE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'rounded-lg border py-1.5 text-xs font-semibold text-center transition-colors',
            value === opt.value
              ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
              : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const BUTTON_HOVER_ANIMATION_OPTIONS: { value: ButtonHoverAnimation; label: string; demoStyle: CSSProperties }[] = [
  { value: 'scale', label: 'გადიდება', demoStyle: { '--btn-hover-scale': '1.08' } as CSSProperties },
  { value: 'lift', label: 'აწევა', demoStyle: { '--btn-hover-lift': '-4px' } as CSSProperties },
  { value: 'brighten', label: 'გაღიავება', demoStyle: { '--btn-hover-brightness': '1.3' } as CSSProperties },
  { value: 'darken', label: 'დაბნელება', demoStyle: { '--btn-hover-brightness': '0.75' } as CSSProperties },
  { value: 'none', label: 'არცერთი', demoStyle: {} },
]

// Each option's demo pill plays its own hover animation live (fixed 200ms, independent of the
// merchant's actual duration choice below) so picking an animation doesn't require switching to
// the real storefront preview to see what it looks like — hover any option to try it.
function ButtonHoverAnimationPicker({
  value,
  onChange,
  accentColor,
}: {
  value: ButtonHoverAnimation
  onChange: (value: ButtonHoverAnimation) => void
  accentColor: string
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {BUTTON_HOVER_ANIMATION_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors',
            value === opt.value
              ? 'border-fuchsia-500 bg-fuchsia-500/10'
              : 'border-white/10 bg-white/4 hover:border-white/25',
          ].join(' ')}
        >
          <span
            className="theme-cta-btn w-8 h-8 rounded-full"
            style={{ backgroundColor: accentColor, '--btn-hover-duration': '200ms', ...opt.demoStyle } as CSSProperties}
          />
          <span className={`text-[11px] font-medium ${value === opt.value ? 'text-white' : 'text-white/50'}`}>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// WCAG AA needs 4.5:1 for normal text, 3:1 for large/bold text — button labels are short and
// bold, so 3:1 gets a "large text" pass instead of being flagged alongside genuinely bad pairs.
function ContrastBadge({ foreground, background, label }: { foreground: string; background: string; label: string }) {
  const ratio = getContrastRatio(foreground, background)
  if (ratio === null) return null
  const tier = ratio >= 4.5 ? 'pass' : ratio >= 3 ? 'large' : 'fail'
  return (
    <div
      className={[
        'flex items-center gap-1.5 text-[11px] rounded-md px-2 py-1 w-fit',
        tier === 'pass' ? 'text-emerald-400 bg-emerald-500/10' : tier === 'large' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10',
      ].join(' ')}
    >
      <span
        className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center text-[9px] font-bold shrink-0"
        style={{ backgroundColor: background, color: foreground }}
      >
        A
      </span>
      <span>
        {label} — {ratio.toFixed(1)}:1{' '}
        {tier === 'pass' ? 'კარგი კონტრასტი' : tier === 'large' ? 'საკმარისია მხოლოდ მსხვილი ტექსტისთვის' : 'დაბალი კონტრასტი, ძნელად საკითხავია'}
      </span>
    </div>
  )
}

const DESIGN_SECTIONS: { id: string; label: string; Icon: (props: { className?: string }) => ReactElement }[] = [
  { id: 'section-theme', label: 'თემა', Icon: SwatchIcon },
  { id: 'section-colors', label: 'ფერები და ფონტი', Icon: PaletteIcon },
  { id: 'section-buttons', label: 'ღილაკები', Icon: ButtonIcon },
  { id: 'section-branding', label: 'ბრენდინგი', Icon: ImageIcon },
  { id: 'section-header', label: 'ჰედერი', Icon: HeaderBarIcon },
  { id: 'section-hero', label: 'ჰერო სექცია', Icon: HeroSectionIcon },
  { id: 'section-hero-cta', label: 'ჰერო ღილაკი', Icon: ButtonIcon },
  { id: 'section-hero-secondary-cta', label: 'ჰერო მეორადი ღილაკი', Icon: ButtonIcon },
  { id: 'section-hero-slides', label: 'ჰერო სლაიდები', Icon: StackIcon },
  { id: 'section-badges', label: 'პროდუქტის ბეჯები', Icon: TagBadgeIcon },
]

// A quick-jump rail so a page with this many cards doesn't feel like an endless scroll —
// tracks which section is on screen via IntersectionObserver rather than a scroll-position
// calculation, matching the pattern already used by StickyAddToCartBar on the storefront side.
function SectionNav() {
  const [active, setActive] = useState(DESIGN_SECTIONS[0].id)

  useEffect(() => {
    const elements = DESIGN_SECTIONS
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-84px 0px -70% 0px' }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="sticky top-6 z-10 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/7 bg-[#0b0b12]/95 backdrop-blur-md p-1.5">
      {DESIGN_SECTIONS.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={[
            'tooltip tooltip-bottom shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
            active === s.id ? 'bg-fuchsia-500/20 text-white' : 'text-white/35 hover:text-white hover:bg-white/5',
          ].join(' ')}
          data-tip={s.label}
          aria-label={s.label}
        >
          <s.Icon />
        </button>
      ))}
    </div>
  )
}

function HeroSlideFields({
  slide,
  index,
  total,
  categories,
  uploading,
  onFile,
  videoUploading,
  onVideoFile,
  onChange,
  onMove,
  onRemove,
}: {
  slide: HeroSlide
  index: number
  total: number
  categories: CategoryResponse[]
  uploading: boolean
  onFile: (file: File) => void
  videoUploading: boolean
  onVideoFile: (file: File) => void
  onChange: <K extends keyof HeroSlide>(field: K, value: HeroSlide[K]) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}) {
  // Binds one of this slide's translatable text fields to a TranslatedField — "ka" writes the
  // existing plain field as before, "en"/"ru" write into the slide's own translations sidecar
  // (travels with the slide, so reordering/adding/removing slides never desyncs indices).
  function slideTextBinding(
    field: 'eyebrow' | 'headline' | 'subheadline' | 'ctaText' | 'secondaryCtaText'
  ): { value: TranslatedFieldValue; onChange: (v: TranslatedFieldValue) => void } {
    return {
      value: {
        ka: slide[field],
        en: slide.translations?.en?.[field] ?? '',
        ru: slide.translations?.ru?.[field] ?? '',
      },
      onChange: v => {
        onChange(field, v.ka)
        onChange('translations', {
          en: { ...slide.translations?.en, [field]: v.en.trim() || undefined },
          ru: { ...slide.translations?.ru, [field]: v.ru.trim() || undefined },
        })
      },
    }
  }

  return (
    <div className="rounded-xl border border-white/7 bg-white/2 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">სლაიდი {index + 1}</span>
        <div className="flex items-center gap-1">
          <IconButton icon={<ChevronUpIcon />} label="ზემოთ გადატანა" onClick={() => onMove(-1)} disabled={index === 0} />
          <IconButton icon={<ChevronDownIcon />} label="ქვემოთ გადატანა" onClick={() => onMove(1)} disabled={index === total - 1} />
          <IconButton icon={<XIcon />} label="სლაიდის წაშლა" onClick={onRemove} variant="danger" />
        </div>
      </div>

      <ImageField label="სურათი" value={slide.imageUrl} uploading={uploading} onFile={onFile} onClear={() => onChange('imageUrl', '')} />

      <VideoField label="ვიდეო (სურვილისამებრ, მხოლოდ ფონის განლაგებისთვის)" value={slide.videoUrl} uploading={videoUploading} onFile={onVideoFile} onClear={() => onChange('videoUrl', '')} />

      <div className="fieldset gap-2">
        <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ზედწერილი</label>
        <TranslatedField {...slideTextBinding('eyebrow')} className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60" />
      </div>

      <div className="fieldset gap-2">
        <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სათაური</label>
        <TranslatedField {...slideTextBinding('headline')} className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60" />
      </div>

      <div className="fieldset gap-2">
        <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ქვესათაური</label>
        <TranslatedField {...slideTextBinding('subheadline')} multiline rows={2} className="textarea textarea-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none" />
      </div>

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-white/70">ღილაკის ჩვენება</span>
        <input
          type="checkbox"
          checked={slide.ctaEnabled}
          onChange={e => onChange('ctaEnabled', e.target.checked)}
          className={`toggle toggle-sm ${slide.ctaEnabled ? 'toggle-success' : 'toggle-error'}`}
        />
      </label>

      {slide.ctaEnabled && (
        <>
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ღილაკის ტექსტი</label>
            <TranslatedField {...slideTextBinding('ctaText')} placeholders={{ ka: 'ყველა პროდუქტის ნახვა', en: 'View all products', ru: 'Смотреть все товары' }} className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60" />
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მიმართავს ვიზიტორებს</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'products', label: 'ყველა პროდუქტი' },
                { value: 'category', label: 'კატეგორია' },
                { value: 'custom', label: 'საკუთარი ბმული' },
              ] as { value: HeroCtaLinkType; label: string }[]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange('ctaLinkType', opt.value)}
                  className={[
                    'rounded-lg border px-2 py-1.5 text-[11px] font-medium text-center transition-colors',
                    slide.ctaLinkType === opt.value
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                      : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {slide.ctaLinkType === 'category' && (
              <select
                value={slide.ctaCategoryId}
                onChange={e => onChange('ctaCategoryId', e.target.value)}
                className="select select-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 mt-1"
              >
                <option value="">აირჩიეთ კატეგორია…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {slide.ctaLinkType === 'custom' && (
              <input
                type="text"
                value={slide.ctaCustomUrl}
                onChange={e => onChange('ctaCustomUrl', e.target.value)}
                placeholder="/products/category/shoes ან https://…"
                className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 mt-1"
              />
            )}
          </div>
        </>
      )}

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-white/70">მეორადი ღილაკის ჩვენება</span>
        <input
          type="checkbox"
          checked={slide.secondaryCtaEnabled}
          onChange={e => onChange('secondaryCtaEnabled', e.target.checked)}
          className={`toggle toggle-sm ${slide.secondaryCtaEnabled ? 'toggle-success' : 'toggle-error'}`}
        />
      </label>

      {slide.secondaryCtaEnabled && (
        <>
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მეორადი ღილაკის ტექსტი</label>
            <TranslatedField {...slideTextBinding('secondaryCtaText')} placeholders={{ ka: 'მეტის ნახვა', en: 'Learn more', ru: 'Узнать больше' }} className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60" />
          </div>

          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მიმართავს ვიზიტორებს</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'products', label: 'ყველა პროდუქტი' },
                { value: 'category', label: 'კატეგორია' },
                { value: 'custom', label: 'საკუთარი ბმული' },
              ] as { value: HeroCtaLinkType; label: string }[]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange('secondaryCtaLinkType', opt.value)}
                  className={[
                    'rounded-lg border px-2 py-1.5 text-[11px] font-medium text-center transition-colors',
                    slide.secondaryCtaLinkType === opt.value
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                      : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {slide.secondaryCtaLinkType === 'category' && (
              <select
                value={slide.secondaryCtaCategoryId}
                onChange={e => onChange('secondaryCtaCategoryId', e.target.value)}
                className="select select-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 mt-1"
              >
                <option value="">აირჩიეთ კატეგორია…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {slide.secondaryCtaLinkType === 'custom' && (
              <input
                type="text"
                value={slide.secondaryCtaCustomUrl}
                onChange={e => onChange('secondaryCtaCustomUrl', e.target.value)}
                placeholder="/products/category/shoes ან https://…"
                className="input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 mt-1"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function StoreDesignPage() {
  const { data: store, isLoading } = useMyStore()
  const { data: categories } = useMyCategories()
  const { data: collections } = useMyCollections()
  const { data: pages } = useMyPages()
  const { data: productsPage, isLoading: productsLoading } = useMyProducts({ page: 1, pageSize: 8 })
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()
  const { mutate: setThemeOverrideEnabled, isPending: isTogglingOverride } = useUpdateMyStore()

  const [themeId, setThemeId] = useState<ThemeId>('minimal')
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<ThemeCategory | 'all'>('all')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [accentColor, setAccentColor] = useState(DEFAULT_THEME_CONFIG.accentColor)
  const [buttonTextColor, setButtonTextColor] = useState(DEFAULT_THEME_CONFIG.buttonTextColor)
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_THEME_CONFIG.secondaryColor)
  const [buttonHoverAnimation, setButtonHoverAnimation] = useState<Required<ThemeConfig>['buttonHoverAnimation']>(DEFAULT_THEME_CONFIG.buttonHoverAnimation)
  const [buttonHoverColor, setButtonHoverColor] = useState(DEFAULT_THEME_CONFIG.buttonHoverColor)
  const [buttonHoverDurationMs, setButtonHoverDurationMs] = useState(DEFAULT_THEME_CONFIG.buttonHoverDurationMs)
  const [font, setFont] = useState<Required<ThemeConfig>['font']>(DEFAULT_THEME_CONFIG.font)
  const [cornerRadius, setCornerRadius] = useState<Required<ThemeConfig>['cornerRadius']>(DEFAULT_THEME_CONFIG.cornerRadius)
  const [sectionBackgroundColors, setSectionBackgroundColors] = useState(DEFAULT_THEME_CONFIG.sectionBackgroundColors)
  const [layoutWidth, setLayoutWidth] = useState(DEFAULT_THEME_CONFIG.layoutWidth)
  const [boxedMaxWidth, setBoxedMaxWidth] = useState(DEFAULT_THEME_CONFIG.boxedMaxWidth)
  const [boxedBackgroundColor, setBoxedBackgroundColor] = useState(DEFAULT_THEME_CONFIG.boxedBackgroundColor)
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [socialImageUrl, setSocialImageUrl] = useState('')
  const [showStoreName, setShowStoreName] = useState(DEFAULT_THEME_CONFIG.showStoreName)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [heroVideoMobileEnabled, setHeroVideoMobileEnabled] = useState(DEFAULT_THEME_CONFIG.heroVideoMobileEnabled)
  const [heroImageFit, setHeroImageFit] = useState<HeroImageFit>(DEFAULT_THEME_CONFIG.heroImageFit)
  const [heroImagePosition, setHeroImagePosition] = useState<HeroImagePosition>(DEFAULT_THEME_CONFIG.heroImagePosition)
  const [bannerType, setBannerType] = useState<BannerType>(DEFAULT_THEME_CONFIG.bannerType)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerColor, setBannerColor] = useState('')
  const [bannerPattern, setBannerPattern] = useState<BannerPattern>(DEFAULT_THEME_CONFIG.bannerPattern)
  const [bannerPlacement, setBannerPlacement] = useState<BannerPlacement>(DEFAULT_THEME_CONFIG.bannerPlacement)
  const [heroLayout, setHeroLayout] = useState<HeroLayout>(DEFAULT_THEME_CONFIG.heroLayout)
  const [heroHeight, setHeroHeight] = useState<HeroHeight>(DEFAULT_THEME_CONFIG.heroHeight)
  const [heroTextPosition, setHeroTextPosition] = useState<HeroTextPosition>(DEFAULT_THEME_CONFIG.heroTextPosition)
  const [heroMobileImage, setHeroMobileImage] = useState<HeroMobileImageVisibility>(DEFAULT_THEME_CONFIG.heroMobileImage)
  const [heroMobileImagePosition, setHeroMobileImagePosition] = useState<HeroMobileImagePosition>(DEFAULT_THEME_CONFIG.heroMobileImagePosition)
  const [heroMobileTextAlign, setHeroMobileTextAlign] = useState<HeroMobileTextAlign>(DEFAULT_THEME_CONFIG.heroMobileTextAlign)
  // Local UI-only state (not persisted) — which side of the Hero mobile-vs-desktop slot is shown.
  const [heroFieldDevice, setHeroFieldDevice] = useState<DeviceKind>('desktop')
  const [heroEyebrow, setHeroEyebrow] = useState(DEFAULT_THEME_CONFIG.heroEyebrow)
  const [heroEyebrowSize, setHeroEyebrowSize] = useState<HeroTextSize>(DEFAULT_THEME_CONFIG.heroEyebrowSize)
  const [heroHeadline, setHeroHeadline] = useState('')
  const [heroHeadlineSize, setHeroHeadlineSize] = useState<HeroTextSize>(DEFAULT_THEME_CONFIG.heroHeadlineSize)
  const [heroSubheadline, setHeroSubheadline] = useState('')
  const [heroSubheadlineSize, setHeroSubheadlineSize] = useState<HeroTextSize>(DEFAULT_THEME_CONFIG.heroSubheadlineSize)
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(DEFAULT_THEME_CONFIG.heroOverlayOpacity)
  const [heroTextTheme, setHeroTextTheme] = useState<HeroTextTheme>(DEFAULT_THEME_CONFIG.heroTextTheme)
  const [heroCtaEnabled, setHeroCtaEnabled] = useState(DEFAULT_THEME_CONFIG.heroCtaEnabled)
  const [heroCtaText, setHeroCtaText] = useState('')
  const [heroCtaLinkType, setHeroCtaLinkType] = useState<HeroCtaLinkType>(DEFAULT_THEME_CONFIG.heroCtaLinkType)
  const [heroCtaCategoryId, setHeroCtaCategoryId] = useState('')
  const [heroCtaCustomUrl, setHeroCtaCustomUrl] = useState('')
  const [heroSecondaryCtaEnabled, setHeroSecondaryCtaEnabled] = useState(DEFAULT_THEME_CONFIG.heroSecondaryCtaEnabled)
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState('')
  const [heroSecondaryCtaLinkType, setHeroSecondaryCtaLinkType] = useState<HeroCtaLinkType>(DEFAULT_THEME_CONFIG.heroSecondaryCtaLinkType)
  const [heroSecondaryCtaCategoryId, setHeroSecondaryCtaCategoryId] = useState('')
  const [heroSecondaryCtaCustomUrl, setHeroSecondaryCtaCustomUrl] = useState('')
  const [heroKenBurnsEnabled, setHeroKenBurnsEnabled] = useState(DEFAULT_THEME_CONFIG.heroKenBurnsEnabled)
  const [heroScrollIndicatorEnabled, setHeroScrollIndicatorEnabled] = useState(DEFAULT_THEME_CONFIG.heroScrollIndicatorEnabled)
  const [defaultLanguage, setDefaultLanguage] = useState(DEFAULT_THEME_CONFIG.defaultLanguage)
  const [textTranslations, setTextTranslations] = useState(DEFAULT_THEME_CONFIG.translations)
  const [seoTagline, setSeoTagline] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactLatitude, setContactLatitude] = useState<number | null>(null)
  const [contactLongitude, setContactLongitude] = useState<number | null>(null)
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialFacebook, setSocialFacebook] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [socialsPosition, setSocialsPosition] = useState<SocialsPosition>(DEFAULT_THEME_CONFIG.socialsPosition)
  const [showSaleCategory, setShowSaleCategory] = useState(DEFAULT_THEME_CONFIG.showSaleCategory)
  const [showSaleCategoryIcon, setShowSaleCategoryIcon] = useState(DEFAULT_THEME_CONFIG.showSaleCategoryIcon)
  const [navPageIds, setNavPageIds] = useState<string[]>(DEFAULT_THEME_CONFIG.navPageIds)
  const [searchBarLocation, setSearchBarLocation] = useState<SearchBarLocation>(DEFAULT_THEME_CONFIG.searchBarLocation)
  const [customSections, setCustomSections] = useState(DEFAULT_THEME_CONFIG.customSections)
  const [categoryMenuMode, setCategoryMenuMode] = useState<CategoryMenuMode>(DEFAULT_THEME_CONFIG.categoryMenuMode)
  const [categoryMenuScope, setCategoryMenuScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.categoryMenuScope)
  const [categoryMenuSelectedIds, setCategoryMenuSelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.categoryMenuSelectedIds)
  const [showLandingCategories, setShowLandingCategories] = useState(DEFAULT_THEME_CONFIG.showLandingCategories)
  const [landingCategoryScope, setLandingCategoryScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.landingCategoryScope)
  const [landingCategorySelectedIds, setLandingCategorySelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.landingCategorySelectedIds)
  const [landingCategoryColumns, setLandingCategoryColumns] = useState<LandingCategoryColumns>(DEFAULT_THEME_CONFIG.landingCategoryColumns)
  // Edited on the Layout tab, not here — kept in sync so this page's own preview/save still
  // reflects it accurately.
  const [showLandingCollections, setShowLandingCollections] = useState(DEFAULT_THEME_CONFIG.showLandingCollections)
  const [landingCollectionScope, setLandingCollectionScope] = useState(DEFAULT_THEME_CONFIG.landingCollectionScope)
  const [landingCollectionSelectedIds, setLandingCollectionSelectedIds] = useState(DEFAULT_THEME_CONFIG.landingCollectionSelectedIds)
  const [landingCollectionOrder, setLandingCollectionOrder] = useState(DEFAULT_THEME_CONFIG.landingCollectionOrder)
  const [landingCollectionTitleOverrides, setLandingCollectionTitleOverrides] = useState(DEFAULT_THEME_CONFIG.landingCollectionTitleOverrides)
  const [landingCollectionProductLimit, setLandingCollectionProductLimit] = useState(DEFAULT_THEME_CONFIG.landingCollectionProductLimit)
  const [footerContactForm, setFooterContactForm] = useState<FooterContactFormPosition>(DEFAULT_THEME_CONFIG.footerContactForm)
  const [showContactInNav, setShowContactInNav] = useState(DEFAULT_THEME_CONFIG.showContactInNav)
  const [contactLabel, setContactLabel] = useState(DEFAULT_THEME_CONFIG.contactLabel)
  // Edited on the Layout tab, not here — kept in sync so this page's own preview/save still
  // reflects it accurately.
  const [homeSectionOrder, setHomeSectionOrder] = useState(DEFAULT_THEME_CONFIG.homeSectionOrder)
  const [featuredProductsMode, setFeaturedProductsMode] = useState(DEFAULT_THEME_CONFIG.featuredProductsMode)
  const [featuredProductIds, setFeaturedProductIds] = useState(DEFAULT_THEME_CONFIG.featuredProductIds)
  const [contentHeading, setContentHeading] = useState('')
  const [contentBody, setContentBody] = useState('')
  const [contentImageUrl, setContentImageUrl] = useState('')
  const [contentImagePosition, setContentImagePosition] = useState(DEFAULT_THEME_CONFIG.contentImagePosition)
  const [contentButtonText, setContentButtonText] = useState('')
  const [contentButtonLink, setContentButtonLink] = useState('')
  const [announcementEnabled, setAnnouncementEnabled] = useState(DEFAULT_THEME_CONFIG.announcementEnabled)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementColor, setAnnouncementColor] = useState(DEFAULT_THEME_CONFIG.announcementColor)
  const [announcementLink, setAnnouncementLink] = useState('')
  const [announcementDismissible, setAnnouncementDismissible] = useState(DEFAULT_THEME_CONFIG.announcementDismissible)
  // Owned here — badge styling is a visual/branding concern like the rest of this page.
  const [badgeSaleEnabled, setBadgeSaleEnabled] = useState(DEFAULT_THEME_CONFIG.badgeSaleEnabled)
  const [badgeSaleText, setBadgeSaleText] = useState('')
  const [badgeSaleColor, setBadgeSaleColor] = useState(DEFAULT_THEME_CONFIG.badgeSaleColor)
  const [badgeNewEnabled, setBadgeNewEnabled] = useState(DEFAULT_THEME_CONFIG.badgeNewEnabled)
  const [badgeNewText, setBadgeNewText] = useState('')
  const [badgeNewColor, setBadgeNewColor] = useState('')
  const [badgeNewDays, setBadgeNewDays] = useState(DEFAULT_THEME_CONFIG.badgeNewDays)
  const [codEnabled, setCodEnabled] = useState(DEFAULT_THEME_CONFIG.codEnabled)
  const [codNotes, setCodNotes] = useState(DEFAULT_THEME_CONFIG.codNotes)
  const [bankTransferEnabled, setBankTransferEnabled] = useState(DEFAULT_THEME_CONFIG.bankTransferEnabled)
  const [bankTransferNotes, setBankTransferNotes] = useState(DEFAULT_THEME_CONFIG.bankTransferNotes)
  const [flittEnabled, setFlittEnabled] = useState(DEFAULT_THEME_CONFIG.flittEnabled)
  const [tbcEnabled, setTbcEnabled] = useState(DEFAULT_THEME_CONFIG.tbcEnabled)
  const [bogEnabled, setBogEnabled] = useState(DEFAULT_THEME_CONFIG.bogEnabled)
  const [cityPayEnabled, setCityPayEnabled] = useState(DEFAULT_THEME_CONFIG.cityPayEnabled)
  const [shippingZones, setShippingZones] = useState(DEFAULT_THEME_CONFIG.shippingZones)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_THEME_CONFIG.freeShippingThreshold)
  // Edited on the Layout tab, not here — kept in sync so this page's own preview/save still
  // reflects it accurately.
  const [footerCopyrightText, setFooterCopyrightText] = useState(DEFAULT_THEME_CONFIG.footerCopyrightText)
  const [showPlatformAttribution, setShowPlatformAttribution] = useState(DEFAULT_THEME_CONFIG.showPlatformAttribution)
  const [footerShowPaymentIcons, setFooterShowPaymentIcons] = useState(DEFAULT_THEME_CONFIG.footerShowPaymentIcons)
  const [footerShowLogo, setFooterShowLogo] = useState(DEFAULT_THEME_CONFIG.footerShowLogo)
  const [footerLinkColumns, setFooterLinkColumns] = useState(DEFAULT_THEME_CONFIG.footerLinkColumns)
  const [lowStockThreshold, setLowStockThreshold] = useState(DEFAULT_THEME_CONFIG.lowStockThreshold)
  const [lowStockMessage, setLowStockMessage] = useState(DEFAULT_THEME_CONFIG.lowStockMessage)
  const [showRelatedProducts, setShowRelatedProducts] = useState(DEFAULT_THEME_CONFIG.showRelatedProducts)
  const [relatedProductsHeading, setRelatedProductsHeading] = useState(DEFAULT_THEME_CONFIG.relatedProductsHeading)
  const [deliveryEstimateText, setDeliveryEstimateText] = useState(DEFAULT_THEME_CONFIG.deliveryEstimateText)
  const [trustBadges, setTrustBadges] = useState(DEFAULT_THEME_CONFIG.trustBadges)
  const [sizeGuideContent, setSizeGuideContent] = useState(DEFAULT_THEME_CONFIG.sizeGuideContent)
  const [offlineMode, setOfflineMode] = useState(DEFAULT_THEME_CONFIG.offlineMode)
  const [offlineMessage, setOfflineMessage] = useState(DEFAULT_THEME_CONFIG.offlineMessage)
  const [offlineReopenDate, setOfflineReopenDate] = useState(DEFAULT_THEME_CONFIG.offlineReopenDate)
  // Edited on the Layout tab, not here — kept in sync so this page's own preview/save still
  // reflects it accurately.
  const [checkoutNotesEnabled, setCheckoutNotesEnabled] = useState(DEFAULT_THEME_CONFIG.checkoutNotesEnabled)
  const [checkoutTosEnabled, setCheckoutTosEnabled] = useState(DEFAULT_THEME_CONFIG.checkoutTosEnabled)
  const [checkoutTosPageId, setCheckoutTosPageId] = useState(DEFAULT_THEME_CONFIG.checkoutTosPageId)
  const [checkoutThankYouHeading, setCheckoutThankYouHeading] = useState(DEFAULT_THEME_CONFIG.checkoutThankYouHeading)
  const [checkoutThankYouMessage, setCheckoutThankYouMessage] = useState(DEFAULT_THEME_CONFIG.checkoutThankYouMessage)
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(DEFAULT_THEME_CONFIG.showStickyMobileCta)
  const [storeHoursEnabled, setStoreHoursEnabled] = useState(DEFAULT_THEME_CONFIG.storeHoursEnabled)
  const [storeHours, setStoreHours] = useState(DEFAULT_THEME_CONFIG.storeHours)
  const [saleCountdownEnabled, setSaleCountdownEnabled] = useState(DEFAULT_THEME_CONFIG.saleCountdownEnabled)
  const [saleCountdownEndsAt, setSaleCountdownEndsAt] = useState(DEFAULT_THEME_CONFIG.saleCountdownEndsAt)
  const [saleCountdownText, setSaleCountdownText] = useState(DEFAULT_THEME_CONFIG.saleCountdownText)
  const [minOrderAmount, setMinOrderAmount] = useState(DEFAULT_THEME_CONFIG.minOrderAmount)
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_THEME_CONFIG.whatsappNumber)
  const [viberNumber, setViberNumber] = useState(DEFAULT_THEME_CONFIG.viberNumber)
  // Edited here on this page (Header + Hero Slides sections below).
  const [headerSticky, setHeaderSticky] = useState(DEFAULT_THEME_CONFIG.headerSticky)
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState(DEFAULT_THEME_CONFIG.headerBackgroundColor)
  const [heroSlides, setHeroSlides] = useState(DEFAULT_THEME_CONFIG.heroSlides)
  const [heroSlideUploading, setHeroSlideUploading] = useState<Record<number, boolean>>({})
  const [heroSlideVideoUploading, setHeroSlideVideoUploading] = useState<Record<number, boolean>>({})
  const [logoUploading, setLogoUploading] = useState(false)
  const [faviconUploading, setFaviconUploading] = useState(false)
  const [socialImageUploading, setSocialImageUploading] = useState(false)
  const [heroImageUploading, setHeroImageUploading] = useState(false)
  const [heroVideoUploading, setHeroVideoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Baseline snapshot of every field this page owns, captured once at hydration and refreshed
  // on every successful save — comparing the live `tokens` against this (see isDirty below) is
  // what powers the unsaved-changes warning, instead of tracking a dirty flag per individual field.
  const [savedSnapshot, setSavedSnapshot] = useState<(Required<ThemeConfig> & { themeId: ThemeId }) | null>(null)
  // Mirrors `isDirty` (computed below, after the loading early-return) into a ref so the
  // beforeunload/link-click listeners — registered once, before that early return, per the
  // Rules of Hooks — always read the current value without re-registering on every change.
  const isDirtyRef = useRef(false)

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    // Next's <Link> does its own client-side transition on the bubble phase, so a capture-phase
    // listener here runs first and can cancel it with preventDefault+stopPropagation before Next
    // ever sees the click — no changes needed to the shared sidebar or any individual link.
    function handleLinkClick(e: MouseEvent) {
      if (!isDirtyRef.current) return
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || anchor.target === '_blank') return
      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (!window.confirm('გაქვთ შეუნახავი ცვლილებები დიზაინის გვერდზე — მართლა გსურთ დატოვება მათი შენახვის გარეშე?')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [])

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setThemeId(isThemeId(store.themeId) ? store.themeId : 'minimal')
    setAccentColor(parsed.accentColor)
    setButtonTextColor(parsed.buttonTextColor)
    setSecondaryColor(parsed.secondaryColor)
    setButtonHoverAnimation(parsed.buttonHoverAnimation)
    setButtonHoverColor(parsed.buttonHoverColor)
    setButtonHoverDurationMs(parsed.buttonHoverDurationMs)
    setFont(parsed.font)
    setCornerRadius(parsed.cornerRadius)
    setSectionBackgroundColors(parsed.sectionBackgroundColors)
    setLayoutWidth(parsed.layoutWidth)
    setBoxedMaxWidth(parsed.boxedMaxWidth)
    setBoxedBackgroundColor(parsed.boxedBackgroundColor)
    setLogoUrl(parsed.logoUrl)
    setFaviconUrl(parsed.faviconUrl)
    setSocialImageUrl(parsed.socialImageUrl)
    setShowStoreName(parsed.showStoreName)
    setHeroImageUrl(parsed.heroImageUrl)
    setHeroVideoUrl(parsed.heroVideoUrl)
    setHeroVideoMobileEnabled(parsed.heroVideoMobileEnabled)
    setHeroImageFit(parsed.heroImageFit)
    setHeroImagePosition(parsed.heroImagePosition)
    setBannerType(parsed.bannerType)
    setBannerUrl(parsed.bannerUrl)
    setBannerColor(parsed.bannerColor)
    setBannerPattern(parsed.bannerPattern)
    setBannerPlacement(parsed.bannerPlacement)
    setHeroLayout(parsed.heroLayout)
    setHeroHeight(parsed.heroHeight)
    setHeroTextPosition(parsed.heroTextPosition)
    setHeroMobileImage(parsed.heroMobileImage)
    setHeroMobileImagePosition(parsed.heroMobileImagePosition)
    setHeroMobileTextAlign(parsed.heroMobileTextAlign)
    setHeroEyebrow(parsed.heroEyebrow)
    setHeroEyebrowSize(parsed.heroEyebrowSize)
    setHeroHeadline(parsed.heroHeadline)
    setHeroHeadlineSize(parsed.heroHeadlineSize)
    setHeroSubheadline(parsed.heroSubheadline)
    setHeroSubheadlineSize(parsed.heroSubheadlineSize)
    setHeroOverlayOpacity(parsed.heroOverlayOpacity)
    setHeroTextTheme(parsed.heroTextTheme)
    setHeroCtaEnabled(parsed.heroCtaEnabled)
    setHeroCtaText(parsed.heroCtaText)
    setHeroCtaLinkType(parsed.heroCtaLinkType)
    setHeroCtaCategoryId(parsed.heroCtaCategoryId)
    setHeroCtaCustomUrl(parsed.heroCtaCustomUrl)
    setHeroSecondaryCtaEnabled(parsed.heroSecondaryCtaEnabled)
    setHeroSecondaryCtaText(parsed.heroSecondaryCtaText)
    setHeroSecondaryCtaLinkType(parsed.heroSecondaryCtaLinkType)
    setHeroSecondaryCtaCategoryId(parsed.heroSecondaryCtaCategoryId)
    setHeroSecondaryCtaCustomUrl(parsed.heroSecondaryCtaCustomUrl)
    setHeroKenBurnsEnabled(parsed.heroKenBurnsEnabled)
    setHeroScrollIndicatorEnabled(parsed.heroScrollIndicatorEnabled)
    setDefaultLanguage(parsed.defaultLanguage)
    setTextTranslations(parsed.translations)
    setSeoTagline(parsed.seoTagline)
    setSeoDescription(parsed.seoDescription)
    setContactEmail(parsed.contactEmail)
    setContactPhone(parsed.contactPhone)
    setContactAddress(parsed.contactAddress)
    setContactLatitude(parsed.contactLatitude)
    setContactLongitude(parsed.contactLongitude)
    setSocialInstagram(parsed.socialInstagram)
    setSocialFacebook(parsed.socialFacebook)
    setSocialTiktok(parsed.socialTiktok)
    setSocialYoutube(parsed.socialYoutube)
    setSocialsPosition(parsed.socialsPosition)
    setShowSaleCategory(parsed.showSaleCategory)
    setShowSaleCategoryIcon(parsed.showSaleCategoryIcon)
    setNavPageIds(parsed.navPageIds)
    setSearchBarLocation(parsed.searchBarLocation)
    setCustomSections(parsed.customSections)
    setCategoryMenuMode(parsed.categoryMenuMode)
    setCategoryMenuScope(parsed.categoryMenuScope)
    setCategoryMenuSelectedIds(parsed.categoryMenuSelectedIds)
    setShowLandingCategories(parsed.showLandingCategories)
    setLandingCategoryScope(parsed.landingCategoryScope)
    setLandingCategorySelectedIds(parsed.landingCategorySelectedIds)
    setLandingCategoryColumns(parsed.landingCategoryColumns)
    setShowLandingCollections(parsed.showLandingCollections)
    setLandingCollectionScope(parsed.landingCollectionScope)
    setLandingCollectionSelectedIds(parsed.landingCollectionSelectedIds)
    setLandingCollectionOrder(parsed.landingCollectionOrder)
    setLandingCollectionTitleOverrides(parsed.landingCollectionTitleOverrides)
    setLandingCollectionProductLimit(parsed.landingCollectionProductLimit)
    setFooterContactForm(parsed.footerContactForm)
    setShowContactInNav(parsed.showContactInNav)
    setContactLabel(parsed.contactLabel)
    setHomeSectionOrder(parsed.homeSectionOrder)
    setFeaturedProductsMode(parsed.featuredProductsMode)
    setFeaturedProductIds(parsed.featuredProductIds)
    setContentHeading(parsed.contentHeading)
    setContentBody(parsed.contentBody)
    setContentImageUrl(parsed.contentImageUrl)
    setContentImagePosition(parsed.contentImagePosition)
    setContentButtonText(parsed.contentButtonText)
    setContentButtonLink(parsed.contentButtonLink)
    setAnnouncementEnabled(parsed.announcementEnabled)
    setAnnouncementText(parsed.announcementText)
    setAnnouncementColor(parsed.announcementColor)
    setAnnouncementLink(parsed.announcementLink)
    setAnnouncementDismissible(parsed.announcementDismissible)
    setBadgeSaleEnabled(parsed.badgeSaleEnabled)
    setBadgeSaleText(parsed.badgeSaleText)
    setBadgeSaleColor(parsed.badgeSaleColor)
    setBadgeNewEnabled(parsed.badgeNewEnabled)
    setBadgeNewText(parsed.badgeNewText)
    setBadgeNewColor(parsed.badgeNewColor)
    setBadgeNewDays(parsed.badgeNewDays)
    setCodEnabled(parsed.codEnabled)
    setCodNotes(parsed.codNotes)
    setBankTransferEnabled(parsed.bankTransferEnabled)
    setBankTransferNotes(parsed.bankTransferNotes)
    setFlittEnabled(parsed.flittEnabled)
    setTbcEnabled(parsed.tbcEnabled)
    setBogEnabled(parsed.bogEnabled)
    setCityPayEnabled(parsed.cityPayEnabled)
    setShippingZones(parsed.shippingZones)
    setFreeShippingThreshold(parsed.freeShippingThreshold)
    setFooterCopyrightText(parsed.footerCopyrightText)
    setShowPlatformAttribution(parsed.showPlatformAttribution)
    setFooterShowPaymentIcons(parsed.footerShowPaymentIcons)
    setFooterShowLogo(parsed.footerShowLogo)
    setFooterLinkColumns(parsed.footerLinkColumns)
    setLowStockThreshold(parsed.lowStockThreshold)
    setLowStockMessage(parsed.lowStockMessage)
    setShowRelatedProducts(parsed.showRelatedProducts)
    setRelatedProductsHeading(parsed.relatedProductsHeading)
    setDeliveryEstimateText(parsed.deliveryEstimateText)
    setTrustBadges(parsed.trustBadges)
    setSizeGuideContent(parsed.sizeGuideContent)
    setOfflineMode(parsed.offlineMode)
    setOfflineMessage(parsed.offlineMessage)
    setOfflineReopenDate(parsed.offlineReopenDate)
    setCheckoutNotesEnabled(parsed.checkoutNotesEnabled)
    setCheckoutTosEnabled(parsed.checkoutTosEnabled)
    setCheckoutTosPageId(parsed.checkoutTosPageId)
    setCheckoutThankYouHeading(parsed.checkoutThankYouHeading)
    setCheckoutThankYouMessage(parsed.checkoutThankYouMessage)
    setShowStickyMobileCta(parsed.showStickyMobileCta)
    setStoreHoursEnabled(parsed.storeHoursEnabled)
    setStoreHours(parsed.storeHours)
    setSaleCountdownEnabled(parsed.saleCountdownEnabled)
    setSaleCountdownEndsAt(parsed.saleCountdownEndsAt)
    setSaleCountdownText(parsed.saleCountdownText)
    setMinOrderAmount(parsed.minOrderAmount)
    setWhatsappNumber(parsed.whatsappNumber)
    setViberNumber(parsed.viberNumber)
    setHeaderSticky(parsed.headerSticky)
    setHeaderBackgroundColor(parsed.headerBackgroundColor)
    setHeroSlides(parsed.heroSlides)
    setSavedSnapshot({ themeId: isThemeId(store.themeId) ? store.themeId : 'minimal', ...parsed })
  }

  useEffect(() => {
    if (!previewFullscreen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewFullscreen])

  useEffect(() => {
    if (!themePickerOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setThemePickerOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [themePickerOpen])

  async function handleLogoFile(file: File) {
    setLogoUploading(true)
    try {
      setLogoUrl(await uploadImage(file))
    } catch {
      // keep previous logo on failure
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleFaviconFile(file: File) {
    setFaviconUploading(true)
    try {
      setFaviconUrl(await uploadImage(file))
    } catch {
      // keep previous favicon on failure
    } finally {
      setFaviconUploading(false)
    }
  }

  async function handleSocialImageFile(file: File) {
    setSocialImageUploading(true)
    try {
      setSocialImageUrl(await uploadImage(file))
    } catch {
      // keep previous image on failure
    } finally {
      setSocialImageUploading(false)
    }
  }

  async function handleHeroImageFile(file: File) {
    setHeroImageUploading(true)
    try {
      setHeroImageUrl(await uploadImage(file))
    } catch {
      // keep previous hero image on failure
    } finally {
      setHeroImageUploading(false)
    }
  }

  async function handleHeroVideoFile(file: File) {
    setHeroVideoUploading(true)
    try {
      setHeroVideoUrl(await uploadVideo(file))
    } catch {
      // keep previous hero video on failure
    } finally {
      setHeroVideoUploading(false)
    }
  }

  function addHeroSlide() {
    setHeroSlides(prev => [...prev, {
      imageUrl: '',
      videoUrl: '',
      eyebrow: '',
      headline: '',
      subheadline: '',
      ctaEnabled: true,
      ctaText: '',
      ctaLinkType: 'products',
      ctaCategoryId: '',
      ctaCustomUrl: '',
      secondaryCtaEnabled: false,
      secondaryCtaText: '',
      secondaryCtaLinkType: 'products',
      secondaryCtaCategoryId: '',
      secondaryCtaCustomUrl: '',
    }])
  }

  function removeHeroSlide(index: number) {
    setHeroSlides(prev => prev.filter((_, i) => i !== index))
  }

  function moveHeroSlide(index: number, direction: -1 | 1) {
    setHeroSlides(prev => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  function updateHeroSlide<K extends keyof HeroSlide>(index: number, field: K, value: HeroSlide[K]) {
    setHeroSlides(prev => prev.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)))
  }

  async function handleHeroSlideImageFile(index: number, file: File) {
    setHeroSlideUploading(prev => ({ ...prev, [index]: true }))
    try {
      const url = await uploadImage(file)
      updateHeroSlide(index, 'imageUrl', url)
    } catch {
      // keep previous slide image on failure
    } finally {
      setHeroSlideUploading(prev => ({ ...prev, [index]: false }))
    }
  }

  async function handleHeroSlideVideoFile(index: number, file: File) {
    setHeroSlideVideoUploading(prev => ({ ...prev, [index]: true }))
    try {
      const url = await uploadVideo(file)
      updateHeroSlide(index, 'videoUrl', url)
    } catch {
      // keep previous slide video on failure
    } finally {
      setHeroSlideVideoUploading(prev => ({ ...prev, [index]: false }))
    }
  }

  // Binds one top-level scalar ThemeConfig text field (e.g. heroHeadline) to a TranslatedField:
  // the "ka" tab reads/writes the existing base-language state as before, "en"/"ru" read/write
  // the translations sidecar keyed by the same field name.
  function themeTextBinding(
    field: keyof TranslatableThemeText,
    baseValue: string,
    setBaseValue: (v: string) => void
  ): { value: TranslatedFieldValue; onChange: (v: TranslatedFieldValue) => void } {
    return {
      value: { ka: baseValue, en: textTranslations.en?.[field] ?? '', ru: textTranslations.ru?.[field] ?? '' },
      onChange: v => {
        setBaseValue(v.ka)
        setTextTranslations(prev => ({
          en: { ...prev.en, [field]: v.en.trim() || undefined },
          ru: { ...prev.ru, [field]: v.ru.trim() || undefined },
        }))
      },
    }
  }

  async function handleBannerFile(file: File) {
    setBannerUploading(true)
    try {
      setBannerUrl(await uploadImage(file))
    } catch {
      // keep previous banner on failure
    } finally {
      setBannerUploading(false)
    }
  }

  function handleSave() {
    // Merge with the freshest saved translations rather than overwriting wholesale — this page
    // only edits a subset of the translatable fields (hero + badges); the rest (owned by other
    // settings pages) must survive even though this save resends the full ThemeConfig object.
    // Pulling only the fields this page actually owns out of `textTranslations` — rather than
    // spreading the whole locally-held snapshot — matters because that snapshot was hydrated
    // once at page load: if another settings tab saved a change to a field owned by IT in the
    // meantime, this page's stale copy of that field would otherwise silently overwrite it.
    const freshParsed = store ? parseThemeConfig(store.themeConfig) : DEFAULT_THEME_CONFIG
    const freshTranslations = freshParsed.translations
    const mergedTranslations = {
      en: {
        ...freshTranslations.en,
        heroEyebrow: textTranslations.en?.heroEyebrow,
        heroHeadline: textTranslations.en?.heroHeadline,
        heroSubheadline: textTranslations.en?.heroSubheadline,
        heroCtaText: textTranslations.en?.heroCtaText,
        heroSecondaryCtaText: textTranslations.en?.heroSecondaryCtaText,
        badgeSaleText: textTranslations.en?.badgeSaleText,
        badgeNewText: textTranslations.en?.badgeNewText,
      },
      ru: {
        ...freshTranslations.ru,
        heroEyebrow: textTranslations.ru?.heroEyebrow,
        heroHeadline: textTranslations.ru?.heroHeadline,
        heroSubheadline: textTranslations.ru?.heroSubheadline,
        heroCtaText: textTranslations.ru?.heroCtaText,
        heroSecondaryCtaText: textTranslations.ru?.heroSecondaryCtaText,
        badgeSaleText: textTranslations.ru?.badgeSaleText,
        badgeNewText: textTranslations.ru?.badgeNewText,
      },
    }
    updateStore(
      {
        themeId,
        themeConfig: JSON.stringify({
          defaultLanguage,
          translations: mergedTranslations,
          accentColor,
          buttonTextColor,
          secondaryColor,
          buttonHoverAnimation,
          buttonHoverColor: buttonHoverColor.trim() || undefined,
          buttonHoverDurationMs,
          font,
          cornerRadius,
          sectionBackgroundColors,
          layoutWidth,
          boxedMaxWidth,
          boxedBackgroundColor,
          logoUrl,
          showStoreName,
          heroImageUrl,
          heroVideoUrl,
          heroVideoMobileEnabled,
          heroImageFit,
          heroImagePosition,
          bannerType,
          bannerUrl,
          bannerColor,
          bannerPattern,
          bannerPlacement,
          heroLayout,
          heroHeight,
          heroTextPosition,
          heroMobileImage,
          heroMobileImagePosition,
          heroMobileTextAlign,
          heroEyebrow,
          heroEyebrowSize,
          heroHeadline,
          heroHeadlineSize,
          heroSubheadline,
          heroSubheadlineSize,
          heroOverlayOpacity,
          heroTextTheme,
          heroCtaEnabled,
          heroCtaText,
          heroCtaLinkType,
          heroCtaCategoryId,
          heroCtaCustomUrl: heroCtaCustomUrl.trim() || undefined,
          heroSecondaryCtaEnabled,
          heroSecondaryCtaText,
          heroSecondaryCtaLinkType,
          heroSecondaryCtaCategoryId,
          heroSecondaryCtaCustomUrl: heroSecondaryCtaCustomUrl.trim() || undefined,
          heroKenBurnsEnabled,
          heroScrollIndicatorEnabled,
          seoTagline: seoTagline.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          contactEmail,
          contactPhone,
          contactAddress,
          contactLatitude,
          contactLongitude,
          socialInstagram,
          socialFacebook,
          socialTiktok,
          socialYoutube,
          socialsPosition,
          showSaleCategory,
          showSaleCategoryIcon,
          navPageIds,
          searchBarLocation,
          customSections,
          categoryMenuMode,
          categoryMenuScope,
          categoryMenuSelectedIds,
          showLandingCategories,
          landingCategoryScope,
          landingCategorySelectedIds,
          landingCategoryColumns,
          showLandingCollections,
          landingCollectionScope,
          landingCollectionSelectedIds,
          landingCollectionOrder,
          landingCollectionTitleOverrides,
          landingCollectionProductLimit,
          footerContactForm,
          showContactInNav,
          contactLabel: contactLabel.trim() || undefined,
          homeSectionOrder,
          featuredProductsMode,
          featuredProductIds,
          contentHeading: contentHeading.trim() || undefined,
          contentBody: contentBody.trim() || undefined,
          contentImageUrl,
          contentImagePosition,
          contentButtonText: contentButtonText.trim() || undefined,
          contentButtonLink: contentButtonLink.trim() || undefined,
          announcementEnabled,
          announcementText: announcementText.trim() || undefined,
          announcementColor,
          announcementLink: announcementLink.trim() || undefined,
          announcementDismissible,
          badgeSaleEnabled,
          badgeSaleText: badgeSaleText.trim() || undefined,
          badgeSaleColor,
          badgeNewEnabled,
          badgeNewText: badgeNewText.trim() || undefined,
          badgeNewColor,
          badgeNewDays,
          codEnabled,
          codNotes,
          bankTransferEnabled,
          bankTransferNotes,
          flittEnabled,
          tbcEnabled,
          bogEnabled,
          cityPayEnabled,
          shippingZones,
          freeShippingThreshold,
          footerCopyrightText: footerCopyrightText.trim() || undefined,
          showPlatformAttribution,
          footerShowPaymentIcons,
          footerShowLogo,
          footerLinkColumns,
          lowStockThreshold,
          lowStockMessage: lowStockMessage.trim() || undefined,
          showRelatedProducts,
          relatedProductsHeading: relatedProductsHeading.trim() || undefined,
          deliveryEstimateText: deliveryEstimateText.trim() || undefined,
          trustBadges,
          sizeGuideContent: sizeGuideContent.trim() || undefined,
          offlineMode,
          offlineMessage: offlineMessage.trim() || undefined,
          offlineReopenDate,
          checkoutNotesEnabled,
          checkoutTosEnabled,
          checkoutTosPageId,
          checkoutThankYouHeading: checkoutThankYouHeading.trim() || undefined,
          checkoutThankYouMessage: checkoutThankYouMessage.trim() || undefined,
          showFaqSection: freshParsed.showFaqSection,
          faqHeading: freshParsed.faqHeading,
          faqItems: freshParsed.faqItems,
          showStickyMobileCta,
          storeHoursEnabled,
          storeHours,
          saleCountdownEnabled,
          saleCountdownEndsAt,
          saleCountdownText: saleCountdownText.trim() || undefined,
          facebookPixelId: freshParsed.facebookPixelId,
          googleAnalyticsId: freshParsed.googleAnalyticsId,
          tiktokPixelId: freshParsed.tiktokPixelId,
          minOrderAmount,
          whatsappNumber: whatsappNumber.trim() || undefined,
          viberNumber: viberNumber.trim() || undefined,
          pickupEnabled: freshParsed.pickupEnabled,
          pickupAddress: freshParsed.pickupAddress,
          pickupInstructions: freshParsed.pickupInstructions,
          headerSticky,
          headerBackgroundColor,
          heroSlides,
          faviconUrl,
          socialImageUrl,
        }),
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
          // Captured via closure from this same render's `tokens`/`themeId` (computed further
          // below in the function body) — safe because this callback only ever runs from a
          // later click, well after that `const` has finished initializing for the render.
          setSavedSnapshot({ themeId, ...tokens })
        },
      }
    )
  }

  if (isLoading || !store) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  const parsed = parseThemeConfig(store.themeConfig)
  const tokens: Required<ThemeConfig> = {
    defaultLanguage,
    translations: textTranslations,
    accentColor,
    buttonTextColor,
    secondaryColor,
    buttonHoverAnimation,
    buttonHoverColor,
    buttonHoverDurationMs,
    font,
    cornerRadius,
    sectionBackgroundColors,
    layoutWidth,
    boxedMaxWidth,
    boxedBackgroundColor,
    logoUrl,
    showStoreName,
    heroImageUrl,
    heroVideoUrl,
    heroVideoMobileEnabled,
    heroImageFit,
    heroImagePosition,
    bannerType,
    bannerUrl,
    bannerColor,
    bannerPattern,
    bannerPlacement,
    heroLayout,
    heroHeight,
    heroTextPosition,
    heroMobileImage,
    heroMobileImagePosition,
    heroMobileTextAlign,
    heroEyebrow,
    heroEyebrowSize,
    heroHeadline,
    heroHeadlineSize,
    heroSubheadline,
    heroSubheadlineSize,
    heroOverlayOpacity,
    heroTextTheme,
    heroCtaEnabled,
    heroCtaText,
    heroCtaLinkType,
    heroCtaCategoryId,
    heroCtaCustomUrl,
    heroSecondaryCtaEnabled,
    heroSecondaryCtaText,
    heroSecondaryCtaLinkType,
    heroSecondaryCtaCategoryId,
    heroSecondaryCtaCustomUrl,
    heroKenBurnsEnabled,
    heroScrollIndicatorEnabled,
    seoTagline,
    seoDescription,
    contactEmail,
    contactPhone,
    contactAddress,
    contactLatitude,
    contactLongitude,
    socialInstagram,
    socialFacebook,
    socialTiktok,
    socialYoutube,
    socialsPosition,
    showSaleCategory,
    showSaleCategoryIcon,
    navPageIds,
    searchBarLocation,
    customSections,
    categoryMenuMode,
    categoryMenuScope,
    categoryMenuSelectedIds,
    showLandingCategories,
    landingCategoryScope,
    landingCategorySelectedIds,
    landingCategoryColumns,
    showLandingCollections,
    landingCollectionScope,
    landingCollectionSelectedIds,
    landingCollectionOrder,
    landingCollectionTitleOverrides,
    landingCollectionProductLimit,
    footerContactForm,
    showContactInNav,
    contactLabel,
    homeSectionOrder,
    featuredProductsMode,
    featuredProductIds,
    contentHeading,
    contentBody,
    contentImageUrl,
    contentImagePosition,
    contentButtonText,
    contentButtonLink,
    announcementEnabled,
    announcementText,
    announcementColor,
    announcementLink,
    announcementDismissible,
    badgeSaleEnabled,
    badgeSaleText,
    badgeSaleColor,
    badgeNewEnabled,
    badgeNewText,
    badgeNewColor,
    badgeNewDays,
    codEnabled,
    codNotes,
    bankTransferEnabled,
    bankTransferNotes,
    flittEnabled,
    tbcEnabled,
    bogEnabled,
    cityPayEnabled,
    shippingZones,
    freeShippingThreshold,
    footerCopyrightText,
    showPlatformAttribution,
    footerShowPaymentIcons,
    footerShowLogo,
    footerLinkColumns,
    lowStockThreshold,
    lowStockMessage,
    showRelatedProducts,
    relatedProductsHeading,
    deliveryEstimateText,
    trustBadges,
    sizeGuideContent,
    offlineMode,
    offlineMessage,
    offlineReopenDate,
    checkoutNotesEnabled,
    checkoutTosEnabled,
    checkoutTosPageId,
    checkoutThankYouHeading,
    checkoutThankYouMessage,
    showFaqSection: parsed.showFaqSection,
    faqHeading: parsed.faqHeading,
    faqItems: parsed.faqItems,
    showStickyMobileCta,
    storeHoursEnabled,
    storeHours,
    saleCountdownEnabled,
    saleCountdownEndsAt,
    saleCountdownText,
    facebookPixelId: parsed.facebookPixelId,
    googleAnalyticsId: parsed.googleAnalyticsId,
    tiktokPixelId: parsed.tiktokPixelId,
    minOrderAmount,
    whatsappNumber,
    viberNumber,
    pickupEnabled: parsed.pickupEnabled,
    pickupAddress: parsed.pickupAddress,
    pickupInstructions: parsed.pickupInstructions,
    headerSticky,
    headerBackgroundColor,
    heroSlides,
    faviconUrl,
    socialImageUrl,
  }
  const isDirty = savedSnapshot !== null && !deepEqual({ themeId, ...tokens }, savedSnapshot)
  isDirtyRef.current = isDirty

  const previewProducts = productsPage?.items.length
    ? productsPage.items
    : productsLoading ? [] : PLACEHOLDER_PRODUCTS
  // Preview approximation only — built from the same small already-fetched page of products
  // rather than a per-collection network request (Collections aren't configured on this tab).
  const collectionProducts = new Map(
    (collections ?? []).map(collection => [
      collection.id,
      previewProducts.filter(p => p.collectionIds.includes(collection.id)),
    ])
  )
  const HeaderPreview = HEADERS[themeId]
  const FooterPreview = FOOTERS[themeId]
  const HomePreview = HOMES[themeId]

  const previewContent = (
    <div className={ALL_FONT_VARIABLE_CLASSES} style={{ fontFamily: getFontOption(font).fontFamily }}>
      <StorefrontLanguageProvider initialLang="ka">
        <StorefrontCartProvider slug={store.slug} preview>
          <AnnouncementBar slug={store.slug} tokens={tokens} />
          <HeaderPreview slug={store.slug} storeName={store.name} categories={categories ?? []} pages={pages ?? []} tokens={tokens} />
          <HomePreview
            slug={store.slug}
            store={store}
            categories={categories ?? []}
            collections={collections ?? []}
            collectionProducts={collectionProducts}
            products={previewProducts}
            tokens={tokens}
            t={storefrontT}
            lang="ka"
          />
          <FooterPreview slug={store.slug} storeName={store.name} tokens={tokens} pages={pages ?? []} t={storefrontT} lang="ka" />
        </StorefrontCartProvider>
      </StorefrontLanguageProvider>
    </div>
  )

  const previewControls = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-1">
        <button
          type="button"
          onClick={() => setPreviewMode('desktop')}
          aria-label="დესქტოპის გადახედვა"
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1.5" y="2.5" width="13" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('mobile')}
          aria-label="მობილურის გადახედვა"
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="4" y="1.5" width="8" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <button
        type="button"
        onClick={() => setPreviewFullscreen(v => !v)}
        aria-label={previewFullscreen ? 'სრულეკრანიდან გამოსვლა' : 'სრულეკრანიანი გადახედვა'}
        className="flex items-center justify-center w-7 h-7 rounded-md border border-white/10 bg-white/4 text-white/50 hover:text-white transition-colors"
      >
        {previewFullscreen ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  )

  return (
    <>
    <div className="flex flex-col gap-8 max-w-6xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">დიზაინი და თემა</h1>
        <p className="text-white/40 text-sm mt-1">ცვლილებები მყისიერად ახლდება გადახედვაში — არაფერი გამოქვეყნდება, სანამ არ შეინახავთ.</p>
      </div>

      {store.themeOverride && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-amber-300">✦ NipNip-ის მიერ დაყენებული საკუთარი თემა</p>
            <p className="text-white/40 text-xs mt-0.5">NipNip-მა თქვენს მაღაზიას დაუმატა დამატებითი სტილიზაცია ქვემოთ მოცემულ თემაზე. გამორთეთ, თუ არ გსურთ.</p>
          </div>
          <input
            type="checkbox"
            aria-label="NipNip-ის მიერ დაყენებული საკუთარი თემა"
            className={`toggle shrink-0 ${store.themeOverrideEnabled ? 'toggle-success' : ''}`}
            checked={store.themeOverrideEnabled}
            disabled={isTogglingOverride}
            onChange={e => setThemeOverrideEnabled({ themeOverrideEnabled: e.target.checked })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        <div className="flex flex-col gap-6">

          <SectionNav />

          <div id="section-theme" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <SwatchIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">თემა</h2>
            </div>

            <button
              type="button"
              onClick={() => setThemePickerOpen(true)}
              className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-[#14141c] px-3 py-2.5 text-left hover:border-white/25 transition-colors"
            >
              <div className="flex gap-1 shrink-0">
                {getThemeDefinition(themeId).swatch.map((color, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{getThemeDefinition(themeId).label}</p>
                <p className="text-white/40 text-xs leading-snug truncate">{getThemeDefinition(themeId).description}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden className="shrink-0 text-white/40">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {themePickerOpen && (
            <div
              className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
              onClick={() => setThemePickerOpen(false)}
            >
              <div
                className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#14141c] shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                  <h3 className="text-sm font-bold text-white">აირჩიეთ თემა</h3>
                  <button
                    type="button"
                    onClick={() => setThemePickerOpen(false)}
                    aria-label="დახურვა"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setThemeCategoryFilter('all')}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                      themeCategoryFilter === 'all' ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10',
                    ].join(' ')}
                  >
                    ყველა
                  </button>
                  {THEME_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setThemeCategoryFilter(cat.id)}
                      className={[
                        'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                        themeCategoryFilter === cat.id ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEMES.filter(theme => themeCategoryFilter === 'all' || theme.category === themeCategoryFilter).map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        const isUntouched = accentColor === getThemeDefinition(themeId).defaultAccentColor
                        setThemeId(theme.id)
                        if (isUntouched) setAccentColor(theme.defaultAccentColor)
                        setThemePickerOpen(false)
                      }}
                      className={[
                        'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                        themeId === theme.id ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 hover:border-white/25 hover:bg-white/5',
                      ].join(' ')}
                    >
                      <div className="flex gap-1 shrink-0 mt-0.5">
                        {theme.swatch.map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{theme.label}</p>
                        <p className="text-white/40 text-xs leading-snug mt-0.5">{theme.description}</p>
                      </div>
                      {themeId === theme.id && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-fuchsia-400 mt-0.5">
                          <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div id="section-colors" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center gap-2">
              <PaletteIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ფერები და ფონტი</h2>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">აქცენტის ფერი</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
                />
              </div>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                მეორადი ფერი <span className="text-white/25 normal-case">(მეორე ბრენდის ფერი)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
                />
              </div>
              <p className="text-white/30 text-xs mt-1">გამოიყენება ჰერო მეორადი ღილაკისთვის — მისცემს მაღაზიას ორი ტონის პალიტრას ერთი აქცენტის ნაცვლად.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ღილაკის ტექსტის ფერი</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(buttonTextColor) ? buttonTextColor : '#ffffff'}
                  onChange={e => setButtonTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={buttonTextColor}
                  onChange={e => setButtonTextColor(e.target.value)}
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
                />
              </div>
              <p className="text-white/30 text-xs mt-1">ტექსტისა და აიქონების ფერი შევსებულ, აქცენტის ფერიან ღილაკებზე.</p>
              <div className="flex flex-col gap-1.5 mt-1">
                <ContrastBadge foreground={buttonTextColor} background={accentColor} label="აქცენტის ღილაკზე" />
                <ContrastBadge foreground={buttonTextColor} background={secondaryColor} label="მეორადი ღილაკის ჰოვერზე" />
              </div>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ფონტი</label>
              <FontPicker value={font} onChange={setFont} />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">კუთხის მრგვალობა</label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'theme', label: 'თემის' },
                  { value: 'none', label: 'მკვეთრი' },
                  { value: 'md', label: 'რბილი' },
                  { value: '2xl', label: 'მრგვალი' },
                ] as { value: Required<ThemeConfig>['cornerRadius']; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCornerRadius(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      cornerRadius === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-1">
                გავლენას ახდენს მხოლოდ კალათის, გადახდის, ბანდლების და კონტაქტის გვერდებზე — მაღაზიის დანარჩენი ნაწილი ინარჩუნებს ამ თემის საკუთარ იერსახეს.
              </p>
            </div>
          </div>

          <div id="section-buttons" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center gap-2">
              <ButtonIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ღილაკები</h2>
            </div>
            <p className="text-white/30 text-xs -mt-3">როგორ რეაგირებენ ღილაკები კურსორის დაფარებაზე — მთელ მაღაზიაში.</p>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ჰოვერის ანიმაცია</label>
              <ButtonHoverAnimationPicker value={buttonHoverAnimation} onChange={setButtonHoverAnimation} accentColor={accentColor} />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ჰოვერის ფერი</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(buttonHoverColor) ? buttonHoverColor : shadeColor(accentColor, -15)}
                  onChange={e => setButtonHoverColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={buttonHoverColor}
                  onChange={e => setButtonHoverColor(e.target.value)}
                  placeholder="ავტომატური (აქცენტის მუქი ვერსია)"
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
                />
                {buttonHoverColor && (
                  <IconButton icon={<XIcon />} label="ავტომატურზე დაბრუნება" onClick={() => setButtonHoverColor('')} size="sm" className="shrink-0" />
                )}
              </div>
              <p className="text-white/30 text-xs mt-1">ცარიელი დატოვების შემთხვევაში ღილაკები ჰოვერზე გადადიან აქცენტის ფერის ავტომატურად გამოთვლილ მუქ ვერსიაზე.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ჰოვერის ხანგრძლივობა — {buttonHoverDurationMs}მწმ</label>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={buttonHoverDurationMs}
                onChange={e => setButtonHoverDurationMs(Number(e.target.value))}
                className="range range-xs accent-fuchsia-500"
              />
              <p className="text-white/30 text-xs">რამდენ ხანში სრულდება ანიმაცია. ნაგულისხმევი — 150მწმ.</p>
            </div>
          </div>

          <div id="section-branding" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center gap-2">
              <ImageIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ბრენდინგი</h2>
            </div>
            <ImageField label="ლოგო" value={logoUrl} uploading={logoUploading} onFile={handleLogoFile} onClear={() => setLogoUrl('')} />
            {logoUrl && (
              <label className="flex items-center gap-3 cursor-pointer -mt-2">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={e => setShowStoreName(e.target.checked)}
                  className={`toggle toggle-sm ${showStoreName ? 'toggle-success' : 'toggle-error'}`}
                />
                <span className="text-sm text-white/70">მაღაზიის სახელის ჩვენება ლოგოსთან</span>
              </label>
            )}
            <ImageField label="ფავიკონი" value={faviconUrl} uploading={faviconUploading} onFile={handleFaviconFile} onClear={() => setFaviconUrl('')} />
            <p className="text-white/30 text-xs -mt-3">ბრაუზერის ჩანართის ხატულა. გამოიყენეთ კვადრატული სურათი — ცარიელი დატოვების შემთხვევაში დაბრუნდება თქვენს ლოგოზე.</p>
            <ImageField label="სოც. ქსელის გაზიარების სურათი" value={socialImageUrl} uploading={socialImageUploading} onFile={handleSocialImageFile} onClear={() => setSocialImageUrl('')} />
            <p className="text-white/30 text-xs -mt-3">ჩნდება თქვენი მაღაზიის ბმულის სოციალურ ქსელებში ან მესენჯერებში გაზიარებისას. ცარიელი დატოვების შემთხვევაში დაბრუნდება თქვენს ჰერო სურათზე ან ლოგოზე.</p>
          </div>

          <div id="section-header" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center gap-2">
              <HeaderBarIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ჰედერი</h2>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">მიმაგრებული ჰედერი (რჩება ხილვადი სქროლისას)</span>
              <input
                type="checkbox"
                checked={headerSticky}
                onChange={e => setHeaderSticky(e.target.checked)}
                className={`toggle toggle-sm ${headerSticky ? 'toggle-success' : ''}`}
              />
            </label>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ჰედერის ფონის ფერი</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(headerBackgroundColor) ? headerBackgroundColor : '#ffffff'}
                  onChange={e => setHeaderBackgroundColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={headerBackgroundColor}
                  onChange={e => setHeaderBackgroundColor(e.target.value)}
                  placeholder="ცარიელი დატოვება თემის ნაგულისხმევისთვის"
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
                {headerBackgroundColor && (
                  <IconButton
                    icon={<XIcon />}
                    label="ფონის ფერის გასუფთავება"
                    onClick={() => setHeaderBackgroundColor('')}
                    size="sm"
                    className="shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          <div id="section-hero" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center gap-2">
              <HeroSectionIcon className="text-white/40" />
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ჰერო სექცია</h2>
            </div>

            <ImageField label="ჰერო სურათი" value={heroImageUrl} uploading={heroImageUploading} onFile={handleHeroImageFile} onClear={() => setHeroImageUrl('')} />
            <p className="text-white/30 text-xs -mt-3">ჩნდება თქვენი ჰერო ტექსტის გვერდით, როცა ქვემოთ განლაგება დაყენებულია „სურათი მარცხნივ/მარჯვნივ“-ზე, ან ივსება მთელ სექციაზე „ფონის ფოტო“-ს არჩევისას.</p>

            {heroImageUrl && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სურათის მორგება</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'contain', label: 'მთლიანი სურათის მორგება', desc: 'არაფერი იჭრება' },
                      { value: 'cover', label: 'სივრცის შევსება', desc: 'იჭრება კიდემდე შესავსებად' },
                    ] as { value: HeroImageFit; label: string; desc: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHeroImageFit(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-left transition-colors',
                          heroImageFit === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10'
                            : 'border-white/10 bg-white/4 hover:border-white/25',
                        ].join(' ')}
                      >
                        <p className={`text-xs font-medium ${heroImageFit === opt.value ? 'text-white' : 'text-white/50'}`}>{opt.label}</p>
                        <p className="text-white/30 text-[10px] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {heroImageFit === 'cover' && (
                  <div className="fieldset gap-2">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ფოკუსის პოზიცია</label>
                    <div className="grid grid-cols-5 gap-2">
                      {([
                        { value: 'left', label: 'მარცხნივ' },
                        { value: 'top', label: 'ზემოთ' },
                        { value: 'center', label: 'ცენტრში' },
                        { value: 'bottom', label: 'ქვემოთ' },
                        { value: 'right', label: 'მარჯვნივ' },
                      ] as { value: HeroImagePosition; label: string }[]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHeroImagePosition(opt.value)}
                          className={[
                            'rounded-lg border px-2 py-2 text-[11px] font-medium text-center transition-colors',
                            heroImagePosition === opt.value
                              ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                              : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs mt-1">სურათის რომელი ნაწილი დარჩება ხილვადი, როცა ის იჭრება სივრცის შესავსებად.</p>
                  </div>
                )}
              </>
            )}

            <div className="fieldset gap-2 pt-3 border-t border-white/5">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">განლაგება</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'center', label: '🎯 ცენტრირებული' },
                  { value: 'imageLeft', label: '⬅️ სურათი მარცხნივ' },
                  { value: 'imageRight', label: '➡️ სურათი მარჯვნივ' },
                  { value: 'background', label: '🖼️ ფონის ფოტო' },
                ] as { value: HeroLayout; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHeroLayout(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      heroLayout === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {heroLayout !== 'center' && !heroImageUrl && (
                <p className="text-amber-400/80 text-xs mt-1">დაამატეთ ჰერო სურათი ზემოთ — ამის გარეშე ეს განლაგება ცენტრირებულზე დაბრუნდება.</p>
              )}
              {heroLayout === 'background' && heroImageUrl && (
                <p className="text-white/30 text-xs mt-1">თქვენი ჰერო ფოტო ავსებს მთელ სექციას — გამოიყენეთ ტექსტის ფერი ქვემოთ, რომ სათაური იკითხებოდეს.</p>
              )}
            </div>

            {heroLayout === 'background' ? (
              <p className="text-white/25 text-xs -mt-1">
                ბანერის ფონის პარამეტრები დამალულია — თქვენი ჰერო ფოტო უკვე ავსებს მთელ სექციას, ასე რომ მათ ვერაფერს დაანახებდით.
              </p>
            ) : (
              <div className="fieldset gap-3 -mt-1">
                <div className="flex items-center gap-2">
                  <BannerIcon className="text-white/30" />
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ბანერის ფონი</label>
                </div>
                <p className="text-white/30 text-xs -mt-2">ფონი, რომელიც ჩნდება ჰერო სექციის უკან, ან მხოლოდ ჰერო სურათის უკან.</p>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტიპი</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'image', label: 'სურათი' },
                      { value: 'color', label: 'ფერი' },
                      { value: 'pattern', label: 'ნიმუში' },
                    ] as { value: BannerType; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBannerType(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          bannerType === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {bannerType === 'image' && (
                  <ImageField label="ბანერის სურათი" value={bannerUrl} uploading={bannerUploading} onFile={handleBannerFile} onClear={() => setBannerUrl('')} />
                )}

                {bannerType === 'color' && (
                  <div className="fieldset gap-2">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ფერი</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bannerColor || '#111111'}
                        onChange={e => setBannerColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bannerColor}
                        onChange={e => setBannerColor(e.target.value)}
                        placeholder="#111111"
                        className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 font-mono"
                      />
                    </div>
                  </div>
                )}

                {bannerType === 'pattern' && (
                  <>
                    <div className="fieldset gap-2">
                      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ნიმუში</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BANNER_PATTERNS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBannerPattern(opt.value)}
                            className={[
                              'rounded-lg border px-2 py-2 text-xs font-medium text-center transition-colors',
                              bannerPattern === opt.value
                                ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                                : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                            ].join(' ')}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="fieldset gap-2">
                      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტონის ფერი</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={bannerColor || accentColor}
                          onChange={e => setBannerColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bannerColor}
                          onChange={e => setBannerColor(e.target.value)}
                          placeholder={accentColor}
                          className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">განთავსება</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'section', label: 'მთელი სექციის უკან' },
                      { value: 'behindImage', label: 'მხოლოდ ჰერო სურათის უკან' },
                    ] as { value: BannerPlacement; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBannerPlacement(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          bannerPlacement === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {bannerPlacement === 'behindImage' && heroLayout === 'center' && (
                    <p className="text-amber-400/80 text-xs mt-1">დააყენეთ ზემოთ განლაგება „სურათი მარცხნივ/მარჯვნივ“-ზე — ცენტრირებულ ჰეროს არ აქვს სურათი, რომლის უკანაც განთავსდება.</p>
                  )}
                </div>
              </div>
            )}

            {heroLayout === 'background' && heroImageUrl && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                  ფოტოს დაბნელება — {heroOverlayOpacity}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={heroOverlayOpacity}
                  onChange={e => setHeroOverlayOpacity(Number(e.target.value))}
                  className="range range-xs accent-fuchsia-500"
                />
                <p className="text-white/30 text-xs">ფოტოს ჩამუქება, რომ ტექსტი გამოირჩეოდეს. 0% ინარჩუნებს სრულ სიკაშკაშეს.</p>
              </div>
            )}

            {heroLayout === 'background' && heroImageUrl && (
              <div className="rounded-xl border border-white/7 bg-white/2 p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-white">ჰერო ვიდეო ფონი</p>
                  <p className="text-white/30 text-xs mt-0.5">უკრავს დადუმებულად და მარყუჟში ფოტოს ნაცვლად. ზემოთ მოცემული ფოტო კვლავ ემსახურება საწყის კადრს და მობილურის სათადარიგოს.</p>
                </div>
                <VideoField label="ვიდეო" value={heroVideoUrl} uploading={heroVideoUploading} onFile={handleHeroVideoFile} onClear={() => setHeroVideoUrl('')} />
                {heroVideoUrl && (
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <span className="text-sm text-white/70">ავტომატური დაკვრა მობილურზეც</span>
                    <input
                      type="checkbox"
                      checked={heroVideoMobileEnabled}
                      onChange={e => setHeroVideoMobileEnabled(e.target.checked)}
                      className={`toggle toggle-sm ${heroVideoMobileEnabled ? 'toggle-success' : ''}`}
                    />
                  </label>
                )}
                {!heroVideoUrl && (
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <span className="text-sm text-white/70">ნელი გადიდების ეფექტი (Ken Burns)</span>
                    <input
                      type="checkbox"
                      checked={heroKenBurnsEnabled}
                      onChange={e => setHeroKenBurnsEnabled(e.target.checked)}
                      className={`toggle toggle-sm ${heroKenBurnsEnabled ? 'toggle-success' : ''}`}
                    />
                  </label>
                )}
              </div>
            )}

            {heroLayout === 'background' && heroImageUrl && (
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm text-white/70">ჩამოსქროლვის ინდიკატორი</p>
                  <p className="text-white/30 text-xs mt-0.5">პატარა ანიმირებული ისარი ჰეროს ბოლოში.</p>
                </div>
                <input
                  type="checkbox"
                  checked={heroScrollIndicatorEnabled}
                  onChange={e => setHeroScrollIndicatorEnabled(e.target.checked)}
                  className={`toggle toggle-sm shrink-0 ${heroScrollIndicatorEnabled ? 'toggle-success' : ''}`}
                />
              </label>
            )}

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტექსტის ფერი</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'auto', label: 'ავტომატური' },
                  { value: 'light', label: 'ღია' },
                  { value: 'dark', label: 'მუქი' },
                ] as { value: HeroTextTheme; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHeroTextTheme(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      heroTextTheme === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-1">ავტომატური იყენებს ამ თემის ჩვეულ ფერებს. გადართეთ ღიაზე ან მუქზე, როცა ფოტო ართულებს ნაგულისხმევი ტექსტის წაკითხვას.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სიმაღლე</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'small', label: 'პატარა' },
                  { value: 'medium', label: 'საშუალო' },
                  { value: 'large', label: 'დიდი' },
                ] as { value: HeroHeight; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHeroHeight(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      heroHeight === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტექსტის პოზიცია</label>
              <div className="grid grid-cols-3 gap-1.5 w-32">
                {HERO_TEXT_POSITIONS.map(pos => {
                  const [v, h] = pos.split('-') as ['top' | 'middle' | 'bottom', 'left' | 'center' | 'right']
                  const justify = h === 'left' ? 'justify-start' : h === 'right' ? 'justify-end' : 'justify-center'
                  const items = v === 'top' ? 'items-start' : v === 'bottom' ? 'items-end' : 'items-center'
                  const active = heroTextPosition === pos
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setHeroTextPosition(pos)}
                      aria-label={pos}
                      className={[
                        'aspect-square rounded-md border flex p-1.5 transition-colors',
                        justify,
                        items,
                        active ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 bg-white/4 hover:border-white/25',
                      ].join(' ')}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-fuchsia-400' : 'bg-white/40'}`} />
                    </button>
                  )
                })}
              </div>
              <p className="text-white/30 text-xs mt-1">სად მდებარეობს სათაური/ტექსტი ჰეროში — ასევე განსაზღვრავს ტექსტის სწორებას.</p>
            </div>

            <div className="fieldset gap-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">როგორ გამოჩნდება</label>
                <DeviceFieldToggle value={heroFieldDevice} onChange={setHeroFieldDevice} />
              </div>

              {heroFieldDevice === 'desktop' ? (
                <div className="rounded-xl bg-white/2 border border-white/5 px-4 py-3 flex flex-col gap-1.5">
                  <p className="text-xs text-white/50">
                    სურათი: <span className="text-white/80 font-medium">
                      {heroLayout === 'background' ? 'ფონი მთელ სექციაზე' : heroLayout === 'center' ? 'არ არის' : heroLayout === 'imageLeft' ? 'მარცხნივ' : 'მარჯვნივ'}
                    </span>
                  </p>
                  <p className="text-xs text-white/50">
                    ტექსტის სწორება: <span className="text-white/80 font-medium">
                      {heroTextPosition.endsWith('left') ? 'მარცხნივ' : heroTextPosition.endsWith('right') ? 'მარჯვნივ' : 'ცენტრში'}
                    </span>
                  </p>
                  <p className="text-white/30 text-[11px] mt-0.5">იცვლება ზემოთ „განლაგება“ და „ტექსტის პოზიცია“-დან — გადადით „მობილურზე“, რომ ეს გადაფაროთ ვიწრო ეკრანებისთვის.</p>
                </div>
              ) : (
                <>
                  <div className="fieldset gap-2">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ჰერო სურათი მობილურზე</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'show', label: 'ჩვენება' },
                        { value: 'hide', label: 'დამალვა' },
                      ] as { value: HeroMobileImageVisibility; label: string }[]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHeroMobileImage(opt.value)}
                          className={[
                            'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                            heroMobileImage === opt.value
                              ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                              : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {heroLayout !== 'center' && heroMobileImage === 'show' && (
                    <div className="fieldset gap-2">
                      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სურათის პოზიცია მობილურზე</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { value: 'inherit', label: 'ავტომატური' },
                          { value: 'top', label: 'ზემოთ' },
                          { value: 'bottom', label: 'ქვემოთ' },
                        ] as { value: HeroMobileImagePosition; label: string }[]).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setHeroMobileImagePosition(opt.value)}
                            className={[
                              'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                              heroMobileImagePosition === opt.value
                                ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                                : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                            ].join(' ')}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-white/30 text-xs mt-1">დალაგების თანმიმდევრობა ვიწრო ეკრანებზე — დამოუკიდებელია ზემოთ მოცემული მარცხნივ/მარჯვნივ განლაგებისგან.</p>
                    </div>
                  )}

                  <div className="fieldset gap-2">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ტექსტის სწორება მობილურზე</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { value: 'inherit', label: 'ავტომატური' },
                        { value: 'left', label: 'მარცხნივ' },
                        { value: 'center', label: 'ცენტრში' },
                        { value: 'right', label: 'მარჯვნივ' },
                      ] as { value: HeroMobileTextAlign; label: string }[]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHeroMobileTextAlign(opt.value)}
                          className={[
                            'rounded-lg border px-2 py-2 text-xs font-medium text-center transition-colors',
                            heroMobileTextAlign === opt.value
                              ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                              : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ზედწერილი</label>
              <TranslatedField
                {...themeTextBinding('heroEyebrow', heroEyebrow, setHeroEyebrow)}
                placeholders={{ ka: 'მოგესალმებით', en: 'Welcome', ru: 'Добро пожаловать' }}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
              <p className="text-white/30 text-xs">პატარა ლეიბლი სათაურის ზემოთ. გაასუფთავეთ, რომ საერთოდ დამალოთ.</p>
              <HeroTextSizePicker value={heroEyebrowSize} onChange={setHeroEyebrowSize} />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">სათაური</label>
              <TranslatedField
                {...themeTextBinding('heroHeadline', heroHeadline, setHeroHeadline)}
                placeholders={{ ka: store.name, en: store.name, ru: store.name }}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
              <HeroTextSizePicker value={heroHeadlineSize} onChange={setHeroHeadlineSize} />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ქვესათაური</label>
              <TranslatedField
                {...themeTextBinding('heroSubheadline', heroSubheadline, setHeroSubheadline)}
                multiline
                rows={2}
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
              <HeroTextSizePicker value={heroSubheadlineSize} onChange={setHeroSubheadlineSize} />
            </div>
          </div>

          <div id="section-hero-cta" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ButtonIcon className="text-white/40" />
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ჰერო ღილაკი</h2>
              </div>
              <input
                type="checkbox"
                checked={heroCtaEnabled}
                onChange={e => setHeroCtaEnabled(e.target.checked)}
                className={`toggle toggle-sm ${heroCtaEnabled ? 'toggle-success' : 'toggle-error'}`}
              />
            </div>

            {heroCtaEnabled && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ღილაკის ტექსტი</label>
                  <TranslatedField
                    {...themeTextBinding('heroCtaText', heroCtaText, setHeroCtaText)}
                    placeholders={{ ka: 'ყველა პროდუქტის ნახვა', en: 'View all products', ru: 'Смотреть все товары' }}
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                  <p className="text-white/30 text-xs">ცარიელი დატოვება ნაგულისხმევი ტექსტის გამოსაყენებლად.</p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მიმართავს ვიზიტორებს</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'products', label: 'ყველა პროდუქტი' },
                      { value: 'category', label: 'კატეგორია' },
                      { value: 'custom', label: 'საკუთარი ბმული' },
                    ] as { value: HeroCtaLinkType; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHeroCtaLinkType(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          heroCtaLinkType === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {heroCtaLinkType === 'category' && (
                    <select
                      value={heroCtaCategoryId}
                      onChange={e => setHeroCtaCategoryId(e.target.value)}
                      className="select w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 mt-1"
                    >
                      <option value="">აირჩიეთ კატეგორია…</option>
                      {(categories ?? []).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}

                  {heroCtaLinkType === 'custom' && (
                    <input
                      type="text"
                      value={heroCtaCustomUrl}
                      onChange={e => setHeroCtaCustomUrl(e.target.value)}
                      placeholder="/products/category/shoes ან https://…"
                      className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 mt-1"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div id="section-hero-secondary-cta" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ButtonIcon className="text-white/40" />
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ჰერო მეორადი ღილაკი</h2>
              </div>
              <input
                type="checkbox"
                checked={heroSecondaryCtaEnabled}
                onChange={e => setHeroSecondaryCtaEnabled(e.target.checked)}
                className={`toggle toggle-sm ${heroSecondaryCtaEnabled ? 'toggle-success' : 'toggle-error'}`}
              />
            </div>

            {heroSecondaryCtaEnabled && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">ღილაკის ტექსტი</label>
                  <TranslatedField
                    {...themeTextBinding('heroSecondaryCtaText', heroSecondaryCtaText, setHeroSecondaryCtaText)}
                    placeholders={{ ka: 'მეტის ნახვა', en: 'Learn more', ru: 'Узнать больше' }}
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                  <p className="text-white/30 text-xs">ცარიელი დატოვება ნაგულისხმევი ტექსტის გამოსაყენებლად.</p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">მიმართავს ვიზიტორებს</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'products', label: 'ყველა პროდუქტი' },
                      { value: 'category', label: 'კატეგორია' },
                      { value: 'custom', label: 'საკუთარი ბმული' },
                    ] as { value: HeroCtaLinkType; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHeroSecondaryCtaLinkType(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          heroSecondaryCtaLinkType === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {heroSecondaryCtaLinkType === 'category' && (
                    <select
                      value={heroSecondaryCtaCategoryId}
                      onChange={e => setHeroSecondaryCtaCategoryId(e.target.value)}
                      className="select w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 mt-1"
                    >
                      <option value="">აირჩიეთ კატეგორია…</option>
                      {(categories ?? []).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}

                  {heroSecondaryCtaLinkType === 'custom' && (
                    <input
                      type="text"
                      value={heroSecondaryCtaCustomUrl}
                      onChange={e => setHeroSecondaryCtaCustomUrl(e.target.value)}
                      placeholder="/products/category/shoes ან https://…"
                      className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 mt-1"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div id="section-hero-slides" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div>
              <div className="flex items-center gap-2">
                <StackIcon className="text-white/40" />
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ჰერო სლაიდები</h2>
              </div>
              <p className="text-white/30 text-xs mt-1">
                სურვილისამებრ — დაამატეთ 2 ან მეტი სლაიდი, რომ ზემოთ მოცემული ჰერო ავტომატურად მოძრავ კარუსელად აქციოთ. განლაგება, სიმაღლე და
                ტექსტის პოზიცია რჩება ისეთი, როგორც ზემოთ დააყენეთ; თითოეულ სლაიდს აქვს საკუთარი სურათი, ტექსტი და ღილაკი.
              </p>
            </div>

            {heroSlides.length > 0 && (
              <div className="flex flex-col gap-3">
                {heroSlides.map((slide, i) => (
                  <HeroSlideFields
                    key={i}
                    slide={slide}
                    index={i}
                    total={heroSlides.length}
                    categories={categories ?? []}
                    uploading={!!heroSlideUploading[i]}
                    onFile={file => handleHeroSlideImageFile(i, file)}
                    videoUploading={!!heroSlideVideoUploading[i]}
                    onVideoFile={file => handleHeroSlideVideoFile(i, file)}
                    onChange={(field, value) => updateHeroSlide(i, field, value)}
                    onMove={direction => moveHeroSlide(i, direction)}
                    onRemove={() => removeHeroSlide(i)}
                  />
                ))}
              </div>
            )}

            <IconButton icon={<PlusIcon />} label="სლაიდის დამატება" onClick={addHeroSlide} size="sm" className="self-start" />
          </div>

          <div id="section-badges" className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5 scroll-mt-20">
            <div>
              <div className="flex items-center gap-2">
                <TagBadgeIcon className="text-white/40" />
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">პროდუქტის ბეჯები</h2>
              </div>
              <p className="text-white/30 text-xs mt-1">პატარა ლეიბლები, რომლებიც ჩნდება თქვენი ბადის პროდუქტის ფოტოებზე.</p>
            </div>

            <div className="flex flex-col gap-3 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">ფასდაკლების ბეჯი</p>
                <input
                  type="checkbox"
                  checked={badgeSaleEnabled}
                  onChange={e => setBadgeSaleEnabled(e.target.checked)}
                  className={`toggle toggle-sm ${badgeSaleEnabled ? 'toggle-success' : 'toggle-error'}`}
                />
              </div>
              {badgeSaleEnabled && (
                <div className="flex items-center gap-3">
                  <TranslatedField
                    {...themeTextBinding('badgeSaleText', badgeSaleText, setBadgeSaleText)}
                    placeholders={{ ka: 'ფასდაკლება', en: 'Sale', ru: 'Скидка' }}
                    className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                  <input
                    type="color"
                    value={badgeSaleColor}
                    onChange={e => setBadgeSaleColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                  />
                </div>
              )}
              <p className="text-white/30 text-xs">ავტომატურად ჩნდება ნებისმიერ პროდუქტზე ფასდაკლებული ფასით.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">„ახალი“ ბეჯი</p>
                <input
                  type="checkbox"
                  checked={badgeNewEnabled}
                  onChange={e => setBadgeNewEnabled(e.target.checked)}
                  className={`toggle toggle-sm ${badgeNewEnabled ? 'toggle-success' : 'toggle-error'}`}
                />
              </div>
              {badgeNewEnabled && (
                <>
                  <div className="flex items-center gap-3">
                    <TranslatedField
                      {...themeTextBinding('badgeNewText', badgeNewText, setBadgeNewText)}
                      placeholders={{ ka: 'ახალი', en: 'New', ru: 'Новинка' }}
                      className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                    />
                    <input
                      type="color"
                      value={badgeNewColor || accentColor}
                      onChange={e => setBadgeNewColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                    />
                  </div>
                  <div className="fieldset gap-2">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                      ითვლება ახლად — {badgeNewDays} დღის განმავლობაში
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      step={1}
                      value={badgeNewDays}
                      onChange={e => setBadgeNewDays(Number(e.target.value))}
                      className="range range-xs accent-fuchsia-500"
                    />
                  </div>
                </>
              )}
              <p className="text-white/30 text-xs">ჩნდება არჩეულ პერიოდში დამატებულ პროდუქტებზე, თუ მათზე უკვე არ ჩანს ფასდაკლების ბეჯი.</p>
            </div>
          </div>

        </div>

        {!previewFullscreen && (
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">ცოცხალი გადახედვა</p>
              {previewControls}
            </div>
            <div className={`rounded-2xl border border-white/10 overflow-hidden h-[720px] ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text}`}>
              <PreviewFrame mode={previewMode}>{previewContent}</PreviewFrame>
            </div>
          </div>
        )}

        {previewFullscreen && (
          <div className="fixed inset-0 z-[100] bg-[#08080d] flex flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">ცოცხალი გადახედვა</p>
              {previewControls}
            </div>
            <div className={`flex-1 rounded-2xl border border-white/10 overflow-hidden ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text}`}>
              <PreviewFrame mode={previewMode}>{previewContent}</PreviewFrame>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 border-t border-white/10 bg-[#0b0b12]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {error && (
          <div className="flex-1 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ცვლილებების შენახვა ვერ მოხერხდა.
          </div>
        )}
        {saved && (
          <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            წარმატებით შეინახა
          </div>
        )}
        {!error && !saved && isDirty && (
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            შეუნახავი ცვლილებები
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 ${error || saved || isDirty ? '' : 'w-full'}`}
        >
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'თემის შენახვა'}
        </button>
      </div>
    </div>
    </>
  )
}
