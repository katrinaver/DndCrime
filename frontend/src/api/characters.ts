import { apiFetch } from '../lib/apiClient'
import { characterFromApi, characterToApi } from './mappers'
import type { CharacterListItem, CharacterSheet } from '../modules/characters/types'

export async function fetchCharacters() {
  return apiFetch<CharacterListItem[]>('/api/characters')
}

export async function fetchCharacter(characterId: string) {
  const data = await apiFetch<CharacterSheet & { avatarUrl?: string }>(
    `/api/characters/${characterId}`,
  )
  return characterFromApi(data)
}

export async function createCharacter(sheet: CharacterSheet) {
  const payload = characterToApi(sheet)
  const { id: _id, ...body } = payload
  const data = await apiFetch<CharacterSheet & { avatarUrl?: string }>('/api/characters', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return characterFromApi(data)
}

export async function updateCharacter(characterId: string, sheet: CharacterSheet) {
  const payload = characterToApi(sheet)
  const data = await apiFetch<CharacterSheet & { avatarUrl?: string }>(
    `/api/characters/${characterId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
  return characterFromApi(data)
}
