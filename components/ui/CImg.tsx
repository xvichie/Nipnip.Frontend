import type { ImgHTMLAttributes } from 'react'
import { cld } from '@/lib/cloudinary'

interface CImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  /** Cloudinary resize target — only affects which asset size is fetched, not the rendered HTML width/height attributes. */
  cldWidth?: number
  cldHeight?: number
}

// Drop-in replacement for a plain <img> that runs Cloudinary-hosted src URLs through
// auto format + auto quality (and optional resizing) before rendering, instead of loading
// the raw uploaded original. Non-Cloudinary URLs are rendered unchanged.
export function CImg({ src, cldWidth, cldHeight, ...props }: CImgProps) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt is required by CImgProps' ImgHTMLAttributes, just not statically visible here
  return <img src={cld(src, { width: cldWidth, height: cldHeight })} {...props} />
}
