'use client'

import { useState } from 'react'
import { useMyStore, useMyStoreDomain, useRemoveStoreDomain, useSetStoreDomain } from '@/lib/queries/storefront-admin'

export default function MerchantStoreDomainPage() {
  const { data: store } = useMyStore()
  const { data: domain, isLoading, isError, isFetching, refetch } = useMyStoreDomain()
  const { mutate: setDomain, isPending: isSaving, error: saveError } = useSetStoreDomain()
  const { mutate: removeDomain, isPending: isRemoving } = useRemoveStoreDomain()

  const [input, setInput] = useState('')

  function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setDomain({ domain: input.trim() })
    setInput('')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">დომეინი</h1>
        <p className="text-white/40 text-sm mt-1">
          თქვენი მაღაზია ყოველთვის ხელმისაწვდომია{' '}
          {store && <span className="text-white/70">{store.slug}.nipnip.ge</span>}-ზე. დააკავშირეთ საკუთარი დომეინი მის ნაცვლად გამოსაყენებლად.
        </p>
      </div>

      {isError && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          დომეინის სტატუსის ჩატვირთვა ვერ მოხერხდა.
        </div>
      )}

      {!domain?.domain ? (
        <form onSubmit={handleConnect} className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
          <div className="fieldset gap-2">
            <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">თქვენი დომეინი</label>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="myshop.com"
              className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
            />
          </div>
          {saveError && (
            <p className="text-error text-xs">
              {saveError instanceof Error ? saveError.message : 'დომეინის დაკავშირება ვერ მოხერხდა.'}
            </p>
          )}
          <button
            type="submit"
            disabled={isSaving || !input.trim()}
            className="btn self-start gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isSaving ? <span className="loading loading-spinner loading-sm" /> : 'დაკავშირება'}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{domain.domain}</p>
              <p className="text-white/40 text-xs mt-0.5">
                {domain.verified
                  ? `დაკავშირებულია ${domain.verifiedAt ? new Date(domain.verifiedAt).toLocaleDateString() : ''}-დან`
                  : 'DNS-ის აქეთ მიმართვის მოლოდინში'}
              </p>
            </div>
            <span
              className={[
                'shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
                domain.verified
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
              ].join(' ')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {domain.verified ? 'დადასტურებულია' : 'მოლოდინში'}
            </span>
          </div>

          {!domain.verified && domain.instructions.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-[#0b0b10] p-4 flex flex-col gap-3">
              <p className="text-white/40 text-xs">დაამატეთ ეს ჩანაწერი თქვენი დომეინის DNS პროვაიდერთან:</p>
              {domain.instructions.map((rec, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-white/25 uppercase tracking-wider mb-1 font-sans">ტიპი</p>
                    <p className="text-white/80">{rec.type}</p>
                  </div>
                  <div>
                    <p className="text-white/25 uppercase tracking-wider mb-1 font-sans">სახელი</p>
                    <p className="text-white/80">{rec.name}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/25 uppercase tracking-wider mb-1 font-sans">მნიშვნელობა</p>
                    <p className="text-white/80 truncate">{rec.value}</p>
                  </div>
                </div>
              ))}
              <p className="text-white/25 text-xs">DNS ცვლილებებს ძალაში შესვლას შეიძლება რამდენიმე წუთიდან რამდენიმე საათამდე დასჭირდეს.</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-40"
            >
              {isFetching ? <span className="loading loading-spinner loading-xs" /> : 'გადამოწმება'}
            </button>
            <button
              type="button"
              onClick={() => removeDomain()}
              disabled={isRemoving}
              className="btn btn-sm bg-white/4 border-white/8 text-white/40 hover:text-red-400 disabled:opacity-40"
            >
              {isRemoving ? <span className="loading loading-spinner loading-xs" /> : 'გათიშვა'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
