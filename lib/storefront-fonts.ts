import localFont from 'next/font/local'
import {
  Inter,
  Poppins,
  Montserrat,
  Playfair_Display,
  Merriweather,
  Roboto_Mono,
  Oswald,
  Raleway,
  Lora,
  Nunito,
  Bebas_Neue,
  Space_Grotesk,
} from 'next/font/google'

// --- Google Fonts (Latin) — a curated set, not the full Google Fonts catalog, since
// next/font requires each family to be statically imported at module scope. ---

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-montserrat' })
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-playfair-display' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-roboto-mono' })
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-oswald' })
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-raleway' })
const lora = Lora({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-lora' })
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-nunito' })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-space-grotesk' })

// --- Georgian fonts — self-hosted, sourced from fonts.ge, since Google Fonts' Georgian
// coverage is thin. ---

const alkSanet = localFont({ src: './fonts/georgian/alk-sanet.ttf', variable: '--font-alk-sanet' })
const bpgArial2009 = localFont({ src: './fonts/georgian/bpg-arial-2009.ttf', variable: '--font-bpg-arial' })
const bpgExtrasquareMtavruli = localFont({ src: '../public/fonts/bpg_extrasquare_mtavruli_2009.ttf', variable: '--font-bpg-extrasquare-mtavruli' })
const bpgGlaho = localFont({ src: './fonts/georgian/bpg-glaho.ttf', variable: '--font-bpg-glaho' })
const bpgGlahoSylfaen = localFont({ src: './fonts/georgian/bpg-glaho-sylfaen.ttf', variable: '--font-bpg-glaho-sylfaen' })
const bpgMrgvlovaniCaps = localFont({ src: './fonts/georgian/bpg-mrgvlovani-caps-2010.ttf', variable: '--font-bpg-mrgvlovani-caps' })
const bpgNinoMtavruliBold = localFont({ src: './fonts/georgian/bpg-nino-mtavruli-bold.ttf', variable: '--font-bpg-nino-mtavruli-bold' })

export type FontCategory = 'default' | 'georgian' | 'latin'

export interface FontOption {
  key: string
  label: string
  category: FontCategory
  /** CSS font-family value — either a generic stack (defaults) or a next/font CSS variable. */
  fontFamily: string
  /** Space-joined className(s) that must be present somewhere in the tree for the variable to exist. Empty for generic-stack defaults. */
  variableClassName: string
  /** Georgian sample phrase shown in the picker so the merchant can actually judge the glyphs. */
  sampleText?: string
}

export const FONT_OPTIONS: FontOption[] = [
  { key: 'sans', label: 'Sans-serif (default)', category: 'default', fontFamily: 'ui-sans-serif, system-ui, sans-serif', variableClassName: '' },
  { key: 'serif', label: 'Serif (default)', category: 'default', fontFamily: 'ui-serif, Georgia, serif', variableClassName: '' },
  { key: 'mono', label: 'Monospace (default)', category: 'default', fontFamily: 'ui-monospace, monospace', variableClassName: '' },

  { key: 'alk-sanet', label: 'Alk Sanet', category: 'georgian', fontFamily: 'var(--font-alk-sanet)', variableClassName: alkSanet.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-arial', label: 'BPG Arial 2009', category: 'georgian', fontFamily: 'var(--font-bpg-arial)', variableClassName: bpgArial2009.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-extrasquare-mtavruli', label: 'BPG ExtraSquare Mtavruli', category: 'georgian', fontFamily: 'var(--font-bpg-extrasquare-mtavruli)', variableClassName: bpgExtrasquareMtavruli.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-glaho', label: 'BPG Glaho', category: 'georgian', fontFamily: 'var(--font-bpg-glaho)', variableClassName: bpgGlaho.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-glaho-sylfaen', label: 'BPG Glaho Sylfaen', category: 'georgian', fontFamily: 'var(--font-bpg-glaho-sylfaen)', variableClassName: bpgGlahoSylfaen.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-mrgvlovani-caps', label: 'BPG Mrgvlovani Caps', category: 'georgian', fontFamily: 'var(--font-bpg-mrgvlovani-caps)', variableClassName: bpgMrgvlovaniCaps.variable, sampleText: 'მაღაზიის სახელი' },
  { key: 'bpg-nino-mtavruli-bold', label: 'BPG Nino Mtavruli Bold', category: 'georgian', fontFamily: 'var(--font-bpg-nino-mtavruli-bold)', variableClassName: bpgNinoMtavruliBold.variable, sampleText: 'მაღაზიის სახელი' },

  { key: 'inter', label: 'Inter', category: 'latin', fontFamily: 'var(--font-inter)', variableClassName: inter.variable },
  { key: 'poppins', label: 'Poppins', category: 'latin', fontFamily: 'var(--font-poppins)', variableClassName: poppins.variable },
  { key: 'montserrat', label: 'Montserrat', category: 'latin', fontFamily: 'var(--font-montserrat)', variableClassName: montserrat.variable },
  { key: 'playfair-display', label: 'Playfair Display', category: 'latin', fontFamily: 'var(--font-playfair-display)', variableClassName: playfairDisplay.variable },
  { key: 'merriweather', label: 'Merriweather', category: 'latin', fontFamily: 'var(--font-merriweather)', variableClassName: merriweather.variable },
  { key: 'roboto-mono', label: 'Roboto Mono', category: 'latin', fontFamily: 'var(--font-roboto-mono)', variableClassName: robotoMono.variable },
  { key: 'oswald', label: 'Oswald', category: 'latin', fontFamily: 'var(--font-oswald)', variableClassName: oswald.variable },
  { key: 'raleway', label: 'Raleway', category: 'latin', fontFamily: 'var(--font-raleway)', variableClassName: raleway.variable },
  { key: 'lora', label: 'Lora', category: 'latin', fontFamily: 'var(--font-lora)', variableClassName: lora.variable },
  { key: 'nunito', label: 'Nunito', category: 'latin', fontFamily: 'var(--font-nunito)', variableClassName: nunito.variable },
  { key: 'bebas-neue', label: 'Bebas Neue', category: 'latin', fontFamily: 'var(--font-bebas-neue)', variableClassName: bebasNeue.variable },
  { key: 'space-grotesk', label: 'Space Grotesk', category: 'latin', fontFamily: 'var(--font-space-grotesk)', variableClassName: spaceGrotesk.variable },
]

const FONT_OPTIONS_BY_KEY = new Map(FONT_OPTIONS.map(f => [f.key, f]))

// All font-variable classNames joined — applied once per storefront page so every font's CSS
// variable exists regardless of which one the store actually picked (cheap: next/font only
// downloads the woff2 subset actually referenced via font-family, not all of them upfront).
export const ALL_FONT_VARIABLE_CLASSES = FONT_OPTIONS
  .map(f => f.variableClassName)
  .filter(Boolean)
  .join(' ')

export function getFontOption(key: string): FontOption {
  return FONT_OPTIONS_BY_KEY.get(key) ?? FONT_OPTIONS_BY_KEY.get('sans')!
}

export function getFontFamily(key: string): string {
  return getFontOption(key).fontFamily
}
