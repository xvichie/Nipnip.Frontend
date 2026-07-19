import Link from 'next/link'
import type { PublicLinkTreeResponse } from '@/lib/types'

export function LinkTreePublicView({ linkTree }: { linkTree: PublicLinkTreeResponse }) {
  return (
    <div className="min-h-screen bg-[#08080d] text-white flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {linkTree.creatorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={linkTree.creatorAvatarUrl}
            alt={linkTree.creatorName}
            className="w-24 h-24 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-black text-violet-400 text-2xl">
            {linkTree.creatorName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-xl font-black tracking-tight">{linkTree.creatorName}</h1>
          <p className="text-white/30 text-sm mt-1">@{linkTree.creatorSlug}</p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-4">
          {linkTree.items.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-10">Nothing here yet.</p>
          ) : (
            linkTree.items.map(item => (
              <a
                key={item.id}
                href={`/${linkTree.creatorSlug}/${item.merchantSlug}`}
                className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-colors px-5 py-4"
              >
                {item.merchantLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.merchantLogoUrl}
                    alt={item.merchantName}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-black text-violet-400 text-xs shrink-0">
                    {item.merchantName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-sm flex-1 truncate">{item.label || item.merchantName}</span>
              </a>
            ))
          )}
        </div>

        <Link href="/" className="text-white/20 text-xs mt-8 hover:text-white/40 transition-colors">
          Powered by NipNip
        </Link>

      </div>
    </div>
  )
}
