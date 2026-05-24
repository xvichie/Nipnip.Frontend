'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useLanguage } from '@/lib/i18n'

export function NavbarAuth() {
  const { isLoaded, isSignedIn } = useUser()
  const role = useCurrentRole()
  const { t } = useLanguage()

  if (!isLoaded) return <div className="w-35" />

  if (isSignedIn) {
    const dashboardHref =
      role === 'creator' ? '/dashboard/creator' :
      role === 'merchant' ? '/dashboard/merchant' :
      '/onboarding'

    return (
      <div className="flex items-center gap-3">
        <Link
          href={dashboardHref}
          className="px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors"
        >
          {t.nav.dashboard}
        </Link>
        <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
      </div>
    )
  }

  return (
    <nav className="flex items-center gap-2">
      <SignInButton>
        <button className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/6 transition-colors">
          {t.nav.signIn}
        </button>
      </SignInButton>
      <SignUpButton>
        <button className="px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors">
          {t.nav.signUp}
        </button>
      </SignUpButton>
    </nav>
  )
}
