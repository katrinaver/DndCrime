import { create } from 'zustand'
import * as profileApi from '../api/profile'

export interface ProfileFormState {
  email: string
  name: string
  description: string
  avatarFileName: string
}

interface ProfileState {
  profile: ProfileFormState | null
  loading: boolean
  error: string | null
  fetchProfile: (fallbackEmail?: string) => Promise<void>
  saveProfile: (profile: ProfileFormState) => Promise<void>
  reset: () => void
}

function toFormState(data: profileApi.UserProfile): ProfileFormState {
  return {
    email: data.email,
    name: data.name,
    description: data.description,
    avatarFileName: data.avatarUrl ?? '',
  }
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (fallbackEmail = '') => {
    set({ loading: true, error: null })
    try {
      const data = await profileApi.fetchProfile()
      set({ profile: toFormState(data), loading: false })
    } catch (err) {
      set({
        profile: { email: fallbackEmail, name: '', description: '', avatarFileName: '' },
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить профиль',
      })
    }
  },

  saveProfile: async (profile) => {
    const data = await profileApi.updateProfile({
      email: profile.email,
      name: profile.name,
      description: profile.description,
      avatarUrl: profile.avatarFileName || undefined,
    })
    set({ profile: toFormState(data), error: null })
  },

  reset: () => set({ profile: null, loading: false, error: null }),
}))
