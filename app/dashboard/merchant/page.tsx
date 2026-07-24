import { redirect } from 'next/navigation'

// The merchant dashboard's default landing tab is the online store (not affiliate
// marketing) — this keeps old bookmarks/links working instead of 404ing.
export default function MerchantDashboardRedirect() {
  redirect('/dashboard/merchant/store')
}
