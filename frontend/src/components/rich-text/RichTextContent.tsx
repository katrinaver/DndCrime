import { looksLikeHtml, sanitizeRichText } from './utils'

interface RichTextContentProps {
  content: string
  className?: string
}

export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  if (!content) return null

  if (looksLikeHtml(content)) {
    const safe = sanitizeRichText(content)
    return (
      <div
        className={`rich-text-content ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    )
  }

  return (
    <div className={`rich-text-content whitespace-pre-wrap ${className}`.trim()}>
      {content}
    </div>
  )
}
