import { NextRequest, NextResponse } from 'next/server'

// TikTok's photo-post endpoint only accepts PULL_FROM_URL against a domain we've verified
// ownership of with TikTok — our product images live on Cloudinary's shared domain, which we
// don't own, so this re-serves one of our OWN Cloudinary images from our own domain instead.
// Restricted to our own cloud name only, so this can't be abused as an open image proxy.
//
// The [filename] segment is never read — its only purpose is to give the URL TikTok actually
// fetches a real-looking file extension (e.g. /tiktok-proxy/photo.jpg), since a bare
// /tiktok-proxy?src=... URL has no extension of its own even though the real image behind it
// does, and TikTok's format check appears to key off the fetched URL rather than only the
// Content-Type header or the file's actual bytes.

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

// TikTok's Content Posting API only accepts JPEG or WebP for photo posts — PNG (what our
// Social Post Creator canvas exports, and what merchants often upload) is rejected outright
// with file_format_check_failed. Cloudinary can transcode on the fly via an f_jpg flag inserted
// right after /upload/, regardless of the source file's own format or extension.
function toJpegUrl(rawUrl: string): string {
  return rawUrl.replace('/upload/', '/upload/f_jpg/')
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src')
  if (!src || !isOwnCloudinaryUrl(src)) {
    return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 })
  }

  const upstream = await fetch(toJpegUrl(src))
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Could not fetch the source image.' }, { status: 502 })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=86400, immutable',
  }
  const contentLength = upstream.headers.get('content-length')
  if (contentLength) headers['Content-Length'] = contentLength

  return new NextResponse(upstream.body, { status: 200, headers })
}
