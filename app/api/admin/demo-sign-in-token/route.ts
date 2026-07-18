import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

type DemoRole = 'merchant' | 'creator'

const DEMO_USER_IDS: Record<DemoRole, string | undefined> = {
  merchant: process.env.DEMO_MERCHANT_CLERK_USER_ID,
  creator: process.env.DEMO_CREATOR_CLERK_USER_ID,
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { role } = await req.json() as { role?: DemoRole }
  const userId = role ? DEMO_USER_IDS[role] : undefined

  if (!userId) {
    return NextResponse.json({ error: 'Demo account not configured for this role' }, { status: 400 })
  }

  try {
    const client = await clerkClient()
    const signInToken = await client.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 60,
    })
    return NextResponse.json({ token: signInToken.token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create sign-in token'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
