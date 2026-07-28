'use client'

import type { StorefrontStrings } from '@/lib/storefront-i18n'

export function SizeGuideModal({ content, t, onClose }: { content: string; t: StorefrontStrings; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-[#111]">{t.sizeGuide.heading}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.sizeGuide.closeAriaLabel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#999] hover:text-[#111] hover:bg-[#f2f2f2] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="text-[#555] text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
