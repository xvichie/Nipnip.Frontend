import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-[#08080d] text-white selection:bg-violet-500/30">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] bg-[#08080d]/90 backdrop-blur-sm shrink-0">
          <label
            htmlFor="sidebar-drawer"
            className="btn btn-ghost btn-sm btn-square text-white/60 hover:text-white"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </label>
          <Link href="/" className="text-base font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400 select-none hover:opacity-80 transition-opacity">
            NipNip
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-5xl">
          {children}
        </main>

      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" aria-label="Close menu" />
        <DashboardSidebar />
      </div>
    </div>
  )
}
