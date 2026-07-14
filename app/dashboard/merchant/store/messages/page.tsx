'use client'

import { useState } from 'react'
import { useMarkContactMessageRead, useMyContactMessages } from '@/lib/queries/storefront-admin'
import type { ContactMessageResponse } from '@/lib/types/storefront'

const PAGE_SIZE = 20

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function MessageRow({ message }: { message: ContactMessageResponse }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: markAsRead } = useMarkContactMessageRead()
  const { date, time } = formatDateTime(message.createdAt)

  function handleToggle() {
    setExpanded(v => !v)
    if (!message.isRead) markAsRead(message.id)
  }

  return (
    <div className="border-b border-white/4 last:border-0">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: message.isRead ? 'transparent' : '#d946ef' }} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${message.isRead ? 'text-white/60 font-medium' : 'text-white font-bold'}`}>
              {message.name}
            </span>
            {!message.isRead && (
              <span className="shrink-0 rounded-full bg-fuchsia-500/15 text-fuchsia-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                ახალი
              </span>
            )}
          </div>
          {!expanded && (
            <p className="text-white/30 text-xs truncate mt-0.5">{message.message}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-white/40 text-xs whitespace-nowrap">{date}</p>
          <p className="text-white/25 text-xs whitespace-nowrap">{time}</p>
        </div>

        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
          className={`shrink-0 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-5 pl-[38px] flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {message.email && (
              <a href={`mailto:${message.email}`} className="text-white/50 hover:text-white transition-colors">
                {message.email}
              </a>
            )}
            {message.phone && (
              <a href={`tel:${message.phone}`} className="text-white/50 hover:text-white transition-colors">
                {message.phone}
              </a>
            )}
          </div>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
        </div>
      )}
    </div>
  )
}

export default function MerchantStoreMessagesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useMyContactMessages({ page, pageSize: PAGE_SIZE })

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-white">შეტყობინებები</h1>
        <p className="text-white/40 text-sm mt-1">კონტაქტის ფორმის მეშვეობით მიღებული შეტყობინებები.</p>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">შეტყობინებების ჩატვირთვა ვერ მოხერხდა.</div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-white/20 text-sm">შეტყობინებები ჯერ არ არის.</p>
          </div>
        ) : (
          data.items.map(message => <MessageRow key={message.id} message={message} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            წინა
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            შემდეგი
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
