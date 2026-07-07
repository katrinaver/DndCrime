import DOMPurify from 'dompurify'

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
