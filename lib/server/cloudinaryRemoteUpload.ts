// Shared by every "import a product from an external URL" API route (Facebook/Instagram,
// MyMarket, ...) — delegates the actual fetch to Cloudinary (it supports a remote URL as the
// `file` param), so our server never downloads third-party media bytes itself.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export function isFetchableUrl(raw: string): URL | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  return url
}

export async function reuploadToCloudinary(mediaUrl: string, resourceType: 'image' | 'video'): Promise<string | null> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return mediaUrl // not configured — pass the URL through as-is

  const form = new FormData()
  form.append('file', mediaUrl)
  form.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      console.error(`Cloudinary remote-fetch upload failed (${res.status}) for ${mediaUrl}:`, await res.text())
      return null
    }
    const data = (await res.json()) as { secure_url?: string }
    return data.secure_url ?? null
  } catch (err) {
    console.error(`Cloudinary remote-fetch upload threw for ${mediaUrl}:`, err)
    return null
  }
}

// A URL already hosted on this Cloudinary account (e.g. the merchant uploaded a file
// directly in the modal) is already final — re-uploading it would just be a wasteful
// round-trip through Cloudinary fetching from itself.
export function isOwnCloudinaryUrl(rawUrl: string): boolean {
  if (!CLOUD_NAME) return false
  try {
    return new URL(rawUrl).hostname === 'res.cloudinary.com' && rawUrl.includes(`/${CLOUD_NAME}/`)
  } catch {
    return false
  }
}

// Preferred path for any directly-fetchable media URL (not behind a login wall) — re-hosts
// it on Cloudinary so it persists independently of the source's (possibly expiring) link.
export async function tryFetchDirectMedia(rawUrl: string, resourceType: 'image' | 'video'): Promise<string | null> {
  if (isOwnCloudinaryUrl(rawUrl)) return rawUrl
  const url = isFetchableUrl(rawUrl)
  if (!url) return null
  return reuploadToCloudinary(url.toString(), resourceType)
}
