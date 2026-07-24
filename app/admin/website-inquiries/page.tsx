'use client'

import { useState } from 'react'
import { useAdminMarkWebsiteInquiryRead, useAdminWebsiteInquiries } from '@/lib/queries/admin'
import type { WebsiteInquiryResponse } from '@/lib/types/admin'

const PAGE_SIZE = 20

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function InquiryRow({ inquiry }: { inquiry: WebsiteInquiryResponse }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: markAsRead } = useAdminMarkWebsiteInquiryRead()
  const { date, time } = formatDateTime(inquiry.createdAt)

  function handleToggle() {
    setExpanded(v => !v)
    if (!inquiry.isRead) markAsRead(inquiry.id)
  }

  return (
    <div className="border-b border-white/4 last:border-0">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: inquiry.isRead ? 'transparent' : '#d946ef' }} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${inquiry.isRead ? 'text-white/60 font-medium' : 'text-white font-bold'}`}>
              {inquiry.name}
            </span>
            {inquiry.storeName && (
              <span className="shrink-0 text-white/30 text-xs truncate">— {inquiry.storeName}</span>
            )}
            {!inquiry.isRead && (
              <span className="shrink-0 rounded-full bg-fuchsia-500/15 text-fuchsia-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                New
              </span>
            )}
          </div>
          {!expanded && (
            <p className="text-white/30 text-xs truncate mt-0.5">{inquiry.message}</p>
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
          {inquiry.storeName && (
            <p className="text-white/40 text-xs">
              <span className="text-white/25 uppercase tracking-wider">Store name:</span> {inquiry.storeName}
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {inquiry.email && (
              <a href={`mailto:${inquiry.email}`} className="text-white/50 hover:text-white transition-colors">
                {inquiry.email}
              </a>
            )}
            {inquiry.phone && (
              <a href={`tel:${inquiry.phone}`} className="text-white/50 hover:text-white transition-colors">
                {inquiry.phone}
              </a>
            )}
          </div>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminWebsiteInquiriesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminWebsiteInquiries(page, PAGE_SIZE)

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Website Inquiries</h1>
        <p className="text-white/40 text-sm mt-1">
          {data ? `${data.totalCount} total` : "\"I want a website\" leads from the marketing site's footer form"}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load inquiries.</div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">No inquiries yet.</div>
        ) : (
          data.items.map(inquiry => <InquiryRow key={inquiry.id} inquiry={inquiry} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Prev
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
