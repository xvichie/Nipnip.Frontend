'use client'

import { useState } from 'react'
import {
  useCreateKnowledgeBaseSection,
  useDeleteKnowledgeBaseSection,
  useKnowledgeBaseSections,
  useUpdateKnowledgeBaseSection,
} from '@/lib/queries/knowledgeBase'
import type { KnowledgeBaseSectionResponse } from '@/lib/types'

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function SectionRow({ section }: { section: KnowledgeBaseSectionResponse }) {
  const { mutate: updateSection, isPending: isSaving } = useUpdateKnowledgeBaseSection()
  const { mutate: deleteSection, isPending: isDeleting } = useDeleteKnowledgeBaseSection()

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(section.title)
  const [content, setContent] = useState(section.content)

  function startEditing() {
    setTitle(section.title)
    setContent(section.content)
    setIsEditing(true)
  }

  function handleSave() {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) return
    updateSection(
      { id: section.id, title: trimmedTitle, content: trimmedContent },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  function handleDelete() {
    if (!confirm(`Delete "${section.title}"?`)) return
    deleteSection(section.id)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-white/2 border border-fuchsia-500/30 px-4 py-3">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Section title"
          className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          placeholder="Section content"
          className="textarea textarea-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
        />
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="btn btn-xs bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
          >
            {isSaving ? <span className="loading loading-spinner loading-xs" /> : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{section.title}</p>
        <p className="text-white/40 text-xs mt-0.5">{truncate(section.content)}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={startEditing}
          className="btn btn-xs bg-white/4 border-white/10 text-white/60 hover:text-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn btn-xs bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export function KnowledgeBaseManager() {
  const { data: sections, isLoading } = useKnowledgeBaseSections()
  const { mutate: createSection, isPending: isCreating, error: createError } = useCreateKnowledgeBaseSection()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createSection(
      { title: title.trim(), content: content.trim() },
      { onSuccess: () => { setTitle(''); setContent('') } }
    )
  }

  return (
    <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Knowledge Base</h2>
        <p className="text-white/30 text-xs mt-1">
          Add anything the agent should be able to answer questions about — shipping, returns, warranty, a takeout
          policy, whatever&apos;s specific to your store. The agent searches these automatically when a customer asks.
        </p>
      </div>

      {isLoading ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : sections && sections.length > 0 ? (
        <div className="flex flex-col gap-2">
          {sections.map(section => (
            <SectionRow key={section.id} section={section} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm">No sections yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-white/5">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Section title, e.g. Takeout Policy"
          className="input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
          required
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          placeholder="What should the agent know?"
          className="textarea textarea-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
          required
        />
        {createError && <p className="text-error text-xs">Failed to create section.</p>}
        <button
          type="submit"
          disabled={isCreating || !title.trim() || !content.trim()}
          className="btn btn-sm self-start bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40"
        >
          {isCreating ? <span className="loading loading-spinner loading-xs" /> : 'Add Section'}
        </button>
      </form>
    </div>
  )
}
