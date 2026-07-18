import { redirect } from 'next/navigation'

// The merchant dashboard's main page moved to /affiliate (it's affiliate-marketing-
// specific content, now grouped with the rest of that section) — this keeps old
// bookmarks/links working instead of 404ing.
export default function MerchantDashboardRedirect() {
  redirect('/dashboard/merchant/affiliate')
}
