const cookieName = (slug: string) => `nn_ref_${slug}`

export function getStoreRef(slug: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName(slug)}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
