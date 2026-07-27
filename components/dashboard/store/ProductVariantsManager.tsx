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

// A plain product with no color/size/etc. options — just one thing, in some quantity. Rather
// than making the merchant type a SKU and pick option values for a variant that has none, this
// carries stock on a single implicit variant (created on first save) whose price/salePrice are
// kept mirrored to the product's own Base/Sale price, so the merchant only ever sees "Base
// Price", "Sale Price", and "Stock" as three plain fields — the variant underneath is invisible.
function SimpleStockField({
  productId,
  variant,
  basePrice,
  salePrice,
}: {
  productId: string
  variant: ProductVariantResponse | null
  basePrice: number
  salePrice: number | null
}) {
  const { mutate: createVariant, isPending: isCreating, error: createError } = useCreateProductVariant(productId)
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateProductVariant(productId)

  // Keep the implicit variant's price mirrored to the product's own Base/Sale price whenever a
  // save above changes them — otherwise the storefront would keep showing this variant's stale
  // price instead of the new Base Price, since a variant's own price always wins once it exists.
  const [prevBasePrice, setPrevBasePrice] = useState(basePrice)
  const [prevSalePrice, setPrevSalePrice] = useState(salePrice)
  if (variant && (basePrice !== prevBasePrice || salePrice !== prevSalePrice)) {
    setPrevBasePrice(basePrice)
    setPrevSalePrice(salePrice)
    if (variant.price !== basePrice || variant.salePrice !== salePrice) {
      updateVariant({ variantId: variant.id, body: { price: basePrice, salePrice } })
    }
  }

  const [stock, setStock] = useState(variant?.stock != null ? String(variant.stock) : '')
  const [prevVariantId, setPrevVariantId] = useState(variant?.id ?? null)
  if ((variant?.id ?? null) !== prevVariantId) {
    setPrevVariantId(variant?.id ?? null)
    setStock(variant?.stock != null ? String(variant.stock) : '')
  }

  function save() {
    const s = parseInt(stock, 10)
    if (stock.trim() === '' || isNaN(s) || s < 0) return
    if (variant) {
      if (s !== variant.stock) updateVariant({ variantId: variant.id, body: { stock: s } })
    } else {
      createVariant({ sku: 'BASE', price: basePrice, salePrice, stock: s, optionValueIds: [] })
    }
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">მარაგი</h2>
      <div className="fieldset gap-2 max-w-40">
        <label htmlFor="p-stock-simple" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
          ცალი <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="p-stock-simple"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={e => setStock(e.target.value)}
            onBlur={save}
            required
            className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 tabular-nums"
          />
          {(isCreating || isUpdating) && <span className="loading loading-spinner loading-xs text-fuchsia-400 shrink-0" />}
        </div>
      </div>
      {createError && <p className="text-error text-xs">მარაგის შენახვა ვერ მოხერხდა.</p>}
    </div>
  )
}

export function ProductVariantsManager({
  productId,
  options,
  variants,
  basePrice,
  salePrice,
}: {
  productId: string
  options: ProductOptionResponse[]
  variants: ProductVariantResponse[]
  basePrice: number
  salePrice: number | null
}) {
  const { mutate: createVariant, isPending, error } = useCreateProductVariant(productId)
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [salePriceInput, setSalePriceInput] = useState('')
  const [stock, setStock] = useState('')
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  const configuredOptions = options.filter(option => option.values.length > 0)
  const allOptionsSelected = configuredOptions.every(option => !!selectedValues[option.id])

  if (configuredOptions.length === 0) {
    return <SimpleStockField productId={productId} variant={variants[0] ?? null} basePrice={basePrice} salePrice={salePrice} />
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const p = parseFloat(price)
    const s = stock.trim() === '' ? null : parseInt(stock, 10)
    if (!sku.trim() || isNaN(p) || (s !== null && isNaN(s)) || !allOptionsSelected) return

    const sp = parseFloat(salePriceInput)

    createVariant(
      {
        sku: sku.trim(),
        price: p,
        salePrice: salePriceInput.trim() && !isNaN(sp) ? sp : null,
        stock: s,
        optionValueIds: Object.values(selectedValues),
      },
      {
        onSuccess: () => {
          setSku('')
          setPrice('')
          setSalePriceInput('')
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
            value={salePriceInput}
            onChange={e => setSalePriceInput(e.target.value)}
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
