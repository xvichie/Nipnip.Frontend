'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { getNavCategories, getNavPages } from '@/lib/store/nav-menu'
import { StoreHoursBadge } from '@/components/storefront/shared/StoreHoursBadge'
import type { CategoryResponse, StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

function Divider() {
  return <span className="w-px h-3 bg-black/15" aria-hidden />
}

export function Header({
  slug,
  storeName,
  categories,
  pages,
  tokens,
}: {
  slug: string
  storeName: string
  categories: CategoryResponse[]
  pages: StorePageResponse[]
  tokens: Required<ThemeConfig>
}) {
  const { count } = useStorefrontCart()
  const pathname = usePathname()
  const isCheckout = pathname?.includes('/checkout')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  function openCategoryMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setCategoriesOpen(true)
  }

  function closeCategoryMenuDelayed() {
    closeTimer.current = setTimeout(() => setCategoriesOpen(false), 200)
  }

  const navCategories = getNavCategories(categories, tokens)
  const navPages = getNavPages(pages, tokens)
  const isDropdown = tokens.categoryMenuMode === 'dropdown'
  const hasNav = navCategories.length > 0 || navPages.length > 0 || tokens.showContactInNav

  return (
    <header
      className={`${tokens.headerSticky ? 'sticky top-0' : ''} z-50 bg-white border-b border-black/10`}
      style={{ backgroundColor: tokens.headerBackgroundColor || undefined }}
    >
      {/* thin utility row */}
      <div className="hidden sm:block border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-end gap-4">
          {tokens.storeHoursEnabled && <StoreHoursBadge tokens={tokens} />}
          <span className="text-[10px] uppercase tracking-widest text-[#767676]">{storeName}</span>
        </div>
      </div>

      {/* nameplate row — grid, not absolute positioning, so the icon cluster always
          reserves its own column and can never overlap a long centered store name */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div aria-hidden />

        <Link href={`/`} className="flex items-center justify-center gap-3 min-w-0">
          {tokens.logoUrl ? (
            <>
              <CImg src={tokens.logoUrl} cldWidth={240} alt={storeName} className="h-9 w-auto object-contain shrink-0" />
              {tokens.showStoreName && (
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] truncate">{storeName}</span>
              )}
            </>
          ) : (
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] truncate">{storeName}</span>
          )}
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {!isCheckout && (
            <Link
              href={`/cart`}
              className="relative flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest font-medium text-[#111111] hover:opacity-60 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1h2.5l2 9h9L16 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="15.5" r="1" fill="currentColor"/>
                <circle cx="13" cy="15.5" r="1" fill="currentColor"/>
              </svg>
              <span className="hidden sm:inline">კალათა</span>
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: tokens.accentColor }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
          )}

          {hasNav && (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="მენიუ"
              className="md:hidden flex items-center justify-center w-9 h-9 text-[#111111] hover:opacity-60 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* nav row */}
      {hasNav && (
        <nav className="hidden md:flex items-center justify-center gap-4 border-t border-black/10 h-11">
          <Link
            href={`/products`}
            className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap"
          >
            ყველა პროდუქტი
          </Link>

          {navCategories.length > 0 && (
            <>
              <Divider />
              {isDropdown ? (
                <div
                  className="relative"
                  onMouseEnter={openCategoryMenu}
                  onMouseLeave={closeCategoryMenuDelayed}
                >
                  <button
                    type="button"
                    onClick={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setCategoriesOpen(v => !v) }}
                    className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    კატეგორიები
                  </button>
                  {categoriesOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[180px] bg-white py-2 flex flex-col items-center z-10">
                      {navCategories.map(category => (
                        <Link
                          key={category.id}
                          href={`/products/category/${category.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className={`py-1.5 text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap ${category.isChild ? 'pl-8 pr-4' : 'px-4'}`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                navCategories.map((category, i) => (
                  <span key={category.id} className="flex items-center gap-4">
                    {i > 0 && !category.isChild && <Divider />}
                    <Link
                      href={`/products/category/${category.slug}`}
                      className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap"
                    >
                      {category.isChild && '– '}{category.name}
                    </Link>
                  </span>
                ))
              )}
            </>
          )}

          {navPages.map(page => (
            <span key={page.id} className="flex items-center gap-4">
              <Divider />
              <Link
                href={`/pages/${page.slug}`}
                className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap"
              >
                {page.title}
              </Link>
            </span>
          ))}

          {tokens.showContactInNav && (
            <span className="flex items-center gap-4">
              <Divider />
              <Link
                href={`/contact`}
                className="text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 whitespace-nowrap"
              >
                {tokens.contactLabel}
              </Link>
            </span>
          )}
        </nav>
      )}

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-white flex flex-col p-5 overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="დახურვა"
              className="self-end mb-3 w-8 h-8 flex items-center justify-center text-[#111111]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <Link
              href={`/products`}
              onClick={() => setMobileOpen(false)}
              className="text-xs uppercase tracking-widest font-medium text-[#111111] py-2.5 border-b border-black/10"
            >
              ყველა პროდუქტი
            </Link>
            {navCategories.map(category => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`text-xs uppercase tracking-widest text-[#767676] py-2.5 border-b border-black/10 ${category.isChild ? 'pl-4' : ''}`}
              >
                {category.name}
              </Link>
            ))}
            {navPages.map(page => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-widest text-[#767676] py-2.5 border-b border-black/10"
              >
                {page.title}
              </Link>
            ))}
            {tokens.showContactInNav && (
              <Link
                href={`/contact`}
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-widest text-[#767676] py-2.5 border-b border-black/10"
              >
                {tokens.contactLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
