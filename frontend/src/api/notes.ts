import { apiFetch } from '../lib/apiClient'

export interface Note {
  userId: string
  content: string
  updatedAt: string
}

export function fetchNote() {
  return apiFetch<Note>('/api/notes')
}

export function updateNote(content: string) {
  return apiFetch<Note>('/api/notes', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}
