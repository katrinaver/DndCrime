import { apiFetch } from '../lib/apiClient'

export interface UserProfile {
  userId: string
  email: string
  name: string
  description: string
  avatarUrl?: string
}

export interface UpdateProfilePayload {
  email: string
  name: string
  description: string
  avatarUrl?: string
}

export function fetchProfile() {
  return apiFetch<UserProfile>('/api/profile')
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiFetch<UserProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
