import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUserId = await requireAdmin()
  if (!adminUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    const { getToken } = await auth()
    const token = await getToken()

    // Reuses the same .NET endpoint the impersonation flow uses to resolve a merchant's Clerk
    // user ID — it already refuses prospects and merchants with no linked account, which is
    // exactly the "no owner yet" case here too.
    const infoRes = await fetch(`${API_URL}/api/admin/merchants/${id}/impersonation-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!infoRes.ok) {
      return NextResponse.json({ owner: null })
    }

    const info = await infoRes.json() as { clerkUserId: string }
    const client = await clerkClient()
    const user = await client.users.getUser(info.clerkUserId)
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? null

    return NextResponse.json({
      owner: {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to look up owner'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
