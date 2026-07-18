import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.createUser({
      emailAddress: [email],
      password,
    })
    return NextResponse.json({ userId: user.id })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create Clerk user'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
