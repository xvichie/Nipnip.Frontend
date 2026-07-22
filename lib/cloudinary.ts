const CLOUDINARY_HOST = 'res.cloudinary.com'

interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'thumb'
}

// Rewrites a Cloudinary delivery URL to request an optimized asset (auto format + auto quality,
// optionally resized) instead of the raw original upload — uploads go through unprocessed
// (see lib/uploadImage.ts), so every render site needs to ask for a sized-down, compressed
// version itself. Non-Cloudinary URLs pass through unchanged, so this is always safe to call
// regardless of where the image actually came from.
export function cld(url: string | null | undefined, options: CloudinaryTransformOptions = {}): string {
  if (!url) return url ?? ''
  if (!url.includes(CLOUDINARY_HOST)) return url

  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return url

  const transforms = ['f_auto', 'q_auto']
  if (options.width) transforms.push(`w_${options.width}`)
  if (options.height) transforms.push(`h_${options.height}`)
  if (options.width || options.height) transforms.push(`c_${options.crop ?? 'limit'}`)

  const insertAt = idx + marker.length
  return `${url.slice(0, insertAt)}${transforms.join(',')}/${url.slice(insertAt)}`
}
