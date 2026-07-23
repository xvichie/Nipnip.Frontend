'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminCreateProspect, useAdminProspects } from '@/lib/queries/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function AdminProspectsPage() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminProspects(page)
  const { mutate: createProspect, isPending, error } = useAdminCreateProspect()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const totalPages = data ? Math.ceil(data.totalCount / 50) : 1

  function openDialog() {
    setName('')
    setSlug('')
    dialogRef.current?.showModal()
  }

  function handleNameChange(v: string) {
    setName(v)
    setSlug(prev => (prev === slugify(name) || prev === '' ? slugify(v) : prev))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createProspect(
      { name: name.trim(), slug: slug.trim() },
      { onSuccess: prospect => router.push(`/admin/prospects/${prospect.merchant.id}`) }
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Prospects</h1>
          <p className="text-white/40 text-sm mt-1">
            Sales-demo stores for potential customers — never public, visible only via /preview/{'{slug}'} to a signed-in admin.
          </p>
        </div>
        <button
          onClick={openDialog}
          className="btn btn-sm gap-2 bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          New Prospect
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">Failed to load prospects.</div>
          </div>
        ) : data!.items.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">No prospects yet — create one to start pitching.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Slug', 'Created', ''].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        'px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                        i === 3 ? 'text-right' : 'text-left',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.items.map(m => (
                  <tr key={m.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white text-sm">{m.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-white/40">/{m.slug}</td>
                    <td className="px-5 py-3.5 text-white/40 text-xs whitespace-nowrap">{formatDate(m.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/preview/${m.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white"
                        >
                          Preview ↗
                        </a>
                        <Link
                          href={`/admin/prospects/${m.id}`}
                          className="btn btn-xs bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">New Prospect</h3>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          </div>

          <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
            <div className="fieldset gap-2">
              <label htmlFor="p-name" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Business Name
              </label>
              <input
                id="p-name"
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60"
                placeholder="Dressy Boutique"
                autoFocus
                required
              />
            </div>

            <div className="fieldset gap-2">
              <label htmlFor="p-slug" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                Slug
              </label>
              <input
                id="p-slug"
                type="text"
                value={slug}
                onChange={e => setSlug(slugify(e.target.value))}
                className="input w-full bg-white/[0.04] border-white/[0.1] focus:border-amber-500/60 font-mono"
                placeholder="dressy"
                required
              />
              <p className="text-white/30 text-xs">Preview link: /preview/{slug || '…'}</p>
            </div>

            {error && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {error instanceof Error ? error.message : 'Something went wrong'}
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || !slug.trim() || isPending}
              className="btn w-full bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Create Prospect'}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  )
}
