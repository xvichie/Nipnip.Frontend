'use client'

import { useConversationDetail } from '@/lib/queries/aiAgent'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ConversationThread({ conversationId }: { conversationId: string }) {
  const { data: conversation, isLoading } = useConversationDetail(conversationId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="skeleton h-12 w-2/3 rounded-2xl" />
        <div className="skeleton h-12 w-1/2 rounded-2xl self-end" />
        <div className="skeleton h-12 w-3/5 rounded-2xl" />
      </div>
    )
  }

  if (!conversation) return null

  return (
    <div className="flex flex-col gap-3 p-4 max-h-[28rem] overflow-y-auto">
      {conversation.messages.length === 0 && (
        <p className="text-white/30 text-sm text-center py-4">შეტყობინებები ჯერ არ არის.</p>
      )}
      {conversation.messages.map(message => (
        <div
          key={message.id}
          className={['flex flex-col max-w-[80%]', message.direction === 'Outbound' ? 'self-end items-end' : 'self-start items-start'].join(' ')}
        >
          <div
            className={[
              'rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words',
              message.direction === 'Outbound'
                ? 'bg-fuchsia-500/15 border border-fuchsia-500/25 text-white'
                : 'bg-white/5 border border-white/10 text-white/85',
            ].join(' ')}
          >
            {message.content}
          </div>
          <span className="text-white/25 text-[11px] mt-1 px-1">{formatTime(message.createdAt)}</span>
        </div>
      ))}
    </div>
  )
}
