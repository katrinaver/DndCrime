export function isProbablyImageUrl(value?: string | null): boolean {
  if (!value) return false
  return (
    value.startsWith('data:image/') ||
    (/^https?:\/\//i.test(value) && /\.(avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(value))
  )
}

export function fileLabelFromUrl(value: string): string {
  try {
    const url = new URL(value)
    const segment = url.pathname.split('/').filter(Boolean).pop()
    return segment ? decodeURIComponent(segment) : value
  } catch {
    return value
  }
}
