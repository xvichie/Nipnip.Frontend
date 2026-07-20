'use client'

import { useLanguage } from '@/lib/i18n'

export default function PostCreatorPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.sidebar.postCreator}</h1>
        <p className="text-white/40 text-sm mt-1">{t.postCreator.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 py-20 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden className="text-fuchsia-400">
            <rect x="1.5" y="3.5" width="13" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="5.2" cy="7" r="1.4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1.5 11.5l3.3-3 2.7 2.3 2.3-2 3.2 2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-bold text-white text-sm">{t.postCreator.comingSoonTitle}</p>
        <p className="text-white/30 text-xs max-w-sm">{t.postCreator.comingSoonBody}</p>
      </div>

    </div>
  )
}
