'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useLanguage } from '@/lib/i18n'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

export function NavbarAuth({ fullWidth = false }: { fullWidth?: boolean }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const role = useCurrentRole()
  const { t } = useLanguage()

  if (!isLoaded) return <div className="w-35" />

  if (isSignedIn) {
    const dashboardHref =
      role === 'creator' ? '/dashboard/creator' :
      role === 'merchant' ? '/dashboard/merchant/store' :
      '/onboarding'

    const isAdmin =
      !!user.primaryEmailAddress?.emailAddress &&
      ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

    return (
      <div className={fullWidth ? 'flex items-center gap-3 w-full' : 'flex items-center gap-3'}>
        {isAdmin && (
          <Link
            href="/admin"
            className={[
              'px-4 py-1.5 text-sm font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-300 rounded-lg hover:bg-amber-500/25 transition-colors',
              fullWidth ? 'flex-1 text-center' : '',
            ].join(' ')}
          >
            {t.nav.admin}
          </Link>
        )}
        <Link
          href={dashboardHref}
          className={[
            'px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors',
            fullWidth ? 'flex-1 text-center' : '',
          ].join(' ')}
        >
          {t.nav.dashboard}
        </Link>
        <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
      </div>
    )
  }

  return (
    <nav className={fullWidth ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-2'}>
      <SignInButton>
        <button className={[
          'px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/6 transition-colors',
          fullWidth ? 'w-full py-2.5 border border-white/10' : '',
        ].join(' ')}>
          {t.nav.signIn}
        </button>
      </SignInButton>
      <SignUpButton>
        <button className={[
          'px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors',
          fullWidth ? 'w-full py-2.5' : '',
        ].join(' ')}>
          {t.nav.signUp}
        </button>
      </SignUpButton>
    </nav>
  )
}
