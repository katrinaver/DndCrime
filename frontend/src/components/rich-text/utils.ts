import DOMPurify from 'dompurify'

// Форсим rel="noopener noreferrer" на любых ссылках с target: DOMPurify пропускает
// target/rel, но сам noopener не дописывает. Без этого HTML, отправленный сырьём в
// API (чат/новости/заметки), может открыть вкладку с доступом к window.opener
// (reverse tabnabbing).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof Element && node.tagName === 'A' && node.hasAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'download'],
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'a',
      'img',
      'ul',
      'ol',
      'li',
      'blockquote',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'download', 'class'],
  })
}

export function looksLikeHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content)
}

export function isRichTextEmpty(html: string): boolean {
  const trimmed = html.trim()
  if (!trimmed) return true

  const sanitized = sanitizeRichText(trimmed)
  const text = sanitized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  const hasMedia = /<img[\s>]/i.test(sanitized) || /download=/i.test(sanitized)

  return !text && !hasMedia
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
