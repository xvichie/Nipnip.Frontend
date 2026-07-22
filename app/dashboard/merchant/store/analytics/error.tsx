'use client'

import { useEffect } from 'react'

// Scopes any crash on this page to just this page — without it, an uncaught error here
// would bubble up and blank out the whole dashboard (sidebar included), since there's no
// boundary between this route and the framework's default.
export default function AnalyticsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4">
      <div className="alert alert-error text-sm rounded-2xl">
        Something went wrong loading analytics. This didn&apos;t affect the rest of your dashboard.
      </div>
      <button
        type="button"
        onClick={reset}
        className="btn btn-sm self-start bg-white/4 border-white/10 text-white/60 hover:text-white"
      >
        Try again
      </button>
    </div>
  )
}
