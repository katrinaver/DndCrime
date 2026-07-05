import type { CharacterListItem, CharacterSheet } from '../modules/characters/types'
import type { CharacterSummary } from '../modules/characters/types'

type ApiCharacter = CharacterSheet & { avatarUrl?: string }

export function characterFromApi(data: ApiCharacter): CharacterSheet {
  const { avatarUrl, ...rest } = data
  return {
    ...rest,
    avatarFileName: avatarUrl ?? rest.avatarFileName ?? '',
  }
}

export function characterToApi(sheet: CharacterSheet): ApiCharacter {
  const { avatarFileName, ...rest } = sheet
  return {
    ...rest,
    avatarUrl: avatarFileName || undefined,
  }
}

export function listItemFromCharacter(sheet: CharacterSheet): CharacterListItem {
  return {
    id: sheet.id,
    name: sheet.name,
    className: sheet.className,
    level: sheet.level,
    species: sheet.species,
    campaignName: sheet.campaignName,
    creationType: sheet.creationType,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}

export function summaryFromApi(data: CharacterSummary): CharacterSummary {
  return data
}
