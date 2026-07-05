import DOMPurify from 'dompurify'

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024

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

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(new Error(`Файл слишком большой (макс. ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} МБ)`))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
