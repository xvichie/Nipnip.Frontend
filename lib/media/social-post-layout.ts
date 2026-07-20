// Pure geometry + canvas-drawing helpers for the social post creator. Kept framework-free so
// the interactive drag preview (CSS percentages) and the final PNG bake (canvas pixels) share
// the exact same math and never visually drift apart.

export interface Vec2 {
  x: number
  y: number
}

export interface PlatformSize {
  key: string
  width: number
  height: number
}

// Widely-recommended current sizes per platform. Product Page matches this app's own
// storefront product-card convention (aspect-square).
export const PLATFORM_SIZES: PlatformSize[] = [
  { key: 'facebook', width: 1200, height: 630 },
  { key: 'instagram-post', width: 1080, height: 1080 },
  { key: 'instagram-story', width: 1080, height: 1920 },
  { key: 'tiktok', width: 1080, height: 1920 },
  { key: 'product-page', width: 1200, height: 1200 },
]

export type LayoutKey = 'centered' | 'rotated' | 'bottom-crop'
export const LAYOUT_KEYS: LayoutKey[] = ['centered', 'rotated', 'bottom-crop']

export type BackgroundMode = 'solid' | 'pattern'
export type PatternKey = 'dots' | 'stripes' | 'grid' | 'checkerboard' | 'waves'
export const PATTERN_KEYS: PatternKey[] = ['dots', 'stripes', 'grid', 'checkerboard', 'waves']

export const COLOR_PRESETS = [
  '#ffffff', '#0a0a0a', '#f5efe6', '#fbd5df', '#cfe8ff', '#d9ead3', '#e8ddc8', '#1b2a4a',
  '#ffe3b3', '#e0c3fc', '#c8f4de', '#ffc9c9', '#b3e5fc', '#fff2a8', '#2d2d3a', '#f0e6ff',
]

export const DEFAULT_ANCHOR: Vec2 = { x: 0.5, y: 0.5 }

export function clamp01(n: number): number {
  return Math.min(Math.max(n, 0), 1)
}

// --- Per-layout editable state (product position + optional price/logo badges) ---

export interface ProductLayerState {
  anchor: Vec2
  scale: number
  rotationDeg: number
}

export interface BadgeLayerState {
  visible: boolean
  position: Vec2
}

export interface PriceLayerState extends BadgeLayerState {
  text: string
}

export interface LayoutEditState {
  product: ProductLayerState
  price: PriceLayerState
  logo: BadgeLayerState
}

export function makeDefaultLayoutEditState(defaultPriceText: string): LayoutEditState {
  return {
    product: { anchor: { ...DEFAULT_ANCHOR }, scale: 1, rotationDeg: 0 },
    price: { visible: false, text: defaultPriceText, position: { x: 0.84, y: 0.86 } },
    logo: { visible: false, position: { x: 0.16, y: 0.14 } },
  }
}

export const PRODUCT_SCALE_MIN = 0.4
export const PRODUCT_SCALE_MAX = 2.5
export const PRODUCT_ROTATION_MIN = -180
export const PRODUCT_ROTATION_MAX = 180

// --- Background ---

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150
}

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, pattern: PatternKey | null) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  if (!pattern) return

  const accent = isLightColor(color) ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.10)'
  const accentSoft = isLightColor(color) ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.06)'

  if (pattern === 'dots') {
    const spacing = Math.max(28, Math.round(w / 20))
    const radius = spacing * 0.1
    ctx.fillStyle = accent
    for (let y = spacing / 2; y < h; y += spacing) {
      for (let x = spacing / 2; x < w; x += spacing) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (pattern === 'stripes') {
    const spacing = Math.max(32, Math.round(w / 16))
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, w, h)
    ctx.clip()
    ctx.strokeStyle = accent
    ctx.lineWidth = spacing * 0.45
    for (let x = -h; x < w + h; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + h, h)
      ctx.stroke()
    }
    ctx.restore()
  } else if (pattern === 'grid') {
    const spacing = Math.max(36, Math.round(w / 14))
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    for (let x = 0; x <= w; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += spacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  } else if (pattern === 'checkerboard') {
    const spacing = Math.max(40, Math.round(w / 12))
    ctx.fillStyle = accent
    let row = 0
    for (let y = 0; y < h; y += spacing, row++) {
      for (let x = row % 2 === 0 ? 0 : spacing; x < w; x += spacing * 2) {
        ctx.fillRect(x, y, spacing, spacing)
      }
    }
  } else if (pattern === 'waves') {
    const spacing = Math.max(30, Math.round(h / 14))
    const amplitude = spacing * 0.35
    ctx.strokeStyle = accentSoft
    ctx.lineWidth = 2
    for (let baseY = spacing; baseY < h + amplitude; baseY += spacing) {
      ctx.beginPath()
      for (let x = 0; x <= w; x += 4) {
        const y = baseY + Math.sin((x / w) * Math.PI * 4) * amplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }
}

// --- Product placement ---

export interface Placement {
  x: number
  y: number
  w: number
  h: number
  rotationDeg: number
}

// Fraction of the frame's shorter-fitting dimension the product occupies at scale=1, before
// the user's own scale/rotation/position adjustments.
const CENTERED_FIT = 0.72
const ROTATED_FIT = 0.5
export const CLOSE_UP_ZOOM = 1.6

// Canvas rotation is clockwise for positive angles (y-down coordinate space). +45 here is
// what visually reads as "tilted to the left" in this app — confirmed against the rendered
// output, not derived from the coordinate math alone.
const ROTATED_ANGLE_DEG = 45

// All three layouts place the product the same way — translate to an anchor point, rotate,
// draw centered on that point — they only differ in the base fit-scale and base rotation.
// The canvas naturally clips anything drawn outside its own bounds, so "bottom-crop" (which
// draws well beyond a cover fit) needs no separate crop/sample step: it's just a bigger sticker.
export function computeProductPlacement(layout: LayoutKey, frameW: number, frameH: number, imgW: number, imgH: number, product: ProductLayerState): Placement {
  let baseScale: number
  let baseRotation: number
  if (layout === 'bottom-crop') {
    baseScale = Math.max(frameW / imgW, frameH / imgH) * CLOSE_UP_ZOOM
    baseRotation = 0
  } else {
    const fit = layout === 'rotated' ? ROTATED_FIT : CENTERED_FIT
    baseScale = Math.min((frameW * fit) / imgW, (frameH * fit) / imgH)
    baseRotation = layout === 'rotated' ? ROTATED_ANGLE_DEG : 0
  }

  const scale = baseScale * product.scale
  return {
    x: product.anchor.x * frameW,
    y: product.anchor.y * frameH,
    w: imgW * scale,
    h: imgH * scale,
    rotationDeg: baseRotation + product.rotationDeg,
  }
}

export function drawProductLayout(ctx: CanvasRenderingContext2D, img: CanvasImageSource, imgW: number, imgH: number, frameW: number, frameH: number, layout: LayoutKey, product: ProductLayerState) {
  const placement = computeProductPlacement(layout, frameW, frameH, imgW, imgH, product)
  ctx.save()
  ctx.translate(placement.x, placement.y)
  if (placement.rotationDeg) ctx.rotate((placement.rotationDeg * Math.PI) / 180)
  ctx.drawImage(img, -placement.w / 2, -placement.h / 2, placement.w, placement.h)
  ctx.restore()
}

// --- Price badge ---

export function drawPriceBadge(ctx: CanvasRenderingContext2D, frameW: number, frameH: number, text: string, position: Vec2) {
  const fontSize = Math.round(frameH * 0.045)
  const paddingX = fontSize * 0.9
  const paddingY = fontSize * 0.55
  ctx.font = `800 ${fontSize}px system-ui, sans-serif`
  const metrics = ctx.measureText(text)
  const boxW = metrics.width + paddingX * 2
  const boxH = fontSize + paddingY * 2

  const cx = position.x * frameW
  const cy = position.y * frameH
  const x = cx - boxW / 2
  const y = cy - boxH / 2

  ctx.save()
  ctx.fillStyle = 'rgba(18,18,22,0.9)'
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, boxW, boxH, boxH / 2)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, boxW, boxH)
  }
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy + fontSize * 0.04)
  ctx.restore()
}

// --- Logo badge ---

export function drawLogoBadge(ctx: CanvasRenderingContext2D, logoImg: CanvasImageSource, logoW: number, logoH: number, frameW: number, frameH: number, position: Vec2) {
  const size = frameH * 0.12
  const cx = position.x * frameW
  const cy = position.y * frameH

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fill()
  ctx.clip()

  const scale = Math.max(size / logoW, size / logoH)
  const dw = logoW * scale
  const dh = logoH * scale
  ctx.drawImage(logoImg, cx - dw / 2, cy - dh / 2, dw, dh)
  ctx.restore()
}
