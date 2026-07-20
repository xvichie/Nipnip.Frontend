import { NextRequest, NextResponse } from 'next/server'

// TikTok's photo-post endpoint only accepts PULL_FROM_URL against a domain we've verified
// ownership of with TikTok — our product images live on Cloudinary's shared domain, which we
// don't own, so this re-serves one of our OWN Cloudinary images from our own domain instead.
// Restricted to our own cloud name only, so this can't be abused as an open image proxy.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function isOwnCloudinaryUrl(rawUrl: string): boolean {
  if (!CLOUD_NAME) return false
  try {
    const url = new URL(rawUrl)
    return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com' && url.pathname.includes(`/${CLOUD_NAME}/`)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src')
  if (!src || !isOwnCloudinaryUrl(src)) {
    return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 })
  }

  const upstream = await fetch(src)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Could not fetch the source image.' }, { status: 502 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
