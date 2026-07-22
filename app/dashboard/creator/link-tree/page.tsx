'use client'

import { useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { useCreatorMe } from '@/lib/queries/creators'
import { useMerchants } from '@/lib/queries/merchants'
import {
  useMyLinkTrees,
  useLinkTreeDetail,
  useCreateLinkTree,
  useDeleteLinkTree,
  useSetDefaultLinkTree,
  useAddLinkTreeItem,
  useUpdateLinkTreeItem,
  useDeleteLinkTreeItem,
  useReorderLinkTree,
} from '@/lib/queries/linktree'
import type { LinkTreeItemResponse } from '@/lib/types'
import { CImg } from '@/components/ui/CImg'

const UP_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M2.5 7.5L6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const DOWN_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PLUS_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export default function LinkTreePage() {
  const { t } = useLanguage()
  const { data: creator } = useCreatorMe()
  const { data: trees, isLoading: treesLoading, isError: treesError } = useMyLinkTrees()

  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null)
  const [newTreeName, setNewTreeName] = useState('')
  const [createError, setCreateError] = useState('')
  const modalRef = useRef<HTMLDialogElement>(null)

  const createTree = useCreateLinkTree()
  const deleteTree = useDeleteLinkTree()
  const setDefaultTree = useSetDefaultLinkTree()

  const activeTreeId = selectedTreeId ?? trees?.find(tr => tr.isDefault)?.id ?? trees?.[0]?.id ?? null

  function openNewTreeModal() {
    setNewTreeName('')
    setCreateError('')
    modalRef.current?.showModal()
  }

  async function handleCreateTree() {
    setCreateError('')
    try {
      const created = await createTree.mutateAsync({ name: newTreeName.trim() })
      setSelectedTreeId(created.id)
      modalRef.current?.close()
      setNewTreeName('')
    } catch {
      setCreateError(t.linkTree.createError)
    }
  }

  async function handleDeleteTree(id: string) {
    if (!confirm(t.linkTree.deleteTreeConfirm)) return
    await deleteTree.mutateAsync(id)
    if (selectedTreeId === id) setSelectedTreeId(null)
  }

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-2xl font-black tracking-tight">{t.linkTree.title}</h1>
        <p className="text-white/40 text-sm mt-1">{t.linkTree.subtitle}</p>
      </div>

      {treesError ? (
        <div className="alert alert-error rounded-2xl text-sm">{t.linkTree.loadError}</div>
      ) : treesLoading || !trees ? (
        <div className="skeleton h-10 w-64 rounded-xl" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {trees.map(tree => (
              <button
                key={tree.id}
                onClick={() => setSelectedTreeId(tree.id)}
                className={[
                  'btn btn-sm gap-2 rounded-xl normal-case',
                  activeTreeId === tree.id
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                    : 'bg-white/4 border-white/8 text-white/50 hover:text-white',
                ].join(' ')}
              >
                {tree.name}
                <span className="text-xs opacity-60">({tree.itemCount})</span>
                {tree.isDefault && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 uppercase tracking-wider">
                    {t.linkTree.defaultBadge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={openNewTreeModal}
              className="btn btn-sm gap-1 rounded-xl bg-white/4 border-white/8 text-white/50 hover:text-white normal-case"
            >
              {PLUS_ICON} {t.linkTree.newTree}
            </button>
          </div>

          <dialog ref={modalRef} className="modal">
            <div className="modal-box bg-[#0f0f18] border border-white/8 rounded-2xl max-w-md p-0 overflow-hidden">

              <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-center justify-between gap-4">
                <h3 className="font-bold text-white text-base">{t.linkTree.newTree}</h3>
                <form method="dialog">
                  <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </form>
              </div>

              <div className="px-6 py-5 flex flex-col gap-3">
                <input
                  type="text"
                  autoFocus
                  value={newTreeName}
                  onChange={e => setNewTreeName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newTreeName.trim()) handleCreateTree() }}
                  placeholder={t.linkTree.treeNamePlaceholder}
                  className="input w-full bg-white/4 border-white/8 focus:border-violet-500/60"
                />
                {createError && <p className="text-error text-xs">{createError}</p>}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={handleCreateTree}
                  disabled={!newTreeName.trim() || createTree.isPending}
                  className="btn w-full bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 rounded-xl normal-case"
                >
                  {createTree.isPending ? <span className="loading loading-spinner loading-sm" /> : t.linkTree.create}
                </button>
              </div>

            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          {activeTreeId && (
            <TreeManager
              key={activeTreeId}
              treeId={activeTreeId}
              creatorSlug={creator?.slug ?? ''}
              canDelete={(trees?.length ?? 0) > 1}
              onDelete={() => handleDeleteTree(activeTreeId)}
              onSetDefault={() => setDefaultTree.mutate(activeTreeId)}
            />
          )}
        </>
      )}

    </div>
  )
}

function TreeManager({
  treeId,
  creatorSlug,
  canDelete,
  onDelete,
  onSetDefault,
}: {
  treeId: string
  creatorSlug: string
  canDelete: boolean
  onDelete: () => void
  onSetDefault: () => void
}) {
  const { t } = useLanguage()
  const { data: tree, isLoading, isError } = useLinkTreeDetail(treeId)
  const { data: merchantsData } = useMerchants(1, 100)

  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [copied, setCopied] = useState(false)
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const addItem = useAddLinkTreeItem()
  const updateItem = useUpdateLinkTreeItem(treeId)
  const deleteItem = useDeleteLinkTreeItem(treeId)
  const reorder = useReorderLinkTree(treeId)

  const items = tree?.items ?? []
  const addedMerchantIds = new Set(items.map(i => i.merchantId))
  const availableMerchants = (merchantsData?.items ?? []).filter(m => !addedMerchantIds.has(m.id) && m.isApprovedForViewer)

  const bioUrl = typeof window === 'undefined' || !tree
    ? ''
    : tree.isDefault
      ? `${window.location.origin}/${creatorSlug}`
      : `${window.location.origin}/lt/${tree.slug}`

  async function copyBioLink() {
    if (!bioUrl) return
    await navigator.clipboard.writeText(bioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAdd() {
    if (!selectedMerchantId) return
    setAddError('')
    try {
      await addItem.mutateAsync({ treeId, body: { merchantId: selectedMerchantId, label: newLabel.trim() || null } })
      setSelectedMerchantId('')
      setNewLabel('')
    } catch {
      setAddError(t.linkTree.addError)
    }
  }

  function startEdit(item: LinkTreeItemResponse) {
    setEditingId(item.id)
    setEditLabel(item.label ?? '')
  }

  async function saveEdit(id: string) {
    await updateItem.mutateAsync({ id, body: { label: editLabel.trim() || null } })
    setEditingId(null)
  }

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    reorder.mutate({ orderedItemIds: reordered.map(i => i.id) })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    )
  }

  if (isError || !tree) {
    return <div className="alert alert-error rounded-2xl text-sm">{t.linkTree.loadError}</div>
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white/40 text-xs uppercase tracking-widest">{t.linkTree.yourLink}</p>
          <div className="flex items-center gap-2">
            {!tree.isDefault && (
              <button
                onClick={onSetDefault}
                className="btn btn-xs bg-white/4 border-white/8 text-white/50 hover:text-amber-300 rounded-lg"
              >
                {t.linkTree.setDefault}
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                {t.linkTree.deleteTree}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-stretch gap-2">
          <div className="flex-1 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5 min-w-0">
            <p className="text-white/70 text-sm font-mono break-all">{bioUrl}</p>
          </div>
          <button
            onClick={copyBioLink}
            className={[
              'btn btn-sm shrink-0 h-auto rounded-xl px-4 transition-all',
              copied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30',
            ].join(' ')}
          >
            {copied ? t.common.copied : t.common.copy}
          </button>
          <a
            href={bioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm shrink-0 h-auto rounded-xl px-4 bg-white/4 border-white/8 text-white/60 hover:text-white"
          >
            {t.linkTree.viewLive}
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-white/7 bg-white/2 p-5 flex flex-col gap-3">
        <p className="text-white/40 text-xs uppercase tracking-widest">{t.linkTree.addMerchant}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedMerchantId}
            onChange={e => setSelectedMerchantId(e.target.value)}
            className="select flex-1 bg-neutral-900 border-white/8 focus:border-violet-500/60"
          >
            <option value="">{t.linkTree.selectMerchant}</option>
            {availableMerchants.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder={t.linkTree.labelPlaceholder}
            className="input flex-1 bg-white/4 border-white/8 focus:border-violet-500/60"
          />
          <button
            onClick={handleAdd}
            disabled={!selectedMerchantId || addItem.isPending}
            className="btn bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 shrink-0"
          >
            {t.linkTree.addButton}
          </button>
        </div>
        {availableMerchants.length === 0 && items.length > 0 && (
          <p className="text-white/25 text-xs">{t.linkTree.allAdded}</p>
        )}
        {addError && <p className="text-error text-xs">{addError}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/7 bg-white/2 py-16 text-center">
            <p className="text-white/20 text-sm">{t.linkTree.empty}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-white/7 bg-white/2 p-4 flex items-center gap-3">
              <MerchantLogo name={item.merchantName} logoUrl={item.merchantLogoUrl} />

              <div className="min-w-0 flex-1">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id) }}
                      className="input input-sm flex-1 bg-white/4 border-white/8 focus:border-violet-500/60"
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="btn btn-xs bg-violet-500/20 border-violet-500/30 text-violet-300"
                    >
                      {t.common.save}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-xs bg-white/4 border-white/8 text-white/50"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(item)} className="text-left group/label" title={t.linkTree.editLabel}>
                    <p className="font-bold text-white text-sm truncate group-hover/label:underline">
                      {item.label || item.merchantName}
                    </p>
                    {item.label && <p className="text-white/30 text-xs truncate">{item.merchantName}</p>}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title={t.linkTree.moveUp}
                  className="btn btn-xs btn-square bg-white/4 border-white/8 text-white/50 hover:text-white disabled:opacity-20"
                >
                  {UP_ICON}
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  title={t.linkTree.moveDown}
                  className="btn btn-xs btn-square bg-white/4 border-white/8 text-white/50 hover:text-white disabled:opacity-20"
                >
                  {DOWN_ICON}
                </button>
                <button
                  onClick={() => deleteItem.mutate(item.id)}
                  className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                >
                  {t.linkTree.remove}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

function MerchantLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const initials = name.slice(0, 2).toUpperCase()

  if (logoUrl) {
    return (
      <CImg
        src={logoUrl}
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
