'use client'

import { useState } from 'react'
import { useExtraProducts } from '@/lib/queries/extra'
import type { ExtraProductSummary } from '@/lib/types'

interface ExtraProductPickerProps {
  sellerId: string
  onPick: (product: ExtraProductSummary) => void
  pickingId: string | null
  disabled: boolean
}

export function ExtraProductPicker({ sellerId, onPick, pickingId, disabled }: ExtraProductPickerProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, isError } = useExtraProducts(sellerId, page)

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-lg" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="text-white/30 text-xs">Failed to load your products. Try again in a moment.</p>
      ) : data.products.length === 0 ? (
        <p className="text-white/30 text-xs">No products found for this seller.</p>
      ) : (
        <>
          <div className={`grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-0.5 transition-opacity ${isFetching ? 'opacity-50' : ''}`}>
            {data.products.map(product => {
              const id = String(product.offerSecondaryId)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onPick(product)}
                  disabled={disabled || isFetching}
                  title={product.title}
                  className="group relative flex flex-col rounded-lg overflow-hidden border border-white/10 hover:border-[#7A1DFF]/60 transition-colors disabled:opacity-40 text-left"
                >
                  <div className="aspect-square bg-white/4 relative">
                    {product.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px] p-1 text-center">
                        No photo
                      </div>
                    )}
                    {pickingId === id && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="loading loading-spinner loading-xs text-[#7A1DFF]" />
                      </div>
                    )}
                  </div>
                  <div className="px-1.5 py-1 bg-[#14141c]">
                    <p className="text-white/70 text-[10px] leading-tight line-clamp-2">{product.title}</p>
                    {product.price != null && (
                      <p className="text-[#c299ff] text-[10px] font-semibold mt-0.5">{product.price} ₾</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={disabled || isFetching || page <= 1}
                className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-white/30 text-xs flex items-center gap-1.5">
                Page {data.currentPage} of {data.totalPages}
                {isFetching && <span className="loading loading-spinner loading-xs" />}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={disabled || isFetching || page >= data.totalPages}
                className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
