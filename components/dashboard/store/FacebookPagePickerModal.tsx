'use client'

import { useState } from 'react'
import { useFacebookPendingPages, useSelectFacebookPage } from '@/lib/queries/facebook'

export function FacebookPagePickerModal({ pendingToken, onClose }: { pendingToken: string; onClose: () => void }) {
  const { data: pages, isLoading } = useFacebookPendingPages(pendingToken)
  const { mutate: selectPage, isPending, error } = useSelectFacebookPage()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleConfirm() {
    if (!selectedId) return
    selectPage({ pending: pendingToken, pageId: selectedId }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141c] p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-white">რომელი გვერდია თქვენი მაღაზია?</h3>
        <p className="text-white/40 text-xs leading-relaxed">
          თქვენი Facebook ანგარიში მართავს ერთზე მეტ გვერდს. აირჩიეთ ის, სადაც პროდუქტებს აქვეყნებთ.
        </p>

        {isLoading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : (
          <div className="flex flex-col gap-2">
            {pages?.map(page => (
              <button
                key={page.id}
                type="button"
                onClick={() => setSelectedId(page.id)}
                className={[
                  'text-left rounded-xl border px-4 py-3 text-sm transition-colors',
                  selectedId === page.id
                    ? 'border-fuchsia-500/60 bg-fuchsia-500/10 text-white'
                    : 'border-white/10 bg-white/4 text-white/70 hover:text-white',
                ].join(' ')}
              >
                {page.name}
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-error text-xs">ამ გვერდის დაკავშირება ვერ მოხერხდა. სცადეთ თავიდან.</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm flex-1 bg-white/4 border-white/10 text-white/60 hover:text-white"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || isPending}
            className="btn btn-sm flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 text-white disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-xs" /> : 'დაკავშირება'}
          </button>
        </div>
      </div>
    </div>
  )
}
