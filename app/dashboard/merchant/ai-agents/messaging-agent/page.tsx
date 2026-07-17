'use client'

import { useState } from 'react'
import { useFacebookStatus } from '@/lib/queries/facebook'
import { useAiAgentSettings, useConversations, useUpdateAiAgentSettings } from '@/lib/queries/aiAgent'
import { ConversationThread } from '@/components/dashboard/ai-agent/ConversationThread'
import { KnowledgeBaseManager } from '@/components/dashboard/ai-agent/KnowledgeBaseManager'

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

  // Adjust state during render instead of an effect — settings arrive async, so there's
  // no lazy-initializer moment to hook them into.
  const [prevSettings, setPrevSettings] = useState(settings)
  if (settings && settings !== prevSettings) {
    setPrevSettings(settings)
    setEnabledFacebook(settings.enabledFacebook)
    setEnabledInstagram(settings.enabledInstagram)
    setInstructions(settings.instructions ?? '')
  }

  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
        <h1 className="text-2xl font-black tracking-tight">Messaging Agent</h1>
        <p className="text-white/40 text-sm mt-1">
          An AI assistant that answers Facebook Messenger questions about your products, shipping, and returns —
          and drafts orders for you to confirm.
        </p>
      </div>

      {!fbConnected && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
          Connect your Facebook Page under Integrations before turning this on.
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-white">Facebook Messenger</p>
            <p className="text-white/40 text-xs mt-0.5">Replies to Messenger DMs automatically once turned on.</p>
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
              Instagram DMs
              <span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                Coming soon
              </span>
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              Saves your preference for when Instagram DM replies launch — no replies are sent yet.
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
            Additional Instructions
          </label>
          <textarea
            id="agent-instructions"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={3}
            placeholder="Anything else the agent should know — tone, promotions, things to avoid saying."
            className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
          />
        </div>

        {saveError && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            Failed to save settings.
          </div>
        )}
        {saved && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            Saved successfully
          </div>
        )}

        <button
          type="submit"
          disabled={saving || settingsLoading}
          className="btn self-start gap-2 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
        </button>
      </form>

      <KnowledgeBaseManager />

      <div>
        <h2 className="text-lg font-bold tracking-tight mb-3">Conversations</h2>

        {conversationsLoading ? (
          <div className="skeleton h-24 rounded-2xl" />
        ) : !conversations || conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 text-center text-white/30 text-sm">
            No conversations yet.
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
                      {conversation.customerDisplayName ?? `Customer ${conversation.externalUserId.slice(-6)}`}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">Last message {formatTime(conversation.lastMessageAt)}</p>
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
        )}
      </div>
    </div>
  )
}
