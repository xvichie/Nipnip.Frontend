'use client'

import { useEffect, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { FlagIcon } from '@/components/ui/FlagIcon'
import { IconButton } from '@/components/ui/IconButton'
import {
  BoldIcon,
  BulletListIcon,
  ClearFormatIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  UnderlineIcon,
} from '@/components/ui/icons'
import type { TranslatedFieldValue } from './TranslatedField'

type LangKey = keyof TranslatedFieldValue

const TABS: { key: LangKey; short: string }[] = [
  { key: 'ka', short: 'ქართ' },
  { key: 'en', short: 'ENG' },
  { key: 'ru', short: 'РУС' },
]

// Shared prose styling for both the editable surface and (via StorePageView) the final rendered
// page, so what a merchant sees while typing already looks like what shoppers will see.
export const RICH_TEXT_CONTENT_CLASS =
  '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:first:mt-0 ' +
  '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:first:mt-0 ' +
  '[&_p]:mb-3 [&_p]:last:mb-0 ' +
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:opacity-80 [&_blockquote]:italic [&_blockquote]:mb-3 ' +
  '[&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-bold [&_em]:italic [&_u]:underline'

/**
 * Rich-text counterpart to TranslatedField — same {ka,en,ru} tabbed contract, but each language's
 * value is HTML authored with a Tiptap editor instead of plain text. Switching tabs remounts the
 * editor (via `key`) rather than imperatively syncing content, since each language's document is
 * independent — simpler than fighting Tiptap's own content-diffing for what's effectively a
 * different field per tab.
 *
 * `variant: 'inline'` is for single-line fields (page titles): headings/lists/blockquote are
 * disabled and Enter is swallowed so the field can't grow into a multi-paragraph document, while
 * still allowing bold/italic/underline/links. `variant: 'block'` (default) is the full editor for
 * long-form content.
 */
export function RichTranslatedField({
  value,
  onChange,
  placeholders,
  variant = 'block',
  autoFocus = false,
}: {
  value: TranslatedFieldValue
  onChange: (value: TranslatedFieldValue) => void
  placeholders?: Partial<Record<LangKey, string>>
  variant?: 'inline' | 'block'
  autoFocus?: boolean
}) {
  const [activeTab, setActiveTab] = useState<LangKey>('ka')

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {TABS.map(tab => {
          const filled = value[tab.key].trim().length > 0
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                activeTab === tab.key ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'text-white/40 hover:text-white/70 hover:bg-white/6',
              ].join(' ')}
            >
              <FlagIcon code={tab.key} className="w-4 h-3" />
              <span>{tab.short}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-emerald-400' : 'bg-white/15'}`} />
            </button>
          )
        })}
      </div>
      <RichTextEditorPane
        key={activeTab}
        value={value[activeTab]}
        onChange={html => onChange({ ...value, [activeTab]: html })}
        placeholder={placeholders?.[activeTab]}
        variant={variant}
        autoFocus={autoFocus}
      />
    </div>
  )
}

function RichTextEditorPane({
  value,
  onChange,
  placeholder,
  variant,
  autoFocus,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  variant: 'inline' | 'block'
  autoFocus: boolean
}) {
  const isInline = variant === 'inline'

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: isInline ? false : { levels: [2, 3] },
        bulletList: isInline ? false : {},
        orderedList: isInline ? false : {},
        blockquote: isInline ? false : {},
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-9 ${isInline ? '' : `min-h-32 ${RICH_TEXT_CONTENT_CLASS}`}`,
      },
      handleKeyDown: isInline ? (_view, event) => event.key === 'Enter' : undefined,
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Tiptap only reads `content` once, at mount — this catches external changes to `value` after
  // that (e.g. a "preset" button writing straight into state) and pushes them into the editor.
  // Comparing against the editor's own current HTML (rather than an "is this our own update" flag)
  // means the common case — the change came from this editor's own onUpdate, so `value` already
  // equals `editor.getHTML()` — is a no-op, and typing never gets its cursor reset mid-edit.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  function setLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('ბმულის მისამართი', previousUrl ?? 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 focus-within:border-fuchsia-500/60 transition-colors overflow-hidden">
      <Toolbar editor={editor} variant={variant} onSetLink={setLink} />
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function Toolbar({
  editor,
  variant,
  onSetLink,
}: {
  editor: Editor
  variant: 'inline' | 'block'
  onSetLink: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-white/10 bg-white/2">
      <IconButton
        icon={<BoldIcon />}
        label="სქელი"
        size="xs"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <IconButton
        icon={<ItalicIcon />}
        label="დახრილი"
        size="xs"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <IconButton
        icon={<UnderlineIcon />}
        label="ხაზგასმული"
        size="xs"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <IconButton icon={<LinkIcon />} label="ბმული" size="xs" active={editor.isActive('link')} onClick={onSetLink} />

      {variant === 'block' && (
        <>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={[
              'px-1.5 h-6 rounded-md text-[11px] font-bold transition-colors',
              editor.isActive('heading', { level: 2 }) ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'bg-white/4 border border-white/8 text-white/60 hover:text-white',
            ].join(' ')}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={[
              'px-1.5 h-6 rounded-md text-[11px] font-bold transition-colors',
              editor.isActive('heading', { level: 3 }) ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'bg-white/4 border border-white/8 text-white/60 hover:text-white',
            ].join(' ')}
          >
            H3
          </button>
          <IconButton
            icon={<BulletListIcon />}
            label="ჩამონათვალი"
            size="xs"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <IconButton
            icon={<OrderedListIcon />}
            label="დანომრილი სია"
            size="xs"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <IconButton
            icon={<QuoteIcon />}
            label="ციტატა"
            size="xs"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </>
      )}

      <div className="w-px h-4 bg-white/10 mx-0.5" />
      <IconButton
        icon={<ClearFormatIcon />}
        label="ფორმატირების გასუფთავება"
        size="xs"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      />
    </div>
  )
}
