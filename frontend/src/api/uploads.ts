import { apiFetch } from '../lib/apiClient'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export interface UploadResponse {
  url: string
  key: string
}

export async function uploadFile(
  file: File,
  kind: 'attachment' | 'avatar' | 'campaign-asset' = 'attachment',
) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Файл слишком большой (макс. ${MAX_UPLOAD_BYTES / (1024 * 1024)} МБ)`)
  }

  const body = new FormData()
  body.append('file', file)
  body.append('kind', kind)

  return apiFetch<UploadResponse>('/api/uploads', {
    method: 'POST',
    body,
  })
}
