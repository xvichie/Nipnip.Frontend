// Shared between DashboardSidebar/AdminSidebar (writers) and anything that needs to react to
// the sidebar's collapsed/expanded width changing (e.g. repositioning a floating button). Both
// sidebars intentionally share one key — collapsing either one is a general "I want a narrower
// sidebar" preference, not scoped to just the dashboard or just the admin panel.
export const SIDEBAR_COLLAPSED_KEY = 'nipnip:sidebar-collapsed'
export const SIDEBAR_COLLAPSED_EVENT = 'nipnip:sidebar-collapsed-change'

export function isSidebarCollapsed(): boolean {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
}

export function toggleSidebarCollapsed(current: boolean) {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, current ? '0' : '1')
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT))
}

// useSyncExternalStore instead of useState+useEffect — localStorage isn't available during SSR,
// and this avoids both a hydration mismatch and an extra post-mount render.
//
// The collapsed-to-icon-rail state is a desktop-only affordance for reclaiming width from the
// always-visible rail — it means nothing inside a mobile slide-out drawer, which already overlays
// the page and closes on outside click. Without this guard, collapsing the desktop rail would
// leave the mobile menu a useless icon-only strip with no labels. Below the `lg` breakpoint
// (matches Tailwind's `lg:`), force it false regardless of what's in localStorage, and re-check
// on resize so it updates live if the viewport crosses the breakpoint.
export const LG_BREAKPOINT_PX = 1024

export function subscribeToCollapsed(callback: () => void) {
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, callback)
  window.addEventListener('resize', callback)
  return () => {
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, callback)
    window.removeEventListener('resize', callback)
  }
}
export function getCollapsedSnapshot() {
  if (window.innerWidth < LG_BREAKPOINT_PX) return false
  return isSidebarCollapsed()
}
export function getCollapsedServerSnapshot() {
  return false
}
