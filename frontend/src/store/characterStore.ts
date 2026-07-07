import { create } from 'zustand'
import * as charactersApi from '../api/characters'
import * as campaignsApi from '../api/campaigns'
import { listItemFromCharacter } from '../api/mappers'
import type { CharacterListItem, CharacterSheet, CharacterSummary } from '../modules/characters/types'

interface CharacterState {
  list: CharacterListItem[]
  sheets: Record<string, CharacterSheet>
  partyByCampaign: Record<string, CharacterSummary[]>
  loading: boolean
  error: string | null
  fetchCharacters: () => Promise<void>
  fetchCharacter: (id: string) => Promise<CharacterSheet | undefined>
  fetchParty: (campaignId: string) => Promise<CharacterSummary[]>
  createCharacter: (sheet: CharacterSheet) => Promise<CharacterSheet>
  getCharacterById: (id: string) => CharacterSheet | undefined
  getCharacterByCampaignId: (campaignId: string) => CharacterSheet | undefined
  getPartyByCampaignId: (campaignId: string) => CharacterSummary[]
  reset: () => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  list: [],
  sheets: {},
  partyByCampaign: {},
  loading: false,
  error: null,

  fetchCharacters: async () => {
    set({ loading: true, error: null })
    try {
      const data = await charactersApi.fetchCharacters()
      const list = Array.isArray(data) ? data : []
      const sheets: Record<string, CharacterSheet> = {}
      await Promise.all(
        list.map(async (item) => {
          try {
            sheets[item.id] = await charactersApi.fetchCharacter(item.id)
          } catch {
            // skip failed sheet
          }
        }),
      )
      set({ list, sheets, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить персонажей',
      })
    }
  },

  fetchCharacter: async (id) => {
    const cached = get().sheets[id]
    if (cached) return cached

    try {
      const sheet = await charactersApi.fetchCharacter(id)
      set((state) => ({
        sheets: { ...state.sheets, [id]: sheet },
        list: state.list.some((item) => item.id === id)
          ? state.list
          : [...state.list, listItemFromCharacter(sheet)],
      }))
      return sheet
    } catch {
      return undefined
    }
  },

  fetchParty: async (campaignId) => {
    const cached = get().partyByCampaign[campaignId]
    if (cached) return cached

    try {
      const data = await campaignsApi.fetchCampaignParty(campaignId)
      const party = Array.isArray(data) ? data : []
      set((state) => ({
        partyByCampaign: { ...state.partyByCampaign, [campaignId]: party },
      }))
      return party
    } catch {
      return []
    }
  },

  createCharacter: async (sheet) => {
    const created = await charactersApi.createCharacter(sheet)
    set((state) => ({
      sheets: { ...state.sheets, [created.id]: created },
      list: [...state.list, listItemFromCharacter(created)],
    }))
    return created
  },

  getCharacterById: (id) => get().sheets[id],

  getCharacterByCampaignId: (campaignId) =>
    Object.values(get().sheets).find((c) => c.campaignId === campaignId),

  getPartyByCampaignId: (campaignId) => get().partyByCampaign[campaignId] ?? [],

  reset: () =>
    set({ list: [], sheets: {}, partyByCampaign: {}, loading: false, error: null }),
}))
