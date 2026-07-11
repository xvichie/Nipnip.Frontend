'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CartProvider, useCart } from '@/lib/store/cart-context'

function StoreHeader() {
  const { count } = useCart()
  const pathname = usePathname()
  const isCheckout = pathname?.includes('/checkout')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/example-store" className="flex items-center gap-3 shrink-0">
          {/* Shoe silhouette logo */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-[#111] text-base tracking-tight uppercase">NipNip</span>
            <span className="text-[#999] font-medium text-sm uppercase tracking-tight">Shoes</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: '/example-store', label: 'მთავარი' },
            { href: '/example-store/products', label: 'ყველა' },
            { href: '/example-store/products?category=running', label: 'სირბილი' },
            { href: '/example-store/products?category=sneakers', label: 'სნიკერები' },
            { href: '/example-store/products?category=boots', label: 'ჩექმები' },
            { href: '/example-store/products?category=casual', label: 'ყოველდღიური' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-[#555] hover:text-[#111] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {!isCheckout && (
            <Link
              href="/example-store/cart"
              className="relative flex items-center gap-2 text-sm text-[#555] hover:text-[#111] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1h2.5l2 9h9L16 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="15.5" r="1" fill="currentColor"/>
                <circle cx="13" cy="15.5" r="1" fill="currentColor"/>
              </svg>
              <span>კალათა</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#111] text-white text-[9px] font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function StoreFooter() {
  return (
    <footer className="bg-[#111] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-black text-white uppercase tracking-wide text-sm mb-4">NipNip Shoes</p>
            <p className="text-[#999] text-sm leading-relaxed max-w-xs">
              პრემიუმ ფეხსაცმელი ყოველი ნაბიჯისთვის. კომფორტისთვის შექმნილი, სიმტკიცით გამოდგილი.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#777] mb-4">მაღაზია</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'სირბილი',           href: '/example-store/products?category=running' },
                { label: 'სნიკერები',         href: '/example-store/products?category=sneakers' },
                { label: 'ჩექმები',           href: '/example-store/products?category=boots' },
                { label: 'ყოველდღიური',      href: '/example-store/products?category=casual' },
                { label: 'ყველა ფეხსაცმელი', href: '/example-store/products' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[#aaa] hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#777] mb-4">ინფორმაცია</p>
            <ul className="flex flex-col gap-2.5">
              {['ზომების ცხრილი', 'დაბრუნება და გაცვლა', 'მიტანა', 'კონფიდენციალობა'].map(item => (
                <li key={item}>
                  <span className="text-[#aaa] text-sm cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#777] mb-4">კონტაქტი</p>
            <ul className="flex flex-col gap-3">
              <li>
                <span className="text-[#aaa] text-sm block leading-relaxed">
                  თბილისი, ბარათაშვილის ქ. 2
                </span>
              </li>
              <li>
                <a href="tel:+995322000000" className="text-[#aaa] hover:text-white text-sm transition-colors">
                  +995 32 2 000 000
                </a>
              </li>
              <li>
                <a href="mailto:info@nipnipshoes.ge" className="text-[#aaa] hover:text-white text-sm transition-colors">
                  info@nipnipshoes.ge
                </a>
              </li>
              <li>
                <span className="text-[#aaa] text-sm">ორშ–პარ, 10:00–19:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#555] text-xs">© 2026 NipNip Shoes. ყველა უფლება დაცულია.</p>
          <Link href="/" className="text-[#555] hover:text-[#999] text-xs transition-colors">
            ← NipNip პლატფორმა
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="bg-white text-[#111] min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
      </div>
    </CartProvider>
  )
}
