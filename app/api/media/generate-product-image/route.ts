import { NextRequest, NextResponse } from 'next/server'

// Server-side only — never expose this as NEXT_PUBLIC_*.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash-image'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MAX_REFERENCE_IMAGES = 3

interface InlineImagePart {
  inline_data: { mime_type: string; data: string }
}

async function fetchAsInlineImagePart(imageUrl: string): Promise<InlineImagePart> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Could not fetch reference image: ${imageUrl}`)
  const mimeType = res.headers.get('content-type') || 'image/png'
  const buffer = Buffer.from(await res.arrayBuffer())
  return { inline_data: { mime_type: mimeType, data: buffer.toString('base64') } }
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { inlineData?: { mimeType: string; data: string } }[]
    }
  }[]
}

async function generateImage(imageParts: InlineImagePart[], prompt: string): Promise<{ mimeType: string; data: string }> {
  const instruction = `Using the provided product photo(s) as reference, ${prompt}. Keep the product itself — its shape, color, material, and any logos or text on it — accurate and unchanged; only change what the instruction asks for.`

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [...imageParts, { text: instruction }] }],
    }),
  })

  if (!res.ok) {
    console.error('Gemini image generation failed:', res.status, await res.text())
    throw new Error('AI image generation failed.')
  }

  const body = (await res.json()) as GeminiResponse
  const imagePart = body.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData
  if (!imagePart) throw new Error('The model did not return an image.')

  return { mimeType: imagePart.mimeType, data: imagePart.data }
}

async function uploadGeneratedImageToCloudinary(mimeType: string, base64Data: string): Promise<string> {
  const form = new FormData()
  form.append('file', `data:${mimeType};base64,${base64Data}`)
  form.append('upload_preset', UPLOAD_PRESET!)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Could not save the generated image.')
  const data = (await res.json()) as { secure_url: string }
  return data.secure_url
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI image generation is not configured.' }, { status: 500 })
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 500 })
  }

  let body: { imageUrls?: string[]; prompt?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const imageUrls = (body.imageUrls ?? []).map(u => u.trim()).filter(Boolean).slice(0, MAX_REFERENCE_IMAGES)
  const prompt = body.prompt?.trim()

  if (imageUrls.length === 0) {
    return NextResponse.json({ error: 'Upload at least one reference photo first.' }, { status: 400 })
  }
  if (!prompt) {
    return NextResponse.json({ error: 'Describe what you want generated.' }, { status: 400 })
  }

  const authorization = req.headers.get('authorization')
  if (!authorization) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  // Reserve a quota slot BEFORE paying for a Gemini call — a merchant at their cap should
  // never trigger billed API usage.
  const consumeRes = await fetch(`${API_URL}/api/merchants/me/ai-image-usage/consume`, {
    method: 'POST',
    headers: { Authorization: authorization },
  })
  if (!consumeRes.ok) {
    const detail = await consumeRes.json().then((b: { detail?: string }) => b.detail, () => undefined)
    return NextResponse.json({ error: detail || 'Could not check your generation quota.' }, { status: consumeRes.status })
  }

  try {
    const imageParts = await Promise.all(imageUrls.map(fetchAsInlineImagePart))
    const generated = await generateImage(imageParts, prompt)
    const imageUrl = await uploadGeneratedImageToCloudinary(generated.mimeType, generated.data)
    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('AI product image generation failed:', err)
    const message = err instanceof Error ? err.message : 'AI image generation failed.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
