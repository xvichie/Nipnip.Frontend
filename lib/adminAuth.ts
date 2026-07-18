import { auth, clerkClient } from '@clerk/nextjs/server'

/** Returns the signed-in Clerk userId if they're the admin, otherwise null. */
export async function requireAdmin(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim()).filter(Boolean)
  if (adminEmails.length === 0) return null

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress

  return primaryEmail && adminEmails.includes(primaryEmail) ? userId : null
}
