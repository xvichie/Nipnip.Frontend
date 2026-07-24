'use client'

import { useState } from 'react'
import { useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { SALE_CATEGORY } from '@/lib/store/sale-category'
import { CategoryManager } from '@/components/dashboard/store/CategoryManager'

function SaleCategoryToggle() {
  const { data: store } = useMyStore()
  const { mutate: updateStore, isPending } = useUpdateMyStore()

  const [showSaleCategory, setShowSaleCategory] = useState(false)
  const [showSaleCategoryIcon, setShowSaleCategoryIcon] = useState(true)

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setShowSaleCategory(parsed.showSaleCategory)
    setShowSaleCategoryIcon(parsed.showSaleCategoryIcon)
  }

  function handleToggle(checked: boolean) {
    if (!store) return
    setShowSaleCategory(checked)
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore({ themeConfig: JSON.stringify({ ...parsed, showSaleCategory: checked }) })
  }

  function handleIconToggle(checked: boolean) {
    if (!store) return
    setShowSaleCategoryIcon(checked)
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore({ themeConfig: JSON.stringify({ ...parsed, showSaleCategoryIcon: checked }) })
  }

  if (!store) return null

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{SALE_CATEGORY.name}</p>
          <p className="text-white/30 text-xs mt-0.5">
            ჩაშენებული კატეგორია, რომელიც აჩვენებს ყველა ფასდაკლებულ პროდუქტს — არ არის საჭირო პროდუქტების ხელით მიბმა.
          </p>
        </div>
        <input
          type="checkbox"
          checked={showSaleCategory}
          onChange={e => handleToggle(e.target.checked)}
          disabled={isPending}
          className={`toggle toggle-sm shrink-0 ${showSaleCategory ? 'toggle-success' : 'toggle-error'}`}
        />
      </div>

      {showSaleCategory && (
        <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
          <span className="text-sm text-white/70">{SALE_CATEGORY.iconEmoji} ხატულას ჩვენება მაღაზიაში</span>
          <input
            type="checkbox"
            checked={showSaleCategoryIcon}
            onChange={e => handleIconToggle(e.target.checked)}
            disabled={isPending}
            className={`toggle toggle-sm ${showSaleCategoryIcon ? 'toggle-success' : 'toggle-error'}`}
          />
        </label>
      )}
    </div>
  )
}

export default function MerchantStoreCategoriesPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <SaleCategoryToggle />
      <CategoryManager />
    </div>
  )
}
