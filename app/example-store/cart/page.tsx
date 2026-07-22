'use client'

import Link from 'next/link'
import { useCart } from '@/lib/store/cart-context'
import { CImg } from '@/components/ui/CImg'

export default function CartPage() {
  const { items, count, subtotal, removeItem, updateQty } = useCart()

  const shipping = subtotal >= 100 ? 0 : 9.99
  const total = subtotal + shipping

  if (count === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 border border-[#e5e5e5] flex items-center justify-center mb-6 text-3xl">
          👟
        </div>
        <h1 className="font-black text-2xl text-[#111] mb-3">კალათა ცარიელია</h1>
        <p className="text-[#999] text-sm mb-8">
          ჯერ არაფერი დაგიმატებიათ. დაათვალიერეთ ჩვენი კოლექცია.
        </p>
        <Link
          href="/example-store/products"
          className="bg-[#111] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#333] transition-colors"
        >
          ახლა ყიდვა
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
      <div className="mb-8 pb-6 border-b border-[#e5e5e5]">
        <h1 className="font-black text-3xl text-[#111] tracking-tight">თქვენი კალათა</h1>
        <p className="text-[#999] text-sm mt-1">{count} ნივთი</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col divide-y divide-[#e5e5e5]">
          {items.map(item => (
            <div
              key={`${item.product.id}-${item.color}-${item.size}`}
              className="flex gap-4 py-6"
            >
              <Link
                href={`/example-store/products/${item.product.slug}`}
                className="w-24 h-24 bg-[#f7f7f7] shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
              >
                <CImg src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/example-store/products/${item.product.slug}`}
                    className="font-semibold text-[#111] text-sm hover:underline underline-offset-2 leading-snug"
                  >
                    {item.product.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.product.id, item.color, item.size)}
                    className="text-[#ccc] hover:text-[#c8102e] transition-colors shrink-0 ml-2"
                    aria-label="ნივთის წაშლა"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full border border-[#ddd] shrink-0"
                    style={{ backgroundColor: item.product.variants.find(v => v.color === item.color)?.colorHex }}
                  />
                  <span className="text-[#999] text-xs">{item.color}</span>
                  <span className="text-[#ddd] text-xs">·</span>
                  <span className="text-[#999] text-xs">EU {item.size}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-[#e5e5e5]">
                    <button
                      onClick={() => updateQty(item.product.id, item.color, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-[#111] text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, item.color, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-[#111]">
                    ₾{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-6">
            <Link
              href="/example-store/products"
              className="text-sm text-[#999] hover:text-[#111] transition-colors underline underline-offset-2"
            >
              ← შოპინგის გაგრძელება
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-[#e5e5e5] p-6 sticky top-20">
            <h2 className="font-bold text-[#111] text-base mb-6 pb-4 border-b border-[#e5e5e5]">
              შეკვეთის შეჯამება
            </h2>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">შუალედური ჯამი ({count} ნივთი)</span>
                <span className="text-[#111] font-medium">₾{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">მიტანა</span>
                <span className={shipping === 0 ? 'text-[#2d6a2d] font-medium' : 'text-[#111] font-medium'}>
                  {shipping === 0 ? 'უფასო' : `₾${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[#bbb] text-xs">
                  დაამატეთ კიდევ ₾{(100 - subtotal).toFixed(2)} უფასო მიტანისთვის
                </p>
              )}
            </div>

            <div className="border-t border-[#e5e5e5] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-[#111]">სულ</span>
                <span className="font-black text-[#111] text-lg">₾{total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/example-store/checkout"
              className="block w-full text-center py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#333] transition-colors"
            >
              გადახდაზე გადასვლა
            </Link>

            <div className="mt-5 flex flex-col gap-2">
              {['დაცული გადახდა', 'უფასო დაბრუნება', 'SSL დაშიფვრა'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-[#999]">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6l3 3 5-5" stroke="#2d6a2d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
