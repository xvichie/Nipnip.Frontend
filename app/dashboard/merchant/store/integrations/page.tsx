'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDisconnectFacebook, useFacebookConnectUrl, useFacebookStatus } from '@/lib/queries/facebook'
import { useInstagramStatus } from '@/lib/queries/instagram'
import {
  useConnectQuickShipper,
  useDisconnectQuickShipper,
  useQuickShipperPickupLocation,
  useQuickShipperStatus,
  useSavePickupLocation,
} from '@/lib/queries/quickshipper'
import { useConnectFlitt, useDisconnectFlitt, useFlittStatus } from '@/lib/queries/flitt'
import { useDisconnectTikTok, useTikTokConnectUrl, useTikTokStatus } from '@/lib/queries/tiktok'
import { FacebookPagePickerModal } from '@/components/dashboard/store/FacebookPagePickerModal'
import { BetaBadge } from '@/components/dashboard/store/BetaBadge'
import { PickupLocationPicker } from '@/components/dashboard/store/PickupLocationPicker'

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

  const ttStatus = searchParams.get('tiktok')
  const [ttBanner, setTtBanner] = useState<'connected' | 'error' | null>(() =>
    ttStatus === 'connected' || ttStatus === 'error' ? ttStatus : null
  )

  useEffect(() => {
    if (ttStatus !== 'connected' && ttStatus !== 'error') return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tiktok')
    router.replace(params.size > 0 ? `?${params.toString()}` : '/dashboard/merchant/store/integrations', { scroll: false })
    // Only react to the URL param changing, not to searchParams/router identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttStatus])

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
      {ttBanner === 'connected' && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400 flex items-center justify-between gap-3">
          TikTok account connected — you can now export a product straight to TikTok.
          <button type="button" onClick={() => setTtBanner(null)} className="text-emerald-400/60 hover:text-emerald-400 shrink-0">✕</button>
        </div>
      )}
      {ttBanner === 'error' && (
        <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error flex items-center justify-between gap-3">
          Failed to connect your TikTok account. Please try again.
          <button type="button" onClick={() => setTtBanner(null)} className="text-error/60 hover:text-error shrink-0">✕</button>
        </div>
      )}

      <p className="text-xs font-bold text-white/40 uppercase tracking-widest -mb-2">Social Media</p>

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

      <TikTokCard />

      <p className="text-xs font-bold text-white/40 uppercase tracking-widest -mb-2 mt-2">Delivery Services</p>
      <QuickShipperCard />

      <p className="text-xs font-bold text-white/40 uppercase tracking-widest -mb-2 mt-2">Payment Providers</p>
      <FlittCard />
    </div>
  )
}

function TikTokCard() {
  const { data: status, isLoading } = useTikTokStatus()
  const { mutate: getConnectUrl, isPending: connecting } = useTikTokConnectUrl()
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectTikTok()
  const [connectError, setConnectError] = useState<string | null>(null)

  const connected = status?.connected ?? false

  function handleConnect() {
    setConnectError(null)
    getConnectUrl(undefined, {
      onSuccess: data => { window.location.href = data.url },
      onError: () => setConnectError('Failed to start connecting your TikTok account.'),
    })
  }

  function handleDisconnect() {
    if (!confirm('Disconnect TikTok? You can reconnect it any time.')) return
    disconnect()
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M16.5 3c.4 2.3 2 4 4.5 4.2v3.1c-1.6.1-3.1-.4-4.5-1.3v6.6c0 3.5-2.8 6.4-6.4 6.4S3.7 19.1 3.7 15.6c0-3.4 2.6-6.2 6-6.4v3.2c-1.6.2-2.8 1.5-2.8 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2V3h3.2Z"
            fill="#fff"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">TikTok</p>
        {isLoading ? (
          <p className="text-white/30 text-xs mt-0.5">Checking connection...</p>
        ) : connected ? (
          <p className="text-emerald-400 text-xs mt-0.5">Connected — {status?.displayName}</p>
        ) : (
          <p className="text-white/30 text-xs mt-0.5">Connect your TikTok account to export products as photo posts.</p>
        )}
        {connectError && <p className="text-error text-xs mt-1">{connectError}</p>}
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
            className="btn btn-sm bg-white/10 border-white/20 text-white hover:bg-white/15 disabled:opacity-40 shrink-0"
          >
            {connecting ? <span className="loading loading-spinner loading-xs" /> : 'Connect'}
          </button>
        )
      )}
    </div>
  )
}

function FlittCard() {
  const { data: status, isLoading } = useFlittStatus()
  const { mutate: connect, isPending: connecting, error: connectError } = useConnectFlitt()
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectFlitt()

  const [merchantId, setMerchantId] = useState('')
  const [secretKey, setSecretKey] = useState('')

  const connected = status?.isConnected ?? false

  function handleConnect() {
    if (!merchantId.trim() || !secretKey.trim()) return
    connect(
      { merchantId: merchantId.trim(), secretKey },
      { onSuccess: () => setSecretKey('') }
    )
  }

  function handleDisconnect() {
    if (!confirm('Disconnect Flitt? Card payments will stop working at checkout until you reconnect.')) return
    disconnect()
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#788FFF]/15 border border-[#788FFF]/30 flex items-center justify-center shrink-0 p-2">
          <svg width="100%" height="100%" viewBox="0 0 496 198" fill="none" aria-hidden>
            <path
              fill="#788FFF"
              d="m483.5,121.39c1.74-2.56,2.94-5.54,3.4-8.78l4.79-33.25c.19-1.13.3-2.29.3-3.48,0-11.56-9.36-20.92-20.92-20.92h-18.36l4.24-29.46c.87-6.01-.92-12.09-4.88-16.67-3.98-4.59-9.75-7.23-15.81-7.23h-36.53c-10.4,0-19.23,7.64-20.71,17.94l-5.25,36.49c-2.08-.69-4.3-1.06-6.62-1.06h-18.36l4.25-29.46c.86-6.01-.92-12.09-4.9-16.67-3.98-4.59-9.75-7.23-15.81-7.23h-36.53c-7.54,0-14.25,4.01-17.93,10.14-7.31-7.25-17.35-11.74-28.44-11.74-9.6,0-18.42,3.36-25.36,8.97-3.83-4.51-9.55-7.37-15.93-7.37h-116.08c-23.44,0-39.31,4.6-53.02,15.38-16.45,12.92-20.95,32.47-22.91,46.04L.21,173.51c-.86,6.01.92,12.09,4.9,16.67,3.98,4.6,9.75,7.23,15.81,7.23h36.53c10.4,0,19.23-7.64,20.71-17.94l5.3-36.81h49.67l-4.44,30.85c-.86,6.01.92,12.09,4.9,16.67,3.98,4.6,9.75,7.23,15.81,7.23h98.65c10.4,0,19.23-7.64,20.71-17.94l1.62-11.25c6.31,9.75,15.2,17.65,25.94,22.57,12.09,5.53,24.63,6.62,42.21,6.62h26.91c9.72,0,18.07-6.68,20.33-15.97,4.31,3.75,9.17,6.92,14.49,9.35,12.09,5.53,24.63,6.62,42.21,6.62h26.9c10.4,0,19.23-7.64,20.71-17.94l5.14-35.66c.19-1.13.3-2.29.3-3.49,0-8.36-4.91-15.59-12.02-18.93ZM142.02,58.68h-52.11c-5.05,0-9.17.37-12.27,2.72-2.57,1.96-4.35,5.14-5.12,10.59l-2.32,16h67.6l-4.87,33.74h-67.59l-7.88,54.75H20.92l15.92-110.48c2.1-14.56,6.37-25.69,15.12-32.58,9.21-7.23,20.03-10.9,40.09-10.9h55.17l-5.21,36.15Zm43.93,117.81h-36.53l22.19-153.96h36.52l-22.18,153.96Zm62.12,0h-36.52l14.49-100.6h36.53l-14.5,100.6Zm1.36-116.65c-10.76,0-19.46-8.71-19.46-19.46s8.69-19.47,19.46-19.47,19.44,8.72,19.44,19.47-8.71,19.46-19.44,19.46Zm116.03,116.65h-26.91c-17.4,0-25.85-1.22-33.49-4.72-14.2-6.51-22.91-20.65-23.98-35.78-.31-4.36.14-12.34,1.55-22.07l13.16-91.39h36.53l-7.69,53.36h42.51l-4.86,33.74h-42.51l-2.08,14.46c-.64,4.48-.25,8.36,1.8,11.27,2.58,3.63,6.86,4.96,15.16,4.96h36.01l-5.21,36.16Zm103.92,0h-26.9c-17.41,0-25.85-1.22-33.49-4.72-14.2-6.51-22.91-20.65-23.98-35.78-.31-4.36.14-12.34,1.54-22.07l13.17-91.39h36.53l-7.69,53.36h42.51l-4.86,33.74h-42.51l-2.09,14.46c-.64,4.48-.25,8.36,1.82,11.27,2.58,3.63,6.86,4.96,15.14,4.96h36.02l-5.22,36.16Z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Flitt</p>
          {isLoading ? (
            <p className="text-white/30 text-xs mt-0.5">Checking connection...</p>
          ) : connected ? (
            <p className="text-emerald-400 text-xs mt-0.5">Connected — Merchant ID {status?.merchantId}</p>
          ) : (
            <p className="text-white/30 text-xs mt-0.5">Connect your Flitt account to accept card payments at checkout.</p>
          )}
        </div>

        {!isLoading && connected && (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="btn btn-sm bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 shrink-0"
          >
            {disconnecting ? <span className="loading loading-spinner loading-xs" /> : 'Disconnect'}
          </button>
        )}
      </div>

      {!isLoading && !connected && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            type="text"
            value={merchantId}
            onChange={e => setMerchantId(e.target.value)}
            placeholder="Merchant ID"
            className="input input-sm bg-white/4 border-white/10 focus:border-[#788FFF]/60 flex-1"
          />
          <input
            type="password"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
            placeholder="Secret key"
            className="input input-sm bg-white/4 border-white/10 focus:border-[#788FFF]/60 flex-1"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting || !merchantId.trim() || !secretKey.trim()}
            className="btn btn-sm bg-[#788FFF]/15 border-[#788FFF]/30 text-[#788FFF] hover:bg-[#788FFF]/25 disabled:opacity-40 shrink-0"
          >
            {connecting ? <span className="loading loading-spinner loading-xs" /> : 'Connect'}
          </button>
        </div>
      )}
      {connectError && <p className="text-error text-xs">{connectError.message}</p>}
    </div>
  )
}

function QuickShipperCard() {
  const { data: status, isLoading } = useQuickShipperStatus()
  const { mutate: connect, isPending: connecting, error: connectError } = useConnectQuickShipper()
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectQuickShipper()
  const { data: pickup } = useQuickShipperPickupLocation()
  const { mutate: savePickup, isPending: savingPickup } = useSavePickupLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [editingPickup, setEditingPickup] = useState(false)
  const [pickupDraft, setPickupDraft] = useState<{ address: string; lat: number; lng: number } | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const connected = status?.isConnected ?? false

  function handleConnect() {
    if (!username.trim() || !password.trim()) return
    connect(
      { username: username.trim(), password },
      { onSuccess: () => setPassword('') }
    )
  }

  function handleDisconnect() {
    if (!confirm('Disconnect QuickShipper? You can reconnect it any time.')) return
    disconnect()
  }

  function openPickupEditor() {
    setPickupDraft(
      pickup?.latitude != null && pickup?.longitude != null
        ? { address: pickup.address ?? '', lat: pickup.latitude, lng: pickup.longitude }
        : null
    )
    setContactName(pickup?.contactName ?? '')
    setContactPhone(pickup?.phone ?? '')
    setEditingPickup(true)
  }

  function handleSavePickup() {
    if (!pickupDraft || !contactName.trim() || !contactPhone.trim()) return
    savePickup(
      {
        address: pickupDraft.address,
        latitude: pickupDraft.lat,
        longitude: pickupDraft.lng,
        contactName: contactName.trim(),
        phone: contactPhone.trim(),
      },
      { onSuccess: () => setEditingPickup(false) }
    )
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/10 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/quickshipper-logo.jpg" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">QuickShipper</p>
          {isLoading ? (
            <p className="text-white/30 text-xs mt-0.5">Checking connection...</p>
          ) : connected ? (
            <p className="text-emerald-400 text-xs mt-0.5">Connected — ready to ship orders</p>
          ) : (
            <p className="text-white/30 text-xs mt-0.5">Connect your QuickShipper account to ship orders with real couriers.</p>
          )}
        </div>

        {!isLoading && connected && (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="btn btn-sm bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 shrink-0"
          >
            {disconnecting ? <span className="loading loading-spinner loading-xs" /> : 'Disconnect'}
          </button>
        )}
      </div>

      {!isLoading && !connected && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="QuickShipper username"
            className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60 flex-1"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60 flex-1"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting || !username.trim() || !password.trim()}
            className="btn btn-sm bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 shrink-0"
          >
            {connecting ? <span className="loading loading-spinner loading-xs" /> : 'Connect'}
          </button>
        </div>
      )}
      {connectError && <p className="text-error text-xs">{connectError.message}</p>}

      {!isLoading && connected && (
        <div className="rounded-xl bg-white/2 border border-white/5 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Pickup location</p>

          {!editingPickup ? (
            pickup?.address ? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white/70 truncate">{pickup.address}</p>
                  <p className="text-white/30 text-xs mt-0.5">{pickup.contactName} · {pickup.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={openPickupEditor}
                  className="btn btn-xs bg-white/4 border-white/8 text-white/50 hover:text-white shrink-0"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-white/40 text-xs">Set a pickup location before you can ship any orders.</p>
                <button
                  type="button"
                  onClick={openPickupEditor}
                  className="btn btn-xs bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 shrink-0"
                >
                  Set location
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-3">
              <PickupLocationPicker
                initialPosition={pickupDraft ? { lat: pickupDraft.lat, lng: pickupDraft.lng } : null}
                onLocationChange={loc => setPickupDraft({ address: loc.address, lat: loc.lat, lng: loc.lng })}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Contact name"
                  className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60 flex-1"
                />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="Phone (e.g. 555123456)"
                  className="input input-sm bg-white/4 border-white/10 focus:border-fuchsia-500/60 flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePickup}
                  disabled={savingPickup || !pickupDraft || !contactName.trim() || !contactPhone.trim()}
                  className="btn btn-sm bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40"
                >
                  {savingPickup ? <span className="loading loading-spinner loading-xs" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPickup(false)}
                  className="btn btn-sm bg-white/4 border-white/8 text-white/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
