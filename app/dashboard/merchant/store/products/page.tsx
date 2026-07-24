'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeleteProduct, useDuplicateProduct, useMyCategories, useMyProducts } from '@/lib/queries/storefront-admin'
import { ImportProductModal } from '@/components/dashboard/store/ImportProductModal'
import { CsvImportExportModal } from '@/components/dashboard/store/CsvImportExportModal'
import { CImg } from '@/components/ui/CImg'

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'ჯერ ახალი' },
  { value: 'createdAt-asc', label: 'ჯერ ძველი' },
  { value: 'name-asc', label: 'სახელი A–Z' },
  { value: 'name-desc', label: 'სახელი Z–A' },
  { value: 'price-asc', label: 'ფასი: დაბლიდან მაღლა' },
  { value: 'price-desc', label: 'ფასი: მაღლიდან დაბლა' },
] as const

export default function MerchantProductsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('')
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('createdAt-desc')

  const { data: categories } = useMyCategories()

  useEffect(() => {
    const timeout = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const [sortBy, sortDir] = sort.split('-') as ['name' | 'price' | 'createdAt', 'asc' | 'desc']

  const { data, isLoading, isError } = useMyProducts({
    page,
    search: search || undefined,
    categoryId: categoryId || undefined,
    isActive: status === '' ? undefined : status === 'active',
    sortBy,
    sortDir,
  })
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()
  const { mutate: duplicateProduct, isPending: isDuplicating } = useDuplicateProduct()

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / 20)) : 1

  function handleDelete(id: string, name: string) {
    if (!confirm(`წავშალო პროდუქტი „${name}“? ეს ქმედება შეუქცევადია.`)) return
    deleteProduct(id)
  }

  function handleDuplicate(id: string) {
    duplicateProduct(id, {
      onSuccess: duplicate => router.push(`/dashboard/merchant/store/products/${duplicate.id}`),
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">პროდუქტები</h1>
          <p className="text-white/40 text-sm mt-1">{data ? `სულ ${data.totalCount}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportProductModal />
          <CsvImportExportModal />
          <Link
            href="/dashboard/merchant/store/products/new"
            className="btn btn-sm gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            ახალი პროდუქტი
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="პროდუქტების ძიება..."
          className="input input-sm w-full sm:flex-1 sm:min-w-40 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        {categories && categories.length > 0 && (
          <select
            value={categoryId}
            onChange={e => { setCategoryId(e.target.value); setPage(1) }}
            className="select select-sm w-full sm:w-auto bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
          >
            <option value="">ყველა კატეგორია</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        )}
        <select
          value={status}
          onChange={e => { setStatus(e.target.value as typeof status); setPage(1) }}
          className="select select-sm w-full sm:w-auto bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        >
          <option value="">ყველა სტატუსი</option>
          <option value="active">აქტიური</option>
          <option value="inactive">არააქტიური</option>
        </select>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value as typeof sort); setPage(1) }}
          className="select select-sm w-full sm:w-auto bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        >
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : isError || !data ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">პროდუქტების ჩატვირთვა ვერ მოხერხდა.</div>
          </div>
        ) : data.items.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm">პროდუქტები ვერ მოიძებნა.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  {['პროდუქტი', 'ფასი', 'სტატუსი', ''].map((h, i) => (
                    <th key={i} className={[
                      'px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-widest whitespace-nowrap',
                      i === 3 ? 'text-right' : 'text-left',
                    ].join(' ')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map(product => (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/dashboard/merchant/store/products/${product.id}`)}
                    className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.thumbnailUrl ? (
                          <CImg src={product.thumbnailUrl} cldWidth={80} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/4 border border-white/8" />
                        )}
                        <span className="text-sm font-medium text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm tabular-nums">{product.basePrice.toFixed(2)} ₾</td>
                    <td className="px-5 py-3.5">
                      <span className={[
                        'inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium',
                        product.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-white/4 border-white/8 text-white/30',
                      ].join(' ')}>
                        {product.isActive ? 'აქტიური' : 'არააქტიური'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/merchant/store/products/${product.id}`}
                          aria-label="რედაქტირება"
                          className="tooltip tooltip-top btn btn-xs btn-square bg-white/4 border-white/8 text-white/60 hover:text-white"
                          data-tip="რედაქტირება"
                        >
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                            <path d="M9.5 1.5l3 3-7 7-3.5 1 1-3.5 6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(product.id)}
                          disabled={isDuplicating}
                          aria-label="დუბლირება"
                          className="tooltip tooltip-top btn btn-xs btn-square bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-40"
                          data-tip="დუბლირება"
                        >
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                            <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-5A1.5 1.5 0 0 0 1 3.5v5A1.5 1.5 0 0 0 2.5 10H4" stroke="currentColor" strokeWidth="1.3"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isDeleting}
                          aria-label="წაშლა"
                          className="tooltip tooltip-top btn btn-xs btn-square bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                          data-tip="წაშლა"
                        >
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                            <path d="M2.5 3.5h9M5.5 3.5V2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M5.5 6.5v4M8.5 6.5v4M3.5 3.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
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
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            წინა
          </button>
          <span className="text-white/30 text-sm tabular-nums">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm bg-white/4 border-white/8 text-white/60 hover:text-white disabled:opacity-30"
          >
            შემდეგი
          </button>
        </div>
      )}

    </div>
  )
}
