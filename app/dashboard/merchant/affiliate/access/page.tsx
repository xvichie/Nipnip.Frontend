'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import {
  useMerchantMe,
  useUpdateMerchant,
  useAccessRequests,
  useAddApprovedCreator,
  useApproveAccessRequest,
  useRejectAccessRequest,
} from '@/lib/queries/merchants'
import { useCreators } from '@/lib/queries/creators'
import type { MerchantAccessRequestResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

export default function CreatorAccessPage() {
  const { t } = useLanguage()
  const { data: merchant, isLoading: merchantLoading, isError: merchantError } = useMerchantMe()
  const updateMerchant = useUpdateMerchant(merchant?.id ?? '')
  const { data: requests, isLoading, isError } = useAccessRequests()
  const { data: creatorsData } = useCreators(1, 100)

  const [selectedCreatorId, setSelectedCreatorId] = useState('')
  const [addError, setAddError] = useState('')

  const addApproved = useAddApprovedCreator()
  const approveRequest = useApproveAccessRequest()
  const rejectRequest = useRejectAccessRequest()

  const requestedCreatorIds = new Set((requests ?? []).map(r => r.creatorId))
  const availableCreators = (creatorsData?.items ?? []).filter(c => !requestedCreatorIds.has(c.id))

  const pending = (requests ?? []).filter(r => r.status === 'Pending')
  const approved = (requests ?? []).filter(r => r.status === 'Approved')
  const rejected = (requests ?? []).filter(r => r.status === 'Rejected')

  function togglePublic() {
    if (!merchant) return
    updateMerchant.mutate({ isPublic: !merchant.isPublic })
  }

  async function handleAdd() {
    if (!selectedCreatorId) return
    setAddError('')
    try {
      await addApproved.mutateAsync({ creatorId: selectedCreatorId })
      setSelectedCreatorId('')
    } catch {
      setAddError(t.creatorAccess.addError)
    }
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.creatorAccess.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.creatorAccess.subtitle}</p>
      </div>

      {merchantLoading ? (
        <div className="skeleton h-20 rounded-2xl" />
      ) : merchantError || !merchant ? (
        <div className="alert alert-error rounded-2xl text-sm">{t.creatorAccess.loadError}</div>
      ) : (
        <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-sm">
              {merchant.isPublic ? t.creatorAccess.publicLabel : t.creatorAccess.privateLabel}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {merchant.isPublic ? t.creatorAccess.publicHint : t.creatorAccess.privateHint}
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle [--tglbg:theme(colors.white/10%)] border-white/15 checked:border-violet-500 checked:bg-violet-500 checked:[--tglbg:theme(colors.violet.900)]"
            checked={merchant.isPublic}
            disabled={updateMerchant.isPending}
            onChange={togglePublic}
          />
        </div>
      )}

      {merchant && !merchant.isPublic && (
        <>
          <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col gap-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">{t.creatorAccess.addCreator}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCreatorId}
                onChange={e => setSelectedCreatorId(e.target.value)}
                className="select flex-1 bg-neutral-900 border-white/8 focus:border-violet-500/60"
              >
                <option value="">{t.creatorAccess.selectCreator}</option>
                {availableCreators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (@{c.slug})</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!selectedCreatorId || addApproved.isPending}
                className="btn bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 shrink-0"
              >
                {t.creatorAccess.addButton}
              </button>
            </div>
            {addError && <p className="text-error text-xs">{addError}</p>}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
            </div>
          ) : isError ? (
            <div className="alert alert-error rounded-2xl text-sm">{t.creatorAccess.loadError}</div>
          ) : !requests || requests.length === 0 ? (
            <div className="rounded-2xl border border-white/7 bg-white/2 py-16 text-center">
              <p className="text-white/20 text-sm">{t.creatorAccess.empty}</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <RequestSection
                  title={t.creatorAccess.pendingSection}
                  items={pending}
                  render={r => (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveRequest.mutate(r.id)}
                        className="btn btn-xs bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        {t.creatorAccess.approve}
                      </button>
                      <button
                        onClick={() => rejectRequest.mutate(r.id)}
                        className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        {t.creatorAccess.reject}
                      </button>
                    </div>
                  )}
                />
              )}

              {approved.length > 0 && (
                <RequestSection
                  title={t.creatorAccess.approvedSection}
                  items={approved}
                  render={r => (
                    <button
                      onClick={() => rejectRequest.mutate(r.id)}
                      className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 shrink-0"
                    >
                      {t.creatorAccess.remove}
                    </button>
                  )}
                />
              )}

              {rejected.length > 0 && (
                <RequestSection
                  title={t.creatorAccess.rejectedSection}
                  items={rejected}
                  render={r => (
                    <button
                      onClick={() => approveRequest.mutate(r.id)}
                      className="btn btn-xs bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shrink-0"
                    >
                      {t.creatorAccess.approve}
                    </button>
                  )}
                />
              )}
            </>
          )}
        </>
      )}

    </div>
  )
}

function RequestSection({
  title,
  items,
  render,
}: {
  title: string
  items: MerchantAccessRequestResponse[]
  render: (item: MerchantAccessRequestResponse) => React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">{title}</p>
      {items.map(r => (
        <div key={r.id} className="rounded-2xl border border-white/7 bg-white/2 p-4 flex items-center gap-3">
          <CreatorAvatar name={r.creatorName} avatarUrl={r.creatorAvatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-sm truncate">{r.creatorName}</p>
            <p className="text-white/30 text-xs truncate">@{r.creatorSlug}</p>
          </div>
          {render(r)}
        </div>
      ))}
    </div>
  )
}

function CreatorAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    return (
      <CImg
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-xl object-cover shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0 font-black text-violet-400 text-sm">
      {initials}
    </div>
  )
}
