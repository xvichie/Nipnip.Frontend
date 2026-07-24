import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function POST(req: Request) {
  const adminUserId = await requireAdmin()
  if (!adminUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { clerkUserId } = await req.json() as { clerkUserId?: string }
  if (!clerkUserId) {
    return NextResponse.json({ error: 'clerkUserId is required' }, { status: 400 })
  }

  try {
    const client = await clerkClient()
    // An actor token (not a plain sign-in token) — the resulting session's JWT carries an
    // `act` claim recording the admin as the impersonator, which the dashboard banner reads
    // to show/exit the impersonation, and which keeps a Clerk-side audit trail of who signed
    // in as whom.
    const actorToken = await client.actorTokens.create({
      userId: clerkUserId,
      actor: { sub: adminUserId },
      expiresInSeconds: 60,
    })
    return NextResponse.json({ token: actorToken.token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create impersonation token'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
