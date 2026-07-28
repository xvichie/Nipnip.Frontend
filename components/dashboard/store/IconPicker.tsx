'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/uploadImage'
import { CATEGORY_ICON_GROUPS, getCategoryIcon } from '@/lib/store/category-icons'
import { CATEGORY_EMOJI_GROUPS } from '@/lib/store/category-emoji'
import { CImg } from '@/components/ui/CImg'

export interface IconValue {
  iconUrl: string | null
  iconKey: string | null
  iconEmoji: string | null
}

const EMPTY_ICON: IconValue = { iconUrl: null, iconKey: null, iconEmoji: null }

type Tab = 'library' | 'emoji' | 'upload'

export function IconPreview({
  iconUrl,
  iconKey,
  iconEmoji,
  className = 'w-9 h-9',
}: {
  iconUrl: string | null
  iconKey: string | null
  iconEmoji: string | null
  className?: string
}) {
  // getCategoryIcon looks up a stable reference from a static module-level map — not a fresh component per render.
  const Icon = getCategoryIcon(iconKey)

  if (iconUrl) {
    return <CImg src={iconUrl} alt="" className={`${className} rounded-lg object-cover shrink-0`} />
  }
  if (Icon) {
    return (
      <span className={`${className} rounded-lg bg-white/5 flex items-center justify-center text-white/70 shrink-0`}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon size={18} strokeWidth={1.75} />
      </span>
    )
  }
  if (iconEmoji) {
    return (
      <span className={`${className} rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0`}>
        {iconEmoji}
      </span>
    )
  }
  return (
    <span className={`${className} rounded-lg border border-dashed border-white/15 flex items-center justify-center text-white/20 shrink-0`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function IconPicker({
  value,
  onChange,
  previewClassName = 'w-9 h-9',
}: {
  value: IconValue
  onChange: (next: IconValue) => void
  previewClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('library')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)

  const hasIcon = !!(value.iconUrl || value.iconKey || value.iconEmoji)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange({ iconUrl: url, iconKey: null, iconEmoji: null })
      setOpen(false)
    } catch {
      // keep picker open on failure
    } finally {
      setUploading(false)
    }
  }

  function pickLibraryIcon(key: string) {
    onChange({ iconUrl: null, iconKey: key, iconEmoji: null })
    setOpen(false)
  }

  function pickEmoji(char: string) {
    onChange({ iconUrl: null, iconKey: null, iconEmoji: char })
    setOpen(false)
  }

  function clearIcon() {
    onChange({ ...EMPTY_ICON })
    setOpen(false)
  }

  const q = search.trim()
  const filteredIconGroups = q
    ? CATEGORY_ICON_GROUPS.map(g => ({ ...g, icons: g.icons.filter(i => i.label.includes(q)) })).filter(g => g.icons.length > 0)
    : CATEGORY_ICON_GROUPS
  const filteredEmojiGroups = q
    ? CATEGORY_EMOJI_GROUPS.map(g => ({ ...g, emoji: g.emoji.filter(e => e.label.includes(q)) })).filter(g => g.emoji.length > 0)
    : CATEGORY_EMOJI_GROUPS

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="აირჩიეთ აიქონი"
        title="აირჩიეთ აიქონი"
        className="shrink-0 self-stretch rounded-lg ring-1 ring-transparent hover:ring-fuchsia-500/50 transition-all cursor-pointer"
      >
        <IconPreview iconUrl={value.iconUrl} iconKey={value.iconKey} iconEmoji={value.iconEmoji} className={previewClassName} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md max-h-[80vh] rounded-2xl border border-white/10 bg-[#14141c] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="text-sm font-semibold text-white">კატეგორიის აიქონი</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="დახურვა"
                data-tip="დახურვა"
                className="tooltip tooltip-left w-7 h-7 flex items-center justify-center text-white/40 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-1 px-4 pt-3">
              {([
                { value: 'library', label: 'ბიბლიოთეკა' },
                { value: 'emoji', label: 'ემოჯი' },
                { value: 'upload', label: 'ატვირთვა' },
              ] as { value: Tab; label: string }[]).map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setTab(t.value); setSearch('') }}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    tab === t.value ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'text-white/40 hover:text-white',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
              {hasIcon && (
                <button
                  type="button"
                  onClick={clearIcon}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10"
                >
                  მოშორება
                </button>
              )}
            </div>

            {tab !== 'upload' && (
              <div className="px-4 pt-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {tab === 'upload' && (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <label className="btn btn-sm bg-white/4 border-white/10 text-white/70 hover:text-white cursor-pointer">
                    {uploading ? <span className="loading loading-spinner loading-xs" /> : 'სურათის ატვირთვა'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                  </label>
                  <p className="text-white/25 text-xs text-center max-w-xs">
                    ატვირთეთ საკუთარი აიქონის სურათი — მოწონებულია კვადრატული ფორმის სურათი, გამჭვირვალე ფონით.
                  </p>
                </div>
              )}

              {tab === 'library' && (
                <div className="flex flex-col gap-4">
                  {filteredIconGroups.length === 0 && <p className="text-white/30 text-xs text-center py-6">ვერაფერი მოიძებნა.</p>}
                  {filteredIconGroups.map(group => (
                    <div key={group.label} className="flex flex-col gap-2">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider">{group.label}</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {group.icons.map(({ key, label, Icon }) => (
                          <button
                            key={key}
                            type="button"
                            title={label}
                            onClick={() => pickLibraryIcon(key)}
                            className={[
                              'aspect-square rounded-lg flex items-center justify-center transition-colors',
                              value.iconKey === key ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-white/4 text-white/60 hover:bg-white/8 hover:text-white',
                            ].join(' ')}
                          >
                            <Icon size={16} strokeWidth={1.75} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'emoji' && (
                <div className="flex flex-col gap-4">
                  {filteredEmojiGroups.length === 0 && <p className="text-white/30 text-xs text-center py-6">ვერაფერი მოიძებნა.</p>}
                  {filteredEmojiGroups.map(group => (
                    <div key={group.label} className="flex flex-col gap-2">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider">{group.label}</p>
                      <div className="grid grid-cols-8 gap-1.5">
                        {group.emoji.map(({ char, label }) => (
                          <button
                            key={char}
                            type="button"
                            title={label}
                            onClick={() => pickEmoji(char)}
                            className={[
                              'aspect-square rounded-lg flex items-center justify-center text-lg transition-colors',
                              value.iconEmoji === char ? 'bg-fuchsia-500/20' : 'bg-white/4 hover:bg-white/8',
                            ].join(' ')}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
