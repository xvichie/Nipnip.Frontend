import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

// Server-side equivalent of components/admin/AdminGuard.tsx's client-side check — same source
// of truth (NEXT_PUBLIC_ADMIN_EMAILS), for the one place that needs to gate a page render
// server-side: a prospect's storefront, which must 404 for everyone except a signed-in admin.
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (ADMIN_EMAILS.length === 0) return false
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  return !!email && ADMIN_EMAILS.includes(email)
}
