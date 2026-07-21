// Scoped per-store (not global) so a visitor id can't be used to correlate the same person
// across different merchants' stores — it only ever answers "how many distinct visitors did
// this one store get," nothing more.
const cookieName = (slug: string) => `nn_vid_${slug}`

export function getOrCreateVisitorId(slug: string): string {
  const name = cookieName(slug)
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  if (match) return decodeURIComponent(match[1])

  const id = crypto.randomUUID()
  document.cookie = `${name}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
  return id
}
