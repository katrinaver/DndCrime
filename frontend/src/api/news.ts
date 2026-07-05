import { apiFetch } from '../lib/apiClient'
import type { NewsPost } from '../modules/news/types'

export function fetchNewsPosts() {
  return apiFetch<NewsPost[]>('/api/news/posts')
}

export function createNewsPost(content: string, campaign?: string) {
  return apiFetch<NewsPost>('/api/news/posts', {
    method: 'POST',
    body: JSON.stringify({ content, campaign }),
  })
}

export function addNewsComment(postId: string, content: string) {
  return apiFetch<NewsPost>(`/api/news/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}
