'use client'

import { useState } from 'react'
import { useCreateProductVariant } from '@/lib/queries/storefront-admin'
import type { ProductOptionResponse, ProductOptionValueResponse } from '@/lib/types/storefront'
import { sortOptionValueObjects } from '@/lib/sortOptionValues'

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap(combo => curr.map(item => [...combo, item])),
    [[]]
  )
}

function slugify(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8) || 'X'
}

export function BulkVariantGenerator({
  productId,
  options,
}: {
  productId: string
  options: ProductOptionResponse[]
}) {
  const { mutateAsync: createVariant } = useCreateProductVariant(productId)

  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [skuPrefix, setSkuPrefix] = useState('')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ succeeded: number; failed: number } | null>(null)

  const configuredOptions = options.filter(o => o.values.length > 0)
  if (configuredOptions.length === 0) return null

  function toggleValue(optionId: string, valueId: string) {
    setSelected(prev => {
      const current = prev[optionId] ?? []
      const next = current.includes(valueId) ? current.filter(v => v !== valueId) : [...current, valueId]
      return { ...prev, [optionId]: next }
    })
  }

  const readyOptionCount = configuredOptions.filter(o => (selected[o.id] ?? []).length > 0).length
  const combinationCount = configuredOptions.reduce((count, o) => count * (selected[o.id]?.length ?? 0), 1)
  const canGenerate = readyOptionCount === configuredOptions.length && !!price

  async function handleGenerate() {
    const p = parseFloat(price)
    const s = stock.trim() === '' ? null : parseInt(stock, 10)
    if (isNaN(p) || (s !== null && isNaN(s)) || !canGenerate) return

    const sp = parseFloat(salePrice)
    const effectiveSalePrice = salePrice.trim() && !isNaN(sp) ? sp : null

    const valueLists: ProductOptionValueResponse[][] = configuredOptions.map(o =>
      o.values.filter(v => (selected[o.id] ?? []).includes(v.id))
    )
    const combos = cartesianProduct(valueLists)

    setIsGenerating(true)
    setResult(null)

    const outcomes = await Promise.allSettled(
      combos.map(combo => {
        const skuParts = [skuPrefix.trim(), ...combo.map(v => slugify(v.value))].filter(Boolean)
        return createVariant({
          sku: skuParts.join('-'),
          price: p,
          salePrice: effectiveSalePrice,
          stock: s,
          optionValueIds: combo.map(v => v.id),
        })
      })
    )

    const succeeded = outcomes.filter(o => o.status === 'fulfilled').length
    const failed = outcomes.length - succeeded

    setIsGenerating(false)
    setResult({ succeeded, failed })
    if (failed === 0) {
      setSelected({})
      setSkuPrefix('')
      setPrice('')
      setSalePrice('')
      setStock('')
    }
  }

  return (
    <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-white">Bulk-generate variants</p>
        <p className="text-white/30 text-xs mt-0.5">
          Pick values for every option to create all combinations at once (e.g. every Size × Color).
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {configuredOptions.map(option => (
          <div key={option.id}>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">{option.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {sortOptionValueObjects(option.values).map(value => {
                const isChecked = (selected[option.id] ?? []).includes(value.id)
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => toggleValue(option.id, value.id)}
                    className={[
                      'rounded-lg border px-2.5 py-1 text-xs transition-colors',
                      isChecked
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200'
                        : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {value.value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={skuPrefix}
          onChange={e => setSkuPrefix(e.target.value)}
          placeholder="SKU prefix (optional)"
          className="input input-xs flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
        />
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price"
          className="input input-xs w-24 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <input
          type="number"
          step="0.01"
          value={salePrice}
          onChange={e => setSalePrice(e.target.value)}
          placeholder="Sale price"
          className="input input-xs w-24 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
        <input
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          placeholder="Stock (∞)"
          title="Blank = unlimited stock"
          className="input input-xs w-20 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
        />
      </div>

      {result && (
        <p className={result.failed > 0 ? 'text-amber-400 text-xs' : 'text-emerald-400 text-xs'}>
          Created {result.succeeded} variant{result.succeeded === 1 ? '' : 's'}
          {result.failed > 0 ? `, ${result.failed} failed (likely duplicate SKUs)` : ''}.
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
      >
        {isGenerating ? (
          <span className="loading loading-spinner loading-xs" />
        ) : readyOptionCount === configuredOptions.length ? (
          `Generate ${combinationCount} variant${combinationCount === 1 ? '' : 's'}`
        ) : (
          'Select at least one value per option'
        )}
      </button>
    </div>
  )
}
