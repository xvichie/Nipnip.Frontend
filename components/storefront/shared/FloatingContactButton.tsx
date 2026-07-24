'use client'

import type { ThemeConfig } from '@/lib/types/storefront'

const WHATSAPP_ICON = (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
    <path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1 4.1 1.6 6.3 1.6 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3Z" fill="#25D366"/>
    <path d="M11.5 10.5c-.3-.7-.6-.7-.9-.7h-.7c-.3 0-.7.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.3 2.6 4 6.3 5.5 3.1 1.2 3.7 1 4.4.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.3-.6.1-.2 0-.5 0-.7-.1-.2-.7-1.9-1-2.5Z" fill="#fff"/>
  </svg>
)

const VIBER_ICON = (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
    <path d="M16 3.5c-7 0-12.5 4.5-12.5 11.3 0 4 2 7.3 5.4 9.4l-.9 4.3 4.6-2.4c1.1.3 2.2.4 3.4.4 7 0 12.5-4.5 12.5-11.3S23 3.5 16 3.5Z" fill="#7360F2"/>
    <path d="M15.9 8.1c-.3 0-.5.2-.5.5s.2.5.5.5c3.1.1 5.4 2.2 5.5 5.6 0 .3.2.5.5.5s.5-.2.5-.5c-.1-3.9-2.8-6.4-6-6.6Z" fill="#fff"/>
    <path d="M15.9 10c-.3 0-.5.2-.5.5s.2.5.5.5c1.8.1 2.9 1.2 3 3.1 0 .3.2.5.5.5s.5-.2.5-.5c-.1-2.4-1.6-3.9-4-4.1Z" fill="#fff"/>
    <path d="M21.7 18.4c-.5-.4-1.6-1.1-2.3-1.4-.6-.3-.9-.2-1.2.1l-.6.8c-.2.2-.4.3-.7.1-.5-.2-1.6-.7-2.7-1.7-1-.9-1.7-2-1.9-2.4-.2-.3 0-.5.2-.7l.5-.6c.2-.3.3-.5.1-.9-.1-.3-.9-2.1-1.2-2.9-.3-.7-.6-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.5 5.4 4.8 2.8 1.1 3.2.8 3.8.8.6-.1 1.9-.8 2.2-1.5.2-.5.2-1 .1-1.1Z" fill="#fff"/>
  </svg>
)

function normalizeNumber(raw: string) {
  return raw.replace(/[^0-9+]/g, '')
}

export function FloatingContactButton({ tokens }: { tokens: Required<ThemeConfig> }) {
  const whatsapp = tokens.whatsappNumber.trim()
  const viber = tokens.viberNumber.trim()
  if (!whatsapp && !viber) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {viber && (
        <a
          href={`viber://chat?number=${encodeURIComponent(normalizeNumber(viber))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Viber"
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-[#7360F2] hover:scale-105 transition-transform"
        >
          {VIBER_ICON}
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${encodeURIComponent(normalizeNumber(whatsapp))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-[#25D366] hover:scale-105 transition-transform"
        >
          {WHATSAPP_ICON}
        </a>
      )}
    </div>
  )
}
