'use client'

import { useState } from 'react'
import {
  useCreateProductVariant,
  useDeleteProductVariant,
  useUpdateProductVariant,
} from '@/lib/queries/storefront-admin'
import { BulkVariantGenerator } from './BulkVariantGenerator'
import { IconButton } from '@/components/ui/IconButton'
import { PlusIcon, TrashIcon } from '@/components/ui/icons'
import type { ProductOptionResponse, ProductVariantResponse } from '@/lib/types/storefront'
import { sortOptionValueObjects } from '@/lib/sortOptionValues'

function VariantRow({ productId, variant }: { productId: string; variant: ProductVariantResponse }) {
  const { mutate: updateVariant } = useUpdateProductVariant(productId)
  const { mutate: deleteVariant } = useDeleteProductVariant(productId)
  const [price, setPrice] = useState(String(variant.price))
  const [salePrice, setSalePrice] = useState(variant.salePrice !== null ? String(variant.salePrice) : '')
  const [stock, setStock] = useState(variant.stock !== null ? String(variant.stock) : '')

  function saveIfChanged() {
    const p = parseFloat(price)
    const sp = parseFloat(salePrice)
    const s = stock.trim() === '' ? null : parseInt(stock, 10)
    const body: { price?: number; salePrice?: number | null; stock?: number; clearStock?: boolean } = {}
    if (!isNaN(p) && p !== variant.price) body.price = p
    if (salePrice.trim() === '' && variant.salePrice !== null) body.salePrice = null
    else if (!isNaN(sp) && sp !== variant.salePrice) body.salePrice = sp
    if (s === null && variant.stock !== null) body.clearStock = true
    else if (s !== null && !isNaN(s) && s !== variant.stock) body.stock = s
    if (Object.keys(body).length > 0) updateVariant({ variantId: variant.id, body })
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
      <span className="font-mono text-xs text-white/50">{variant.sku}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          onBlur={saveIfChanged}
          title="ფასი"
          className="input input-xs w-20 bg-white/4 border-white/10 focus:border-fuchsia-500/60 tabular-nums"
        />
        <span className="text-white/25 text-xs">₾</span>
        <input
          type="number"
          step="0.01"
          value={salePrice}
          onChange={e => setSalePrice(e.target.value)}
          onBlur={saveIfChanged}
          placeholder="ფასდაკლება"
          title="ფასდაკლებული ფასი"
          className="input input-xs w-20 bg-white/4 border-white/10 focus:border-fuchsia-500/60 tabular-nums"
        />
        <input
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          onBlur={saveIfChanged}
          placeholder="∞"
          title="მარაგი (ცარიელი = შეუზღუდავი)"
          className="input input-xs w-16 bg-white/4 border-white/10 focus:border-fuchsia-500/60 tabular-nums"
        />
        <span className="text-white/25 text-xs">{stock.trim() === '' ? 'შეუზღუდავი' : 'მარაგშია'}</span>
        <IconButton
          icon={<TrashIcon />}
          label="წაშლა"
          onClick={() => { if (confirm('წავშალო ეს ვარიაცია?')) deleteVariant(variant.id) }}
          variant="danger"
        />
      </div>
    </div>
  )
}

export function ProductVariantsManager({
  productId,
  options,
  variants,
}: {
  productId: string
  options: ProductOptionResponse[]
  variants: ProductVariantResponse[]
}) {
  const { mutate: createVariant, isPending, error } = useCreateProductVariant(productId)
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('')
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  const configuredOptions = options.filter(option => option.values.length > 0)
  const allOptionsSelected = configuredOptions.every(option => !!selectedValues[option.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const p = parseFloat(price)
    const s = stock.trim() === '' ? null : parseInt(stock, 10)
    if (!sku.trim() || isNaN(p) || (s !== null && isNaN(s)) || !allOptionsSelected) return

    const sp = parseFloat(salePrice)

    createVariant(
      {
        sku: sku.trim(),
        price: p,
        salePrice: salePrice.trim() && !isNaN(sp) ? sp : null,
        stock: s,
        optionValueIds: Object.values(selectedValues),
      },
      {
        onSuccess: () => {
          setSku('')
          setPrice('')
          setSalePrice('')
          setStock('')
          setSelectedValues({})
        },
      }
    )
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">ვარიაციები</h2>

      {variants.length > 0 ? (
        <div className="flex flex-col gap-2">
          {variants.map(variant => (
            <VariantRow key={variant.id} productId={productId} variant={variant} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">
          ვარიაციები ჯერ არ არის — ეს პროდუქტი იყიდება საბაზისო ფასად შეუზღუდავი მარაგით. დაამატეთ ვარიაცია მხოლოდ მაშინ, როცა
          გჭირდებათ ფასის ან მარაგის შეცვლა კონკრეტული პარამეტრების კომბინაციისთვის.
        </p>
      )}

      {options.length > 0 && <BulkVariantGenerator productId={productId} options={options} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={sku}
            onChange={e => setSku(e.target.value)}
            placeholder="SKU"
            className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
          />
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="ფასი"
            className="input input-sm w-24 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
          <input
            type="number"
            step="0.01"
            value={salePrice}
            onChange={e => setSalePrice(e.target.value)}
            placeholder="ფასდაკლებული ფასი"
            className="input input-sm w-24 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
          <input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
            placeholder="მარაგი (∞)"
            title="ცარიელი = შეუზღუდავი მარაგი"
            className="input input-sm w-20 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
          />
        </div>

        {configuredOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {configuredOptions.map(option => (
              <select
                key={option.id}
                value={selectedValues[option.id] ?? ''}
                onChange={e => setSelectedValues(prev => ({ ...prev, [option.id]: e.target.value }))}
                className="select select-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              >
                <option value="">{option.name}...</option>
                {sortOptionValueObjects(option.values).map(v => (
                  <option key={v.id} value={v.id}>{v.value}</option>
                ))}
              </select>
            ))}
          </div>
        )}

        {configuredOptions.length > 0 && !allOptionsSelected && (
          <p className="text-white/30 text-xs">აირჩიეთ მნიშვნელობა ყველა პარამეტრისთვის ვარიაციის დამატებამდე.</p>
        )}

        {error && <p className="text-error text-xs">ვარიაციის შექმნა ვერ მოხერხდა. დარწმუნდით, რომ SKU უნიკალურია და ფასდაკლებული ფასი ნაკლებია ფასზე.</p>}

        <button
          type="submit"
          disabled={isPending || !sku.trim() || !price || !allOptionsSelected}
          className="btn btn-sm gap-1.5 self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isPending ? <span className="loading loading-spinner loading-xs" /> : <><PlusIcon /> ვარიაციის დამატება</>}
        </button>
      </form>
    </div>
  )
}
