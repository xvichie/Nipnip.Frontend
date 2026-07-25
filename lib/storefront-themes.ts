import type { ThemeId } from '@/lib/types/storefront'

export type ThemeCategory = 'general' | 'flowers' | 'kids' | 'sports' | 'food'

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'general', label: 'ზოგადი' },
  { id: 'flowers', label: 'ყვავილები და საჩუქრები' },
  { id: 'kids', label: 'ბავშვები და სათამაშოები' },
  { id: 'sports', label: 'სპორტი' },
  { id: 'food', label: 'საკვები და დელიკატესები' },
]

export interface ThemeDefinition {
  id: ThemeId
  label: string
  description: string
  category: ThemeCategory
  swatch: string[]
  radius: 'none' | 'md' | '2xl'
  defaultAccentColor: string
  dark: boolean
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'minimal',
    label: 'მინიმალური',
    description: 'სუფთა, მკაფიო დიზაინი — თეთრი ფონი, მარტივი ხაზები, დიდი ასოებით წარწერები.',
    category: 'general',
    swatch: ['#ffffff', '#111111', '#e5e5e5'],
    radius: 'none',
    defaultAccentColor: '#111111',
    dark: false,
  },
  {
    id: 'bold',
    label: 'თამამი',
    description: 'მუქი ფონი კაშკაშა აქცენტით, მომრგვალო ბარათები და დიდი სურათები.',
    category: 'general',
    swatch: ['#0a0a0a', '#a855f7', '#ffffff'],
    radius: '2xl',
    defaultAccentColor: '#a855f7',
    dark: true,
  },
  {
    id: 'classic',
    label: 'კლასიკური',
    description: 'რბილი, ნეიტრალური ფონი, ნაზი ჩრდილები — ტრადიციული კატალოგის ბადე.',
    category: 'general',
    swatch: ['#fafafa', '#111111', '#ffffff'],
    radius: 'md',
    defaultAccentColor: '#111111',
    dark: false,
  },
  {
    id: 'luxury',
    label: 'ლუქსი',
    description: 'სპილენძისფერი ფონი, სერიფული შრიფტი, წვრილი ოქროსფერი აქცენტები — ბუტიკის განწყობა.',
    category: 'general',
    swatch: ['#faf7f2', '#1c1a17', '#9c7a4a'],
    radius: 'none',
    defaultAccentColor: '#9c7a4a',
    dark: false,
  },
  {
    id: 'vibrant',
    label: 'ცოცხალი',
    description: 'მხიარული, ფერადი მარკეტი — მომრგვალო ჭიპები, ენერგიული, კორალისფერი აქცენტი.',
    category: 'general',
    swatch: ['#fffaf5', '#ff5a3c', '#111111'],
    radius: '2xl',
    defaultAccentColor: '#ff5a3c',
    dark: false,
  },
  {
    id: 'commerce',
    label: 'კომერცია',
    description: 'მკვრივი კატალოგის ბადე ფასდაკლების ბეჯებითა და ფილტრის პანელით — მრავალპროდუქტიანი მაღაზიებისთვის.',
    category: 'general',
    swatch: ['#ffffff', '#0f172a', '#2563eb'],
    radius: 'md',
    defaultAccentColor: '#2563eb',
    dark: false,
  },
  {
    id: 'editorial',
    label: 'სარედაქციო',
    description: 'ჟურნალის სტილის განლაგება გამორჩეული პროდუქტით — ვიზუალური თხრობისთვის.',
    category: 'general',
    swatch: ['#ffffff', '#111111', '#c81e3a'],
    radius: 'none',
    defaultAccentColor: '#c81e3a',
    dark: false,
  },
  {
    id: 'flower',
    label: 'ყვავილები',
    description: 'რბილი, ვარდისფერ-კრემისფერი პალიტრა მომრგვალო ფორმებით — ყვავილებისა და საჩუქრების მაღაზიებისთვის.',
    category: 'flowers',
    swatch: ['#fdf6f2', '#c65d7b', '#7c9473'],
    radius: '2xl',
    defaultAccentColor: '#c65d7b',
    dark: false,
  },
  {
    id: 'kids',
    label: 'ბავშვები',
    description: 'მხიარული, კანფეტისფერი პალიტრა ბუშტისებრი, მომრგვალო ფორმებით — სათამაშოებისა და საბავშვო ტანსაცმლის მაღაზიებისთვის.',
    category: 'kids',
    swatch: ['#fffbea', '#ff6fae', '#3fc5f0'],
    radius: '2xl',
    defaultAccentColor: '#ff6fae',
    dark: false,
  },
  {
    id: 'sports',
    label: 'სპორტი',
    description: 'მკვეთრი, მაღალი კონტრასტის მუქი თემა თამამი წარწერებითა და ნეონისფერი აქცენტით — სპორტული საქონლისთვის.',
    category: 'sports',
    swatch: ['#0d0f0d', '#c8ff00', '#ffffff'],
    radius: 'none',
    defaultAccentColor: '#c8ff00',
    dark: true,
  },
  {
    id: 'chocolate',
    label: 'შოკოლადი',
    description: 'თბილი კაკაოსა და კრემისფერი პალიტრა სერიფული შრიფტით — შოკოლადისა და დელიკატესების მაღაზიებისთვის.',
    category: 'food',
    swatch: ['#f7ede0', '#3b2418', '#b5651d'],
    radius: 'none',
    defaultAccentColor: '#b5651d',
    dark: false,
  },
]

export function getThemeDefinition(themeId: string): ThemeDefinition {
  return THEMES.find(t => t.id === themeId) ?? THEMES[0]
}

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some(t => t.id === value)
}

export const RADIUS_CLASS: Record<ThemeDefinition['radius'], string> = {
  none: '',
  md: 'rounded-md',
  '2xl': 'rounded-2xl',
}

export interface SurfaceClasses {
  page: string
  card: string
  text: string
  muted: string
  border: string
  inputBg: string
}

export const SURFACE_CLASSES: Record<ThemeId, SurfaceClasses> = {
  minimal: {
    page: 'bg-white',
    card: 'bg-white',
    text: 'text-[#111]',
    muted: 'text-[#999]',
    border: 'border-[#e5e5e5]',
    inputBg: 'bg-white',
  },
  bold: {
    page: 'bg-[#0a0a0a]',
    card: 'bg-white/[0.04]',
    text: 'text-white',
    muted: 'text-white/40',
    border: 'border-white/10',
    inputBg: 'bg-white/[0.06]',
  },
  classic: {
    page: 'bg-[#fafafa]',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-400',
    border: 'border-gray-200',
    inputBg: 'bg-white',
  },
  luxury: {
    page: 'bg-[#faf7f2]',
    card: 'bg-[#faf7f2]',
    text: 'text-[#1c1a17]',
    muted: 'text-[#9c8f7e]',
    border: 'border-[#1c1a17]/10',
    inputBg: 'bg-[#faf7f2]',
  },
  vibrant: {
    page: 'bg-[#fffaf5]',
    card: 'bg-white',
    text: 'text-[#1a1a1a]',
    muted: 'text-[#a89a90]',
    border: 'border-[#f0e4da]',
    inputBg: 'bg-white',
  },
  commerce: {
    page: 'bg-white',
    card: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    border: 'border-slate-200',
    inputBg: 'bg-white',
  },
  editorial: {
    page: 'bg-white',
    card: 'bg-white',
    text: 'text-[#111111]',
    muted: 'text-[#767676]',
    border: 'border-black/10',
    inputBg: 'bg-white',
  },
  flower: {
    page: 'bg-[#fdf6f2]',
    card: 'bg-white',
    text: 'text-[#3d2b28]',
    muted: 'text-[#a4897f]',
    border: 'border-[#f3e3de]',
    inputBg: 'bg-white',
  },
  kids: {
    page: 'bg-[#fffbea]',
    card: 'bg-white',
    text: 'text-[#2b2b2b]',
    muted: 'text-[#9a9a9a]',
    border: 'border-[#ffe9d2]',
    inputBg: 'bg-white',
  },
  sports: {
    page: 'bg-[#0d0f0d]',
    card: 'bg-white/[0.04]',
    text: 'text-white',
    muted: 'text-white/40',
    border: 'border-white/10',
    inputBg: 'bg-white/[0.06]',
  },
  chocolate: {
    page: 'bg-[#f7ede0]',
    card: 'bg-white',
    text: 'text-[#3b2418]',
    muted: 'text-[#a68a6d]',
    border: 'border-[#3b2418]/10',
    inputBg: 'bg-white',
  },
}
