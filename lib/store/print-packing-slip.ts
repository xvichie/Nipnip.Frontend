import type { OrderDetailResponse } from '@/lib/types/storefront'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

/**
 * Opens a blank, chrome-free window with a print-ready packing slip and triggers the browser
 * print dialog — no server round-trip needed since the caller already has the full order detail
 * in memory (the orders list query returns full OrderDetailResponse objects, not summaries).
 */
export function printPackingSlip(order: OrderDetailResponse) {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const { id, customerName, email, phone, address, createdAt, items, bundleItems, shippingFee, shippingZoneName, discountAmount, discountCode, total, customerNote, isPickup } = order

  const rows = bundleItems.map(item => `
    <tr>
      <td>${escapeHtml(item.bundleName)} <span class="muted">(bundle)</span></td>
      <td>—</td>
      <td class="right">${item.quantity}</td>
      <td class="right">₾${item.priceAtPurchase.toFixed(2)}</td>
      <td class="right">₾${(item.priceAtPurchase * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('') + items.map(item => `
    <tr>
      <td>${escapeHtml(item.productName)}${item.options.length > 0 ? `<br><span class="muted">${escapeHtml(item.options.map(o => `${o.optionName}: ${o.value}`).join(', '))}</span>` : ''}</td>
      <td>${escapeHtml(item.sku)}</td>
      <td class="right">${item.quantity}</td>
      <td class="right">₾${item.priceAtPurchase.toFixed(2)}</td>
      <td class="right">₾${(item.priceAtPurchase * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Packing Slip — Order #${id.slice(0, 8)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #111; padding: 32px; max-width: 720px; margin: 0 auto; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .muted { color: #666; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 6px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #ddd; font-size: 13px; }
        th { font-size: 11px; text-transform: uppercase; color: #666; }
        .right { text-align: right; }
        .totals { margin-top: 8px; width: 260px; margin-left: auto; }
        .totals div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
        .totals .grand { font-weight: bold; font-size: 15px; border-top: 2px solid #111; padding-top: 6px; margin-top: 4px; }
        .badge { display: inline-block; background: #eee; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Packing Slip</h1>
          <p class="muted">Order #${id.slice(0, 8)} · ${new Date(createdAt).toLocaleString('en-GB')}</p>
        </div>
        ${isPickup ? '<span class="badge">Local Pickup</span>' : ''}
      </div>

      <div class="section">
        <h2>Customer</h2>
        <p>${escapeHtml(customerName)}<br>${escapeHtml(email)} · ${escapeHtml(phone)}<br>${escapeHtml(address)}</p>
      </div>

      ${customerNote ? `<div class="section"><h2>Note from customer</h2><p>${escapeHtml(customerNote)}</p></div>` : ''}

      <div class="section">
        <h2>Items</h2>
        <table>
          <thead><tr><th>Product</th><th>SKU</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          ${shippingZoneName ? `<div><span>Shipping (${escapeHtml(shippingZoneName)})</span><span>₾${shippingFee.toFixed(2)}</span></div>` : ''}
          ${discountAmount > 0 ? `<div><span>Discount${discountCode ? ` (${escapeHtml(discountCode)})` : ''}</span><span>−₾${discountAmount.toFixed(2)}</span></div>` : ''}
          <div class="grand"><span>Total</span><span>₾${total.toFixed(2)}</span></div>
        </div>
      </div>
    </body>
    </html>
  `)
  win.document.close()
  win.onload = () => win.print()
}
