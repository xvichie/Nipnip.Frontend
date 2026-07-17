'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDisconnectFacebook, useFacebookConnectUrl, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramStatus } from '@/lib/queries/instagram'
import { FacebookPagePickerModal } from '@/components/dashboard/store/FacebookPagePickerModal'
import { BetaBadge } from '@/components/dashboard/store/BetaBadge'

export default function IntegrationsPage() {
  return (
    <Suspense>
      <IntegrationsPageContent />
    </Suspense>
  )
}

function IntegrationsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const fbStatus = searchParams.get('fb')
  const fbPending = searchParams.get('pending')
  const [fbBanner, setFbBanner] = useState<'connected' | 'choose' | 'error' | null>(() =>
    fbStatus === 'connected' || fbStatus === 'choose' || fbStatus === 'error' ? fbStatus : null
  )

  useEffect(() => {
    if (fbStatus !== 'connected' && fbStatus !== 'error') return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('fb')
    params.delete('pending')
    router.replace(params.size > 0 ? `?${params.toString()}` : '/dashboard/merchant/store/integrations', { scroll: false })
    // Only react to the URL params changing, not to searchParams/router identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbStatus])

  function closePicker() {
    setFbBanner(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('fb')
    params.delete('pending')
    router.replace(params.size > 0 ? `?${params.toString()}` : '/dashboard/merchant/store/integrations', { scroll: false })
  }

  const { data: fbStatusData, isLoading } = useFacebookStatus()
  const connected = fbStatusData?.connected ?? false
  const { mutate: getConnectUrl, isPending: connecting } = useFacebookConnectUrl()
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectFacebook()
  const [connectError, setConnectError] = useState<string | null>(null)

  const { data: igStatusData, isLoading: igLoading } = useInstagramStatus()
  const igConnected = igStatusData?.connected ?? false

  function handleConnect() {
    setConnectError(null)
    getConnectUrl(undefined, {
      onSuccess: data => { window.location.href = data.url },
      onError: () => setConnectError('Failed to start connecting your Facebook Page.'),
    })
  }

  function handleDisconnect() {
    if (!confirm('Disconnect your Facebook Page? You can reconnect it any time.')) return
    disconnect()
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Integrations</h1>
        <p className="text-white/40 text-sm mt-1">Connect other platforms to your store.</p>
      </div>

      {fbBanner === 'connected' && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          Facebook Page connected — you can now pick recent posts straight from &quot;Import&quot; when adding a product.
        </div>
      )}
      {fbBanner === 'error' && (
        <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          Failed to connect your Facebook Page. Please try again.
        </div>
      )}
      {fbBanner === 'choose' && fbPending && (
        <FacebookPagePickerModal pendingToken={fbPending} onClose={closePicker} />
      )}

      <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M9.5 1.75h-2A2.75 2.75 0 0 0 4.75 4.5v1.75H3v2.25h1.75V12.25h2.25V8.5H8.7l.3-2.25H7V4.5c0-.483.392-.875.875-.875h1.625V1.75Z"
              fill="#8fb8fa"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Facebook Page</p>
          {isLoading ? (
            <p className="text-white/30 text-xs mt-0.5">Checking connection...</p>
          ) : connected ? (
            <p className="text-emerald-400 text-xs mt-0.5">Connected — {fbStatusData?.pageName}</p>
          ) : (
            <p className="text-white/30 text-xs mt-0.5">Connect your Page to import products straight from your posts.</p>
          )}
        </div>

        {!isLoading && (
          connected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="btn btn-sm bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 shrink-0"
            >
              {disconnecting ? <span className="loading loading-spinner loading-xs" /> : 'Disconnect'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="btn btn-sm bg-[#1877F2]/15 border-[#1877F2]/30 text-[#8fb8fa] hover:bg-[#1877F2]/25 disabled:opacity-40 shrink-0"
            >
              {connecting ? <span className="loading loading-spinner loading-xs" /> : 'Connect'}
            </button>
          )
        )}
      </div>
      {connectError && <p className="text-error text-xs -mt-3">{connectError}</p>}

      <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#feda75]/20 via-[#d62976]/20 to-[#4f5bd5]/20 border border-[#d62976]/30 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="#e1306c" strokeWidth="1.4"/>
            <circle cx="8" cy="8" r="3.2" stroke="#e1306c" strokeWidth="1.4"/>
            <circle cx="11.8" cy="4.2" r="0.9" fill="#e1306c"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            Instagram
            <BetaBadge />
          </p>
          {igLoading ? (
            <p className="text-white/30 text-xs mt-0.5">Checking connection...</p>
          ) : igConnected ? (
            <p className="text-emerald-400 text-xs mt-0.5">Connected — @{igStatusData?.username}</p>
          ) : connected ? (
            <p className="text-white/30 text-xs mt-0.5">
              No Instagram Business account is linked to your Facebook Page yet.
            </p>
          ) : (
            <p className="text-white/30 text-xs mt-0.5">Connect a Facebook Page above with a linked Instagram Business account.</p>
          )}
        </div>
      </div>
    </div>
  )
}
