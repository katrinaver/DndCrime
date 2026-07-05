export interface UserProfile {
  email: string
  name: string
  description: string
  avatarFileName: string
}

const PROFILE_STORAGE_KEY = 'dndcrime-user-profile'

function storageKey(userId: string) {
  return `${PROFILE_STORAGE_KEY}:${userId}`
}

export function loadUserProfile(userId: string, defaults: UserProfile): UserProfile {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function saveUserProfile(userId: string, profile: UserProfile) {
  localStorage.setItem(storageKey(userId), JSON.stringify(profile))
}

export function getProfileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}
