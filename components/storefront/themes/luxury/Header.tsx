'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { getNavCategories, getNavPages } from '@/lib/store/nav-menu'
import { StoreHoursBadge } from '@/components/storefront/shared/StoreHoursBadge'
import { StorefrontLanguageSwitcher } from '@/components/storefront/shared/StorefrontLanguageSwitcher'
import { HeaderSearchBox } from '@/components/storefront/shared/HeaderSearchBox'
import type { CategoryResponse, StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import { getCategoryName, getPageTitle, getThemeText } from '@/lib/store/translations'
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
  const { t, lang } = useStorefrontLanguage()
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
  const showHeaderSearch = tokens.searchBarLocation === 'header' || tokens.searchBarLocation === 'both'

  return (
    <header
      className={`${tokens.headerSticky ? 'sticky top-0' : ''} z-50 bg-[#faf7f2] border-b border-[#1c1a17]/10`}
      style={{ backgroundColor: tokens.headerBackgroundColor || undefined }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        <Link href={`/`} className="flex items-center gap-3 min-w-0">
          {tokens.logoUrl ? (
            <>
              <CImg src={tokens.logoUrl} cldWidth={240} alt={storeName} className="h-9 w-auto object-contain shrink-0" />
              {tokens.showStoreName && (
                <span className="font-serif text-[#1c1a17] text-lg tracking-[0.15em] uppercase truncate">{storeName}</span>
              )}
            </>
          ) : (
            <span className="font-serif text-[#1c1a17] text-xl tracking-[0.15em] uppercase truncate">{storeName}</span>
          )}
        </Link>

        {tokens.storeHoursEnabled && <StoreHoursBadge tokens={tokens} t={t} />}

        {hasNav && (
          <nav className="hidden md:flex items-center gap-7">
            <Link href={`/products`} className="text-xs uppercase tracking-widest text-[#1c1a17]/50 hover:text-[#1c1a17] transition-colors whitespace-nowrap">
              {t.header.allProducts}
            </Link>

            {navCategories.length > 0 && (
              isDropdown ? (
                <div className="relative" onMouseEnter={openCategoryMenu} onMouseLeave={closeCategoryMenuDelayed}>
                  <button
                    type="button"
                    onClick={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setCategoriesOpen(v => !v) }}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#1c1a17]/50 hover:text-[#1c1a17] transition-colors whitespace-nowrap"
                  >
                    {t.header.categories}
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}>
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {categoriesOpen && (
                    <div className="absolute top-full left-0 mt-3 min-w-[200px] bg-[#faf7f2] shadow-lg border border-[#1c1a17]/10 py-2 flex flex-col z-10">
                      {navCategories.map(category => (
                        <Link
                          key={category.id}
                          href={`/products/category/${category.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className={`py-2 text-xs uppercase tracking-widest text-[#1c1a17]/60 hover:text-[#1c1a17] hover:bg-[#1c1a17]/[0.03] transition-colors whitespace-nowrap ${category.isChild ? 'pl-9 pr-5' : 'px-5'}`}
                        >
                          {getCategoryName(category, lang)}
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
                    className={`text-xs uppercase tracking-widest text-[#1c1a17]/50 hover:text-[#1c1a17] transition-colors whitespace-nowrap ${category.isChild ? 'pl-3' : ''}`}
                  >
                    {category.isChild && '– '}{getCategoryName(category, lang)}
                  </Link>
                ))
              )
            )}

            {navPages.map(page => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                className="text-xs uppercase tracking-widest text-[#1c1a17]/50 hover:text-[#1c1a17] transition-colors whitespace-nowrap"
              >
                {getPageTitle(page, lang)}
              </Link>
            ))}

            {tokens.showContactInNav && (
              <Link
                href={`/contact`}
                className="text-xs uppercase tracking-widest text-[#1c1a17]/50 hover:text-[#1c1a17] transition-colors whitespace-nowrap"
              >
                {getThemeText(tokens, 'contactLabel', lang)}
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {showHeaderSearch && <HeaderSearchBox />}
          <StorefrontLanguageSwitcher />

          {!isCheckout && (
            <Link
              href={`/cart`}
              className="relative flex items-center gap-2 border border-[#1c1a17]/20 hover:border-[#1c1a17] px-4 py-2 text-xs uppercase tracking-widest text-[#1c1a17] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1h2.5l2 9h9L16 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="15.5" r="1" fill="currentColor"/>
                <circle cx="13" cy="15.5" r="1" fill="currentColor"/>
              </svg>
              <span className="hidden sm:inline">{t.header.cart}</span>
              {count > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
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
              aria-label={t.header.menuAriaLabel}
              className="md:hidden flex items-center justify-center w-9 h-9 text-[#1c1a17]/60 hover:text-[#1c1a17] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-[#faf7f2] shadow-xl flex flex-col p-6 overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label={t.header.closeAriaLabel}
              className="self-end mb-4 w-8 h-8 flex items-center justify-center text-[#1c1a17]/60 hover:text-[#1c1a17]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <Link
              href={`/products`}
              onClick={() => setMobileOpen(false)}
              className="text-xs uppercase tracking-widest text-[#1c1a17] py-3 border-b border-[#1c1a17]/10"
            >
              {t.header.allProducts}
            </Link>
            {navCategories.map(category => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`text-xs uppercase tracking-widest text-[#1c1a17]/60 py-3 border-b border-[#1c1a17]/10 ${category.isChild ? 'pl-4' : ''}`}
              >
                {getCategoryName(category, lang)}
              </Link>
            ))}
            {navPages.map(page => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-widest text-[#1c1a17]/60 py-3 border-b border-[#1c1a17]/10"
              >
                {getPageTitle(page, lang)}
              </Link>
            ))}
            {tokens.showContactInNav && (
              <Link
                href={`/contact`}
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-widest text-[#1c1a17]/60 py-3 border-b border-[#1c1a17]/10"
              >
                {getThemeText(tokens, 'contactLabel', lang)}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
