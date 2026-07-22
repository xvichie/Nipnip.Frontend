'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAddOrderNote, useMyOrders, useMyOrdersMonthly, useUpdateOrderStatus, useUpdatePaymentConfirmed } from '@/lib/queries/storefront-admin'
import { useQuickShipperStatus, useRefreshQuickShipperOrder } from '@/lib/queries/quickshipper'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { QuickShipperOrderModal } from '@/components/dashboard/store/QuickShipperOrderModal'
import type { OrderDetailResponse, OrderStatus } from '@/lib/types/storefront'

const PAGE_SIZE = 20

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'Pending', label: 'მოლოდინში' },
  { value: 'Confirmed', label: 'დადასტურებული' },
  { value: 'Shipped', label: 'გაგზავნილი' },
  { value: 'Delivered', label: 'მიწოდებული' },
  { value: 'Cancelled', label: 'გაუქმებული' },
]

const STATUS_LABELS: Record<OrderStatus, string> = Object.fromEntries(
  STATUS_OPTIONS.map(opt => [opt.value, opt.label])
) as Record<OrderStatus, string>

const STATUS_CLASSES: Record<OrderStatus, string> = {
  Pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Confirmed: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  Shipped: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  Delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Cancelled: 'bg-red-500/10 border-red-500/20 text-red-400',
}

const PAYMENT_LABELS: Record<string, string> = {
  CashOnDelivery: 'გადახდა მიტანისას',
  BankTransfer: 'საბანკო გადარიცხვა',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

function monthLabelFull(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function OrderRow({ order, quickShipperReady }: { order: OrderDetailResponse; quickShipperReady: boolean }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { date, time } = formatDateTime(order.createdAt)
  const isBankTransfer = order.paymentMethod === 'BankTransfer'
  const paymentConfirmed = !!order.paymentConfirmedAt

  return (
    <div className="border-b border-white/4 last:border-0">
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{order.customerName}</p>
          <p className="text-white/30 text-xs truncate mt-0.5">
            {order.items.length} პროდუქტი · {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>

        {isBankTransfer && (
          <span
            className={[
              'shrink-0 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium',
              paymentConfirmed
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/4 border-white/10 text-white/40',
            ].join(' ')}
          >
            {paymentConfirmed ? 'გადახდილია' : 'გადახდის მოლოდინში'}
          </span>
        )}

        <span className={`shrink-0 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>

        <span className="shrink-0 text-fuchsia-400 font-semibold text-sm tabular-nums w-20 text-right">
          {order.total.toFixed(2)} ₾
        </span>

        <div className="shrink-0 text-right w-24">
          <p className="text-white/40 text-xs whitespace-nowrap">{date}</p>
          <p className="text-white/25 text-xs whitespace-nowrap">{time}</p>
        </div>

        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 text-white/30">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {detailsOpen && (
        <OrderDetailsModal order={order} quickShipperReady={quickShipperReady} onClose={() => setDetailsOpen(false)} />
      )}
    </div>
  )
}

function OrderDetailsModal({
  order,
  quickShipperReady,
  onClose,
}: {
  order: OrderDetailResponse
  quickShipperReady: boolean
  onClose: () => void
}) {
  const [noteText, setNoteText] = useState('')
  const [shippingModalOpen, setShippingModalOpen] = useState(false)
  const { mutate: updateStatus, isPending: statusPending } = useUpdateOrderStatus()
  const { mutate: updatePaymentConfirmed, isPending: paymentPending } = useUpdatePaymentConfirmed()
  const { mutate: addNote, isPending: notePending } = useAddOrderNote()
  const { mutate: refreshQuickShipper, isPending: refreshingQuickShipper } = useRefreshQuickShipperOrder()
  const isBankTransfer = order.paymentMethod === 'BankTransfer'
  const paymentConfirmed = !!order.paymentConfirmedAt

  function handleAddNote() {
    if (!noteText.trim()) return
    addNote({ id: order.id, content: noteText.trim() }, { onSuccess: () => setNoteText('') })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col gap-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{order.customerName}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white" aria-label="დახურვა">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2">
          {order.items.map(item => (
            <Link
              key={item.id}
              href={`/dashboard/merchant/store/products/${item.productId}`}
              className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 hover:bg-white/4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/15 text-[9px]">—</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{item.productName}</p>
                {item.options.length > 0 && (
                  <p className="text-white/30 text-xs truncate">
                    {item.options.map(o => `${o.optionName}: ${o.value}`).join(', ')}
                  </p>
                )}
              </div>
              <p className="text-white/40 text-xs shrink-0">×{item.quantity}</p>
              <p className="text-white/70 text-sm font-medium shrink-0 w-16 text-right">
                {(item.priceAtPurchase * item.quantity).toFixed(2)} ₾
              </p>
            </Link>
          ))}
          {order.shippingZoneName && (
            <div className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/60">მიწოდება — {order.shippingZoneName}</p>
              </div>
              <p className="text-white/70 text-sm font-medium shrink-0">
                {order.shippingFee > 0 ? `${order.shippingFee.toFixed(2)} ₾` : 'უფასო'}
              </p>
            </div>
          )}
        </div>

        {/* Status changer */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">სტატუსი</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={statusPending}
                onClick={() => updateStatus({ id: order.id, status: opt.value })}
                className={[
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40',
                  order.status === opt.value
                    ? STATUS_CLASSES[opt.value]
                    : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">გადახდა</p>
          <div className="flex items-center gap-2 flex-wrap">
            {order.paymentMethod === 'Flitt' ? (
              <a
                href="https://portal.flitt.com/#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#788FFF]/30 bg-[#788FFF]/15 px-2.5 py-1 text-xs font-medium text-[#788FFF] hover:bg-[#788FFF]/25 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 496 198" fill="none" aria-hidden className="shrink-0">
                  <path
                    fill="currentColor"
                    d="m483.5,121.39c1.74-2.56,2.94-5.54,3.4-8.78l4.79-33.25c.19-1.13.3-2.29.3-3.48,0-11.56-9.36-20.92-20.92-20.92h-18.36l4.24-29.46c.87-6.01-.92-12.09-4.88-16.67-3.98-4.59-9.75-7.23-15.81-7.23h-36.53c-10.4,0-19.23,7.64-20.71,17.94l-5.25,36.49c-2.08-.69-4.3-1.06-6.62-1.06h-18.36l4.25-29.46c.86-6.01-.92-12.09-4.9-16.67-3.98-4.59-9.75-7.23-15.81-7.23h-36.53c-7.54,0-14.25,4.01-17.93,10.14-7.31-7.25-17.35-11.74-28.44-11.74-9.6,0-18.42,3.36-25.36,8.97-3.83-4.51-9.55-7.37-15.93-7.37h-116.08c-23.44,0-39.31,4.6-53.02,15.38-16.45,12.92-20.95,32.47-22.91,46.04L.21,173.51c-.86,6.01.92,12.09,4.9,16.67,3.98,4.6,9.75,7.23,15.81,7.23h36.53c10.4,0,19.23-7.64,20.71-17.94l5.3-36.81h49.67l-4.44,30.85c-.86,6.01.92,12.09,4.9,16.67,3.98,4.6,9.75,7.23,15.81,7.23h98.65c10.4,0,19.23-7.64,20.71-17.94l1.62-11.25c6.31,9.75,15.2,17.65,25.94,22.57,12.09,5.53,24.63,6.62,42.21,6.62h26.91c9.72,0,18.07-6.68,20.33-15.97,4.31,3.75,9.17,6.92,14.49,9.35,12.09,5.53,24.63,6.62,42.21,6.62h26.9c10.4,0,19.23-7.64,20.71-17.94l5.14-35.66c.19-1.13.3-2.29.3-3.49,0-8.36-4.91-15.59-12.02-18.93ZM142.02,58.68h-52.11c-5.05,0-9.17.37-12.27,2.72-2.57,1.96-4.35,5.14-5.12,10.59l-2.32,16h67.6l-4.87,33.74h-67.59l-7.88,54.75H20.92l15.92-110.48c2.1-14.56,6.37-25.69,15.12-32.58,9.21-7.23,20.03-10.9,40.09-10.9h55.17l-5.21,36.15Zm43.93,117.81h-36.53l22.19-153.96h36.52l-22.18,153.96Zm62.12,0h-36.52l14.49-100.6h36.53l-14.5,100.6Zm1.36-116.65c-10.76,0-19.46-8.71-19.46-19.46s8.69-19.47,19.46-19.47,19.44,8.72,19.44,19.47-8.71,19.46-19.44,19.46Zm116.03,116.65h-26.91c-17.4,0-25.85-1.22-33.49-4.72-14.2-6.51-22.91-20.65-23.98-35.78-.31-4.36.14-12.34,1.55-22.07l13.16-91.39h36.53l-7.69,53.36h42.51l-4.86,33.74h-42.51l-2.08,14.46c-.64,4.48-.25,8.36,1.8,11.27,2.58,3.63,6.86,4.96,15.16,4.96h36.01l-5.21,36.16Zm103.92,0h-26.9c-17.41,0-25.85-1.22-33.49-4.72-14.2-6.51-22.91-20.65-23.98-35.78-.31-4.36.14-12.34,1.54-22.07l13.17-91.39h36.53l-7.69,53.36h42.51l-4.86,33.74h-42.51l-2.09,14.46c-.64,4.48-.25,8.36,1.82,11.27,2.58,3.63,6.86,4.96,15.14,4.96h36.02l-5.22,36.16Z"
                  />
                </svg>
                Flitt
              </a>
            ) : order.paymentMethod === 'Tbc' ? (
              <a
                href="https://ecom.tbcpayments.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#4FC3F7]/30 bg-[#4FC3F7]/15 px-2.5 py-1 text-xs font-medium text-[#4FC3F7] hover:bg-[#4FC3F7]/25 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tbc-logo.jpg" alt="" className="w-3.5 h-3.5 rounded object-cover" />
                TBC
              </a>
            ) : (
              <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/4 px-2.5 py-1 text-xs font-medium text-white/70">
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            )}
            {isBankTransfer && (
              <button
                type="button"
                disabled={paymentPending}
                onClick={() => updatePaymentConfirmed({ id: order.id, confirmed: !paymentConfirmed })}
                className={[
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40',
                  paymentConfirmed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                ].join(' ')}
              >
                {paymentConfirmed ? '✓ გადახდილია — მონიშვნის მოხსნა' : 'მონიშვნა როგორც გადახდილი'}
              </button>
            )}
          </div>
        </div>

        {/* QuickShipper delivery */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">მიწოდება</p>
          {order.quickShipperOrderId ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/quickshipper-logo.jpg" alt="" className="w-3.5 h-3.5 rounded object-cover" />
                QuickShipper #{order.quickShipperOrderId}{order.quickShipperStatus ? ` · ${order.quickShipperStatus}` : ''}
              </span>
              <button
                type="button"
                disabled={refreshingQuickShipper}
                onClick={() => refreshQuickShipper(order.id)}
                className="btn btn-xs bg-white/4 border-white/8 text-white/50 hover:text-white disabled:opacity-40"
              >
                {refreshingQuickShipper ? <span className="loading loading-spinner loading-xs" /> : 'განახლება'}
              </button>
              {order.quickShipperTrackingUrl && (
                <a
                  href={order.quickShipperTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs bg-white/4 border-white/8 text-white/50 hover:text-white"
                >
                  თრექინგის მთლიანად ჩვენება
                </a>
              )}
              {order.quickShipperTrackingUrl && (
                <div className="w-full rounded-xl overflow-hidden border border-white/10 h-[600px]">
                  <iframe
                    title="QuickShipper თვალყურის დევნება"
                    className="w-full h-full border-0"
                    loading="lazy"
                    src={order.quickShipperTrackingUrl}
                  />
                </div>
              )}
            </div>
          ) : quickShipperReady ? (
            <button
              type="button"
              onClick={() => setShippingModalOpen(true)}
              className="self-start inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200 hover:from-fuchsia-500/25 hover:to-violet-500/25 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/quickshipper-logo.jpg" alt="" className="w-4 h-4 rounded object-cover" />
              QuickShipper-ით გაგზავნა
            </button>
          ) : (
            <p className="text-white/25 text-xs">
              დააკავშირე QuickShipper და დააყენე ასაღები მისამართი{' '}
              <Link href="/dashboard/merchant/store/integrations" className="underline underline-offset-2 hover:text-white/50">
                ინტეგრაციების გვერდზე
              </Link>
              .
            </p>
          )}
        </div>

        {shippingModalOpen && (
          <QuickShipperOrderModal orderId={order.id} onClose={() => setShippingModalOpen(false)} />
        )}

        {/* Customer */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">მომხმარებელი</p>
          <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-2.5">
            <a href={`mailto:${order.email}`} className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-white/30">
                <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2.5 4.5 8 8.5l5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {order.email}
            </a>
            <a href={`tel:${order.phone}`} className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-white/30">
                <path d="M3.5 2.5h2.2l1 3-1.5 1.2a8 8 0 0 0 3.6 3.6l1.2-1.5 3 1v2.2a1 1 0 0 1-1.1 1 11 11 0 0 1-9.4-9.4 1 1 0 0 1 1-1.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {order.phone}
            </a>
            <div className="flex items-start gap-2.5 text-sm text-white/70">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-white/30 mt-0.5">
                <path d="M8 14.5s5-4.4 5-8.2A5 5 0 0 0 3 6.3c0 3.8 5 8.2 5 8.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <circle cx="8" cy="6.3" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              {order.latitude && order.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  {order.address}
                </a>
              ) : (
                <span>{order.address}</span>
              )}
            </div>
          </div>
          {order.latitude && order.longitude && (
            <div className="rounded-xl overflow-hidden border border-white/10 h-52">
              <iframe
                title="მისამართის რუკა"
                className="w-full h-full border-0"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.longitude - 0.006}%2C${order.latitude - 0.006}%2C${order.longitude + 0.006}%2C${order.latitude + 0.006}&layer=mapnik&marker=${order.latitude}%2C${order.longitude}`}
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">კომენტარები</p>
          {order.notes.length > 0 && (
            <div className="flex flex-col gap-2">
              {order.notes.map(note => {
                const noteTime = formatDateTime(note.createdAt)
                return (
                  <div key={note.id} className="rounded-xl bg-white/2 border border-white/5 px-4 py-2.5">
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-white/25 text-[11px] mt-1">{noteTime.date} · {noteTime.time}</p>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-start gap-2">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="დაამატეთ კომენტარი..."
              rows={2}
              className="flex-1 rounded-xl bg-white/4 border border-white/10 focus:border-fuchsia-500/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={notePending || !noteText.trim()}
              className="btn btn-sm bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 shrink-0"
            >
              დამატება
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MerchantStoreOrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const { data: quickShipperStatus } = useQuickShipperStatus()
  const quickShipperReady = !!quickShipperStatus?.isConnected && quickShipperStatus.hasPickupLocation

  const { data: monthly, isLoading: monthlyLoading, isError: monthlyError } = useMyOrdersMonthly(status)
  const { data, isLoading, isError } = useMyOrders({
    page,
    pageSize: PAGE_SIZE,
    status,
    month: selectedMonth?.month,
    year: selectedMonth?.year,
  })

  const totalPages = data?.totalPages ?? 1

  function selectStatus(next: OrderStatus | undefined) {
    setStatus(next)
    setPage(1)
  }

  function selectMonth(year: number, month: number) {
    setSelectedMonth(prev => (prev?.year === year && prev?.month === month ? null : { year, month }))
    setPage(1)
  }

  const totals = (monthly ?? []).reduce(
    (acc, m) => ({
      revenue: acc.revenue + m.revenue,
      orderCount: acc.orderCount + m.orderCount,
      productsSold: acc.productsSold + m.productsSold,
    }),
    { revenue: 0, orderCount: 0, productsSold: 0 }
  )

  const activeSummary = selectedMonth
    ? monthly?.find(m => m.year === selectedMonth.year && m.month === selectedMonth.month) ?? {
        revenue: 0, orderCount: 0, productsSold: 0, averageOrderValue: 0, averageItemPrice: 0,
      }
    : {
        revenue: totals.revenue,
        orderCount: totals.orderCount,
        productsSold: totals.productsSold,
        averageOrderValue: totals.orderCount > 0 ? totals.revenue / totals.orderCount : 0,
        averageItemPrice: totals.productsSold > 0 ? totals.revenue / totals.productsSold : 0,
      }

  const chartData = monthly
    ? [...monthly].reverse().map(m => ({ label: monthLabel(m.year, m.month), value: m.revenue, year: m.year, month: m.month }))
    : []

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-white">შეკვეთები</h1>
        <p className="text-white/40 text-sm mt-1">თვალყური ადევნეთ თქვენს მაღაზიაში შემოსულ შეკვეთებსა და შემოსავალს.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => selectStatus(undefined)}
          className={[
            'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
            !status
              ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
              : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
          ].join(' ')}
        >
          ყველა
        </button>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => selectStatus(opt.value)}
            className={[
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              status === opt.value
                ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary card */}
      {monthlyLoading ? (
        <div className="skeleton h-32 rounded-2xl" />
      ) : monthlyError ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-6">
          <div className="alert alert-error text-sm rounded-xl">სტატისტიკის ჩატვირთვა ვერ მოხერხდა. სცადეთ გვერდის განახლება.</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-fuchsia-400/60 text-xs uppercase tracking-widest">
              {selectedMonth ? monthLabelFull(selectedMonth.year, selectedMonth.month) : 'მთლიანი პერიოდი'}
            </p>
            {status && (
              <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">შემოსავალი</p>
              <p className="text-2xl font-black tabular-nums text-fuchsia-300">{activeSummary.revenue.toFixed(2)} ₾</p>
            </div>
            <div>
              <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">შეკვეთები</p>
              <p className="text-2xl font-black tabular-nums text-white">{activeSummary.orderCount}</p>
            </div>
            <div>
              <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">გაყ. ერთეული</p>
              <p className="text-2xl font-black tabular-nums text-white">{activeSummary.productsSold}</p>
            </div>
            <div>
              <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">საშ. შეკვეთა</p>
              <p className="text-2xl font-black tabular-nums text-white">{activeSummary.averageOrderValue.toFixed(2)} ₾</p>
            </div>
            <div>
              <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">საშ. გასაყ. ფასი</p>
              <p className="text-2xl font-black tabular-nums text-white">{activeSummary.averageItemPrice.toFixed(2)} ₾</p>
            </div>
          </div>
          {!status && (
            <p className="text-white/25 text-xs mt-4">
              გაუქმებული შეკვეთები არ ითვლება შემოსავალში — მათი სანახავად აირჩიეთ &quot;{STATUS_LABELS.Cancelled}&quot; სტატუსების ფილტრში.
            </p>
          )}
        </div>
      )}

      {/* Chart card */}
      <div className="rounded-2xl border border-white/7 bg-white/2 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">თვიური შემოსავალი</p>
          {selectedMonth && (
            <button
              onClick={() => { setSelectedMonth(null); setPage(1) }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              ყველა დრო ×
            </button>
          )}
        </div>

        {monthlyLoading ? (
          <div className="skeleton h-35 rounded-xl" />
        ) : monthlyError ? (
          <div className="h-35 flex items-center justify-center text-red-400/60 text-sm">სტატისტიკის ჩატვირთვა ვერ მოხერხდა.</div>
        ) : chartData.length === 0 ? (
          <div className="h-35 flex items-center justify-center text-white/15 text-sm">შეკვეთები ჯერ არ არის.</div>
        ) : (
          <MonthlyBarChart
            data={chartData}
            accentColor="#d946ef"
            accentDimColor="rgba(217,70,239,0.18)"
            selectedYear={selectedMonth?.year}
            selectedMonth={selectedMonth?.month}
            onSelect={selectMonth}
            currency="₾"
          />
        )}

        {!monthlyLoading && chartData.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            <button
              onClick={() => { setSelectedMonth(null); setPage(1) }}
              className={[
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                !selectedMonth
                  ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                  : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
              ].join(' ')}
            >
              ყველა დრო
            </button>
            {[...monthly!].reverse().map(m => {
              const active = selectedMonth?.year === m.year && selectedMonth?.month === m.month
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => selectMonth(m.year, m.month)}
                  className={[
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    active
                      ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
                      : 'bg-white/4 border-white/8 text-white/35 hover:text-white/60',
                  ].join(' ')}
                >
                  {monthLabel(m.year, m.month)}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly breakdown table */}
      {!monthlyLoading && monthly && monthly.length > 0 && (
        <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">თვიური ჩაშლა</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-left whitespace-nowrap">თვე</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">შემოსავალი</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">შეკვეთები</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">გაყ. ერთეული</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">საშ. შეკვეთა</th>
                  <th className="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-widest text-right whitespace-nowrap">საშ. ერთ. ფასი</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map(m => {
                  const active = selectedMonth?.year === m.year && selectedMonth?.month === m.month
                  return (
                    <tr
                      key={`${m.year}-${m.month}`}
                      onClick={() => selectMonth(m.year, m.month)}
                      className={`border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors cursor-pointer ${active ? 'bg-fuchsia-500/5' : ''}`}
                    >
                      <td className="px-6 py-3.5 text-white text-sm font-medium whitespace-nowrap">{monthLabelFull(m.year, m.month)}</td>
                      <td className="px-6 py-3.5 text-right text-fuchsia-400 font-semibold text-sm tabular-nums whitespace-nowrap">{m.revenue.toFixed(2)} ₾</td>
                      <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums">{m.orderCount}</td>
                      <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums">{m.productsSold}</td>
                      <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums whitespace-nowrap">{m.averageOrderValue.toFixed(2)} ₾</td>
                      <td className="px-6 py-3.5 text-right text-white/60 text-sm tabular-nums whitespace-nowrap">{m.averageItemPrice.toFixed(2)} ₾</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order list */}
      <div className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="alert alert-error text-sm rounded-xl">შეკვეთების ჩატვირთვა ვერ მოხერხდა.</div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-white/20 text-sm">შეკვეთები ჯერ არ არის.</p>
          </div>
        ) : (
          data.items.map(order => <OrderRow key={order.id} order={order} quickShipperReady={quickShipperReady} />)
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
