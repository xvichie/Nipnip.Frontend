import type { ThemeId } from '@/lib/types/storefront'

export type ThemeCategory = 'general' | 'flowers' | 'kids' | 'sports' | 'food' | 'handmade' | 'furniture'

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'general', label: 'ზოგადი' },
  { id: 'flowers', label: 'ყვავილები და საჩუქრები' },
  { id: 'kids', label: 'ბავშვები და სათამაშოები' },
  { id: 'sports', label: 'სპორტი' },
  { id: 'food', label: 'საკვები და დელიკატესები' },
  { id: 'handmade', label: 'ხელნაკეთი ნივთები' },
  { id: 'furniture', label: 'ავეჯი და დეკორი' },
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
  {
    id: 'athletic',
    label: 'ატლეტიკა',
    description: 'თეთრი ფონი მკვეთრი წითელი აქცენტით, მკვრივი კატალოგი და ფასდაკლების ბეჯები — სპორტული აღჭურვილობისა და ტანსაცმლის მაღაზიებისთვის.',
    category: 'sports',
    swatch: ['#ffffff', '#0f0f0f', '#ff3b30'],
    radius: 'none',
    defaultAccentColor: '#ff3b30',
    dark: false,
  },
  {
    id: 'handmade',
    label: 'ხელნაკეთი',
    description: 'თბილი crafts-სტილის პალიტრა თიხისფერი აქცენტით — ხელნაკეთი ნივთების, კერამიკისა და ხელოსნური ნაწარმის მაღაზიებისთვის.',
    category: 'handmade',
    swatch: ['#f4ede3', '#2b2420', '#a1512e'],
    radius: 'none',
    defaultAccentColor: '#a1512e',
    dark: false,
  },
  {
    id: 'furniture',
    label: 'ავეჯი',
    description: 'თბილი, ნეიტრალური ფონი კაკლის ხისფერი აქცენტით და სუფთა ხაზებით — ავეჯისა და საშინაო დეკორის მაღაზიებისთვის.',
    category: 'furniture',
    swatch: ['#f6f4f1', '#1f1d1b', '#7a5233'],
    radius: 'none',
    defaultAccentColor: '#7a5233',
    dark: false,
  },
  {
    id: 'varsity',
    label: 'გუნდური',
    description: 'თეთრი ფონი მუქი ლურჯი და ოქროსფერი აქცენტებით, მკვეთრი ხაზები — სპორტული კლუბებისა და გუნდური ტანსაცმლის მაღაზიებისთვის.',
    category: 'sports',
    swatch: ['#ffffff', '#1d3557', '#e8a92d'],
    radius: 'none',
    defaultAccentColor: '#e8a92d',
    dark: false,
  },
  {
    id: 'wooden',
    label: 'ხის სათამაშოები',
    description: 'რბილი, ბუნებრივი კრემისფერი პალიტრა თაფლისფერი აქცენტით — ხის და საგანმანათლებლო სათამაშოების მაღაზიებისთვის.',
    category: 'kids',
    swatch: ['#faf6ef', '#4a3f35', '#e0a730'],
    radius: 'md',
    defaultAccentColor: '#e0a730',
    dark: false,
  },
  {
    id: 'industrial',
    label: 'ინდუსტრიული',
    description: 'მუქი ბეტონისფერი ფონი ფოლადისფერი აქცენტით — ინდუსტრიული სტილის ავეჯისა და დეკორის მაღაზიებისთვის.',
    category: 'furniture',
    swatch: ['#1c1c1c', '#f2f2f0', '#5c7a89'],
    radius: 'none',
    defaultAccentColor: '#5c7a89',
    dark: true,
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
  athletic: {
    page: 'bg-white',
    card: 'bg-white',
    text: 'text-[#0f0f0f]',
    muted: 'text-[#8a8a8a]',
    border: 'border-[#e8e8e8]',
    inputBg: 'bg-white',
  },
  handmade: {
    page: 'bg-[#f4ede3]',
    card: 'bg-[#f4ede3]',
    text: 'text-[#2b2420]',
    muted: 'text-[#8f8274]',
    border: 'border-[#2b2420]/10',
    inputBg: 'bg-[#f4ede3]',
  },
  furniture: {
    page: 'bg-[#f6f4f1]',
    card: 'bg-[#f6f4f1]',
    text: 'text-[#1f1d1b]',
    muted: 'text-[#8c877e]',
    border: 'border-[#e6e1d9]',
    inputBg: 'bg-[#f6f4f1]',
  },
  varsity: {
    page: 'bg-white',
    card: 'bg-white',
    text: 'text-[#1d3557]',
    muted: 'text-[#7d8a9a]',
    border: 'border-[#e3e7ec]',
    inputBg: 'bg-white',
  },
  wooden: {
    page: 'bg-[#faf6ef]',
    card: 'bg-white',
    text: 'text-[#4a3f35]',
    muted: 'text-[#a89a8c]',
    border: 'border-[#e8ddd0]',
    inputBg: 'bg-white',
  },
  industrial: {
    page: 'bg-[#1c1c1c]',
    card: 'bg-[#242422]',
    text: 'text-[#f2f2f0]',
    muted: 'text-[#8a8a86]',
    border: 'border-[#3a3a38]',
    inputBg: 'bg-[#242422]',
  },
}
