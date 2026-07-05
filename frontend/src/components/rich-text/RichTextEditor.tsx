import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'
import { escapeHtml, isRichTextEmpty, readFileAsDataUrl } from './utils'

interface RichTextEditorProps {
  placeholder?: string
  compact?: boolean
  disabled?: boolean
  submitOnEnter?: boolean
  initialContent?: string
  onChange: (html: string) => void
  onSubmit?: () => void
}

function ToolbarButton({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        'rounded-md px-2 py-1 text-xs font-medium transition',
        active
          ? 'bg-dnd-purple/30 text-dnd-purple-hover'
          : 'text-dnd-muted hover:bg-dnd-border/60 hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  placeholder = 'Напишите сообщение…',
  compact = false,
  disabled = false,
  submitOnEnter = false,
  initialContent = '',
  onChange,
  onSubmit,
}: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const onSubmitRef = useRef(onSubmit)

  onSubmitRef.current = onSubmit

  const editor = useEditor({
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: compact ? false : { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rich-text-image',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    editable: !disabled,
    editorProps: {
      attributes: {
        class: compact
          ? 'prose-editor prose-editor-compact'
          : 'prose-editor prose-editor-full',
      },
      handleKeyDown: (_view, event) => {
        if (submitOnEnter && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          onSubmitRef.current?.()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!showEmojiPicker) return

    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  function insertLink() {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL ссылки', previousUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function insertEmoji(data: EmojiClickData) {
    editor?.chain().focus().insertContent(data.emoji).run()
    setShowEmojiPicker(false)
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editor) return

    setAttachmentError(null)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run()
        return
      }

      editor
        .chain()
        .focus()
        .insertContent(
          `<p><a href="${dataUrl}" download="${escapeHtml(file.name)}">📎 ${escapeHtml(file.name)}</a></p>`,
        )
        .run()
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Не удалось прикрепить файл')
    }
  }

  if (!editor) return null

  return (
    <div className="tiptap-editor rounded-lg border border-dnd-border bg-dnd-dark">
      <div className="flex flex-wrap items-center gap-1 border-b border-dnd-border/70 px-2 py-1.5">
        {!compact && (
          <>
            <ToolbarButton
              title="Заголовок"
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H
            </ToolbarButton>
            <ToolbarButton
              title="Маркированный список"
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              •
            </ToolbarButton>
          </>
        )}

        <ToolbarButton
          title="Жирный"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Курсив"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          title="Подчёркнутый"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>
        <ToolbarButton
          title="Ссылка"
          active={editor.isActive('link')}
          onClick={insertLink}
        >
          🔗
        </ToolbarButton>

        <div className="relative" ref={emojiRef}>
          <ToolbarButton title="Смайлик" onClick={() => setShowEmojiPicker((v) => !v)}>
            😀
          </ToolbarButton>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 z-20 mb-2">
              <EmojiPicker
                onEmojiClick={insertEmoji}
                theme={Theme.DARK}
                width={compact ? 280 : 320}
                height={360}
                searchPlaceholder="Поиск эмодзи…"
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        <ToolbarButton title="Прикрепить файл" onClick={() => fileInputRef.current?.click()}>
          📎
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.md,.doc,.docx,.zip"
          onChange={(e) => void handleFileSelect(e)}
        />
      </div>

      <EditorContent editor={editor} />

      {attachmentError && (
        <p className="border-t border-dnd-border/70 px-3 py-2 text-xs text-red-400">
          {attachmentError}
        </p>
      )}

      {submitOnEnter && (
        <p className="border-t border-dnd-border/70 px-3 py-1.5 text-xs text-dnd-muted">
          Enter — отправить, Shift+Enter — новая строка
        </p>
      )}
    </div>
  )
}

export { isRichTextEmpty }
