// Shared between DashboardSidebar (writer) and anything that needs to react to the
// sidebar's collapsed/expanded width changing (e.g. repositioning a floating button).
export const SIDEBAR_COLLAPSED_KEY = 'nipnip:sidebar-collapsed'
export const SIDEBAR_COLLAPSED_EVENT = 'nipnip:sidebar-collapsed-change'

export function isSidebarCollapsed(): boolean {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
}
