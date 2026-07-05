const NOTES_STORAGE_KEY = 'dndcrime-user-notes'

function storageKey(userId: string) {
  return `${NOTES_STORAGE_KEY}:${userId}`
}

export function loadUserNotes(userId: string): string {
  try {
    return localStorage.getItem(storageKey(userId)) ?? ''
  } catch {
    return ''
  }
}

export function saveUserNotes(userId: string, content: string) {
  localStorage.setItem(storageKey(userId), content)
}
