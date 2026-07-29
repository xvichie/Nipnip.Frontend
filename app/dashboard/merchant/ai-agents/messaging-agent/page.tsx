'use client'

import { useState } from 'react'
import { useFacebookStatus } from '@/lib/queries/facebook'
import { useAiAgentSettings, useConversations, useUpdateAiAgentSettings } from '@/lib/queries/aiAgent'
import { ConversationThread } from '@/components/dashboard/ai-agent/ConversationThread'
import { KnowledgeBaseManager } from '@/components/dashboard/ai-agent/KnowledgeBaseManager'
import { SlidersIcon } from '@/components/ui/icons'

const KNOWLEDGE_ICON = (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2 2.8c1.3-.6 2.8-.6 4 0v8.4c-1.2-.6-2.7-.6-4 0V2.8ZM10 2.8c-1.3-.6-2.8-.6-4 0v8.4c1.2-.6 2.7-.6 4 0V2.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M6 2.8V2M6 4.8V4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
)
const CHAT_ICON = (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M1.5 3.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2H6.5l-3 2.3v-2.3h-.5a2 2 0 0 1-2-2v-4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
)

type TabKey = 'settings' | 'knowledge' | 'conversations'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagingAgentPage() {
  const { data: fbStatus } = useFacebookStatus()
  const fbConnected = fbStatus?.connected ?? false

  const { data: settings, isLoading: settingsLoading } = useAiAgentSettings()
  const { mutate: updateSettings, isPending: saving, error: saveError } = useUpdateAiAgentSettings()

  const [enabledFacebook, setEnabledFacebook] = useState(false)
  const [enabledInstagram, setEnabledInstagram] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [saved, setSaved] = useState(false)

  // Adjust state during render instead of an effect — settings arrive async, so there's no
  // lazy-initializer moment to hook them into. Tracked via a plain "have we hydrated this
  // mount" flag rather than comparing against the previous value by reference — the settings
  // query is cached across navigations, so on a revisit `settings` can already be populated
  // on the very first render, making it identical to itself and never triggering a
  // reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (settings && !hydrated) {
    setHydrated(true)
    setEnabledFacebook(settings.enabledFacebook)
    setEnabledInstagram(settings.enabledInstagram)
    setInstructions(settings.instructions ?? '')
  }

  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('settings')

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'settings', label: 'პარამეტრები', icon: <SlidersIcon /> },
    { key: 'knowledge', label: 'ცოდნის ბაზა', icon: KNOWLEDGE_ICON },
    { key: 'conversations', label: 'მიმოწერები', icon: CHAT_ICON, count: conversations?.length },
  ]

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateSettings(
      { enabledFacebook, enabledInstagram, instructions },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">შეტყობინებების აგენტი</h1>
        <p className="text-white/40 text-sm mt-1">
          AI ასისტენტი, რომელიც პასუხობს კითხვებს თქვენი პროდუქტების, მიწოდებისა და დაბრუნების შესახებ
          Messenger-ში — და ქმნის შეკვეთებს დასადასტურებლად.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-white/7 bg-white/2 p-1 w-fit">
        {TABS.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={[
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              tab === item.key ? 'bg-fuchsia-500/15 text-white' : 'text-white/40 hover:text-white',
            ].join(' ')}
          >
            {item.icon}
            {item.label}
            {!!item.count && (
              <span className="text-[10px] font-bold rounded-full bg-white/10 text-white/60 px-1.5 py-0.5 tabular-nums">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <>
          {!fbConnected && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              ჩართვამდე დააკავშირეთ თქვენი Facebook გვერდი ინტეგრაციების გვერდიდან.
            </div>
          )}

          <form onSubmit={handleSave} className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Facebook Messenger</p>
                <p className="text-white/40 text-xs mt-0.5">ავტომატურად პასუხობს Messenger-ის პირად შეტყობინებებს ჩართვის შემდეგ.</p>
              </div>
              <input
                type="checkbox"
                checked={enabledFacebook}
                disabled={!fbConnected && !enabledFacebook}
                onChange={e => setEnabledFacebook(e.target.checked)}
                className={`toggle ${enabledFacebook ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  Instagram პირადი შეტყობინებები
                  <span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                    მალე
                  </span>
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  ინახავს თქვენს არჩევანს Instagram-ის პასუხების გაშვებამდე — პასუხები ჯერ არ იგზავნება.
                </p>
              </div>
              <input
                type="checkbox"
                checked={enabledInstagram}
                onChange={e => setEnabledInstagram(e.target.checked)}
                className={`toggle ${enabledInstagram ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            <div className="fieldset gap-2">
              <label htmlFor="agent-instructions" className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">
                დამატებითი ინსტრუქციები
              </label>
              <textarea
                id="agent-instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={3}
                placeholder="რაც არ უნდა იცოდეს აგენტმა დამატებით — ტონი, აქციები, რისი თქმაც არ ღირს."
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
            </div>

            {saveError && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                პარამეტრების შენახვა ვერ მოხერხდა.
              </div>
            )}
            {saved && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                წარმატებით შეინახა
              </div>
            )}

            <button
              type="submit"
              disabled={saving || settingsLoading}
              className="btn self-start gap-2 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'ცვლილებების შენახვა'}
            </button>
          </form>
        </>
      )}

      {tab === 'knowledge' && <KnowledgeBaseManager />}

      {tab === 'conversations' && (
        conversationsLoading ? (
          <div className="skeleton h-24 rounded-2xl" />
        ) : !conversations || conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 text-center text-white/30 text-sm">
            მიმოწერები ჯერ არ არის.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map(conversation => (
              <div key={conversation.id} className="rounded-2xl border border-white/7 bg-white/2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedId(selectedId === conversation.id ? null : conversation.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {conversation.customerDisplayName ?? `მომხმარებელი ${conversation.externalUserId.slice(-6)}`}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">ბოლო შეტყობინება — {formatTime(conversation.lastMessageAt)}</p>
                  </div>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
                    className={`shrink-0 opacity-40 transition-transform ${selectedId === conversation.id ? 'rotate-180' : ''}`}
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {selectedId === conversation.id && (
                  <div className="border-t border-white/7">
                    <ConversationThread conversationId={conversation.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
