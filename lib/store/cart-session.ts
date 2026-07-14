const cookieName = (slug: string) => `nn_cart_${slug}`

export function getCartSessionId(slug: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName(slug)}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setCartSessionId(slug: string, sessionId: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${cookieName(slug)}=${encodeURIComponent(sessionId)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}
