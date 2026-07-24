'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { useFacebookPosts, useFacebookStatus } from '@/lib/queries/facebook'
import { useMyCategories } from '@/lib/queries/storefront-admin'
import { apiFetch, ApiError } from '@/lib/api'
import { CImg } from '@/components/ui/CImg'
import type {
  CreateProductRequest,
  FacebookPostDetailResponse,
  ProductDetailResponse,
  ProductOptionResponse,
} from '@/lib/types/storefront'

type RowStatus = 'pending' | 'importing' | 'created' | 'skipped' | 'failed'

interface ResultRow {
  postId: string
  label: string
  status: RowStatus
  reason?: string
}

interface ExtractedProduct {
  name: string | null
  description: string | null
  price: number | null
  optionGroups: { name: string; values: string[] }[]
  categoryId: string | null
  imageUrls: string[]
  videoUrl: string | null
}

interface BulkImportFromFacebookSectionProps {
  // The parent modal blocks closing/navigating away while a batch is in flight, same as
  // this used to guard its own close button — it needs to know when that's the case.
  onImportingChange: (importing: boolean) => void
  onDone: () => void
}

export function BulkImportFromFacebookSection({ onImportingChange, onDone }: BulkImportFromFacebookSectionProps) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { data: categories } = useMyCategories()

  const { data: fbStatus, isLoading: statusLoading } = useFacebookStatus()
  const connected = fbStatus?.connected ?? false
  const { data: posts, isLoading: postsLoading } = useFacebookPosts(connected)

  // "Adjust state during render" instead of an effect — selects every post the moment
  // the list arrives, and re-syncs if it changes (e.g. a fresh fetch on reopen).
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prevPosts, setPrevPosts] = useState(posts)
  if (posts !== prevPosts) {
    setPrevPosts(posts)
    setSelected(new Set((posts ?? []).map(p => p.id)))
  }

  const [importing, setImportingState] = useState(false)
  const [results, setResults] = useState<ResultRow[] | null>(null)

  function setImporting(value: boolean) {
    setImportingState(value)
    onImportingChange(value)
  }

  function toggle(postId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  function toggleAll() {
    if (!posts) return
    setSelected(prev => (prev.size === posts.length ? new Set() : new Set(posts.map(p => p.id))))
  }

  async function handleImport() {
    if (!posts) return
    const chosen = posts.filter(p => selected.has(p.id))
    if (chosen.length === 0) return

    setImporting(true)
    const rows: ResultRow[] = chosen.map(p => ({ postId: p.id, label: p.message?.slice(0, 40) || 'პოსტი', status: 'pending' }))
    setResults([...rows])

    for (let i = 0; i < chosen.length; i++) {
      rows[i] = { ...rows[i], status: 'importing' }
      setResults([...rows])
      rows[i] = await importOne(chosen[i].id, rows[i])
      setResults([...rows])
    }

    setImporting(false)
    queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'products'] })
  }

  async function importOne(postId: string, row: ResultRow): Promise<ResultRow> {
    try {
      const token = await getToken()

      const detail = await apiFetch<FacebookPostDetailResponse>(`/api/stores/me/facebook/posts/${postId}`, token)
      if (!detail.message?.trim()) {
        return { ...row, status: 'skipped', reason: 'წარწერის ტექსტი არ არის' }
      }

      const importRes = await fetch('/api/import/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captionText: detail.message,
          imageUrls: detail.imageUrls.length > 0 ? detail.imageUrls : undefined,
          videoUrl: detail.videoUrl ?? undefined,
          categories: categories?.map(c => ({ id: c.id, name: c.name })),
        }),
      })
      const extracted = (await importRes.json()) as ExtractedProduct & { error?: string }
      if (!importRes.ok) {
        return { ...row, status: 'failed', reason: extracted.error ?? 'AI-ს მიერ მონაცემების ამოღება ვერ მოხერხდა' }
      }

      const name = extracted.name?.trim() || detail.message.slice(0, 60)
      const noPriceDetected = extracted.price == null

      const body: CreateProductRequest = {
        name,
        description: extracted.description ?? null,
        videoUrl: extracted.videoUrl ?? null,
        basePrice: extracted.price ?? 0,
        salePrice: null,
        categoryId: extracted.categoryId ?? null,
      }
      const created = await apiFetch<ProductDetailResponse>('/api/stores/me/products', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      for (const url of extracted.imageUrls) {
        try {
          await apiFetch(`/api/products/${created.id}/images`, token, { method: 'POST', body: JSON.stringify({ url }) })
        } catch {
          // product already created — a failed image can be re-added manually on its page
        }
      }

      for (const group of extracted.optionGroups) {
        try {
          const createdOption = await apiFetch<ProductOptionResponse>(`/api/products/${created.id}/options`, token, {
            method: 'POST',
            body: JSON.stringify({ name: group.name }),
          })
          await Promise.allSettled(
            group.values.map(v =>
              apiFetch(`/api/products/${created.id}/options/${createdOption.id}/values`, token, {
                method: 'POST',
                body: JSON.stringify({ value: v }),
              })
            )
          )
        } catch {
          // product already created — options can be re-added manually on its page
        }
      }

      return {
        ...row,
        label: name,
        status: 'created',
        reason: noPriceDetected ? 'ფასი ვერ იქნა დადგენილი — დააყენეთ ხელით' : undefined,
      }
    } catch (err) {
      return { ...row, status: 'failed', reason: err instanceof ApiError ? err.message : 'მოულოდნელი შეცდომა' }
    }
  }

  const created = results?.filter(r => r.status === 'created').length ?? 0
  const skipped = results?.filter(r => r.status === 'skipped').length ?? 0
  const failed = results?.filter(r => r.status === 'failed').length ?? 0
  const done = results !== null && !importing

  if (statusLoading) {
    return <div className="skeleton h-24 rounded-xl" />
  }

  if (!connected) {
    return (
      <>
        <p className="text-white/40 text-xs leading-relaxed">
          დააკავშირეთ თქვენი Facebook გვერდი პროდუქტების მასობრივად საიმპორტოდ თქვენი ბოლო პოსტებიდან.
        </p>
        <Link
          href="/dashboard/merchant/store/integrations"
          className="btn btn-sm w-fit gap-2 bg-[#1877F2]/15 border-[#1877F2]/30 text-[#8fb8fa] hover:bg-[#1877F2]/25"
        >
          Facebook-ის დაკავშირება ინტეგრაციებში
        </Link>
      </>
    )
  }

  if (results === null) {
    return (
      <>
        <p className="text-white/40 text-xs leading-relaxed">
          ყველა ბოლო პოსტი ავტომატურად შერჩეულია — მოხსენით ის, რისი იმპორტიც არ გსურთ, შემდეგ დანარჩენი
          იმპორტირდება პროდუქტებად ერთდროულად. AI ავსებს სახელს, ფასს, ზომებს/ფერებს და კატეგორიას თითოეულისთვის;
          გადახედეთ და გაასწორეთ ის, რასაც ვერ დაადგენს.
        </p>

        {postsLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-lg" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">არჩეულია {selected.size} / {posts.length}</span>
              <button type="button" onClick={toggleAll} className="text-fuchsia-400 hover:text-fuchsia-300 text-xs">
                {selected.size === posts.length ? 'ყველას მოხსნა' : 'ყველას არჩევა'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {posts.map(post => {
                const isSelected = selected.has(post.id)
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => toggle(post.id)}
                    title={post.message ?? ''}
                    className={[
                      'relative aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                      isSelected ? 'border-fuchsia-500/70' : 'border-white/10 opacity-40',
                    ].join(' ')}
                  >
                    {post.thumbnailUrl ? (
                      <CImg src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/4 flex items-center justify-center text-white/20 text-[8px] p-1 text-center leading-tight">
                        {post.message?.slice(0, 30) ?? 'პოსტი'}
                      </div>
                    )}
                    <div
                      className={[
                        'absolute top-1 right-1 w-4 h-4 rounded-full border flex items-center justify-center text-[9px]',
                        isSelected
                          ? 'bg-fuchsia-600 border-fuchsia-600 text-white'
                          : 'bg-black/50 border-white/30 text-transparent',
                      ].join(' ')}
                    >
                      ✓
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-white/30 text-xs">თქვენს გვერდზე ბოლო პოსტები ვერ მოიძებნა.</p>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={selected.size === 0}
          className="btn w-full gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {selected.size} პოსტის იმპორტი
        </button>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {results.map(row => (
          <div key={row.postId} className="flex items-center gap-2 rounded-lg bg-white/2 px-3 py-2">
            <span className="shrink-0">
              {row.status === 'pending' && <span className="w-3.5 h-3.5 block rounded-full border border-white/20" />}
              {row.status === 'importing' && <span className="loading loading-spinner loading-xs text-fuchsia-400" />}
              {row.status === 'created' && <span className="text-emerald-400 text-xs">✓</span>}
              {row.status === 'skipped' && <span className="text-amber-400 text-xs">–</span>}
              {row.status === 'failed' && <span className="text-red-400 text-xs">✕</span>}
            </span>
            <span className="text-white/70 text-xs flex-1 truncate">{row.label}</span>
            {row.reason && <span className="text-white/30 text-[10px] shrink-0">{row.reason}</span>}
          </div>
        ))}
      </div>

      {done && (
        <>
          <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/70">
            შეიქმნა {created}{skipped > 0 ? `, გამოტოვდა ${skipped}` : ''}{failed > 0 ? `, ვერ შესრულდა ${failed}` : ''}.
          </div>
          <button
            type="button"
            onClick={onDone}
            className="btn w-full gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white"
          >
            დასრულდა
          </button>
        </>
      )}
    </>
  )
}
