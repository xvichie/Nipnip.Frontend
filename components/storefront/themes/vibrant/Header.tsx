'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { getNavCategories, getNavPages } from '@/lib/store/nav-menu'
import type { CategoryResponse, StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href={`/`} className="flex items-center gap-2.5 min-w-0">
          {tokens.logoUrl ? (
            <>
              <CImg src={tokens.logoUrl} cldWidth={240} alt={storeName} className="h-8 w-auto object-contain shrink-0" />
              {tokens.showStoreName && (
                <span className="font-black text-[#1a1a1a] text-lg tracking-tight truncate">{storeName}</span>
              )}
            </>
          ) : (
            <span className="font-black text-[#1a1a1a] text-lg tracking-tight truncate">{storeName}</span>
          )}
        </Link>

        {hasNav && (
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href={`/products`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap"
            >
              ყველა პროდუქტი
            </Link>

            {navCategories.length > 0 && (
              isDropdown ? (
                <div className="relative" onMouseEnter={openCategoryMenu} onMouseLeave={closeCategoryMenuDelayed}>
                  <button
                    type="button"
                    onClick={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setCategoriesOpen(v => !v) }}
                    className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap"
                  >
                    კატეგორიები
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}>
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {categoriesOpen && (
                    <div className="absolute top-full left-0 mt-2 min-w-[190px] rounded-2xl bg-white shadow-xl border border-[#f0e4da] p-2 flex flex-col gap-0.5 z-10">
                      {navCategories.map(category => (
                        <Link
                          key={category.id}
                          href={`/products/category/${category.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className={`rounded-xl py-2 text-sm font-medium text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap ${category.isChild ? 'pl-7 pr-3.5' : 'px-3.5'}`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                navCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap ${category.isChild ? 'pl-3' : ''}`}
                  >
                    {category.isChild && '– '}{category.name}
                  </Link>
                ))
              )
            )}

            {navPages.map(page => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap"
              >
                {page.title}
              </Link>
            ))}

            {tokens.showContactInNav && (
              <Link
                href={`/contact`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors whitespace-nowrap"
              >
                {tokens.contactLabel}
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isCheckout && (
            <Link
              href={`/cart`}
              className="relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: tokens.accentColor }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1h2.5l2 9h9L16 5H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="15.5" r="1" fill="currentColor"/>
                <circle cx="13" cy="15.5" r="1" fill="currentColor"/>
              </svg>
              <span className="hidden sm:inline">კალათა</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[10px] font-black flex items-center justify-center" style={{ color: tokens.accentColor }}>
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
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#fff2ec] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-xl flex flex-col p-5 overflow-y-auto rounded-l-3xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="დახურვა"
              className="self-end mb-3 w-8 h-8 flex items-center justify-center rounded-full text-[#1a1a1a]/60 hover:bg-[#fff2ec]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <Link
              href={`/products`}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#fff2ec]"
            >
              ყველა პროდუქტი
            </Link>
            {navCategories.map(category => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl py-2.5 text-sm font-medium text-[#1a1a1a]/70 hover:bg-[#fff2ec] ${category.isChild ? 'pl-6' : 'px-3'}`}
              >
                {category.name}
              </Link>
            ))}
            {navPages.map(page => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a]/70 hover:bg-[#fff2ec]"
              >
                {page.title}
              </Link>
            ))}
            {tokens.showContactInNav && (
              <Link
                href={`/contact`}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a]/70 hover:bg-[#fff2ec]"
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
