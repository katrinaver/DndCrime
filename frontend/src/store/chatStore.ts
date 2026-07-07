import { create } from 'zustand'
import * as chatApi from '../api/chat'

interface ChatState {
  messagesByCampaign: Record<string, chatApi.ChatMessage[]>
  loadingByCampaign: Record<string, boolean>
  fetchCampaignChat: (campaignId: string) => Promise<void>
  sendCampaignMessage: (campaignId: string, text: string) => Promise<void>
  updateCampaignMessage: (campaignId: string, messageId: string, text: string) => Promise<void>
  deleteCampaignMessage: (campaignId: string, messageId: string) => Promise<void>
  getCampaignMessages: (campaignId: string) => chatApi.ChatMessage[]
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByCampaign: {},
  loadingByCampaign: {},

  fetchCampaignChat: async (campaignId) => {
    set((state) => ({
      loadingByCampaign: { ...state.loadingByCampaign, [campaignId]: true },
    }))
    try {
      const data = await chatApi.fetchCampaignChatMessages(campaignId)
      const messages = Array.isArray(data) ? data : []
      set((state) => ({
        messagesByCampaign: { ...state.messagesByCampaign, [campaignId]: messages },
        loadingByCampaign: { ...state.loadingByCampaign, [campaignId]: false },
      }))
    } catch {
      set((state) => ({
        loadingByCampaign: { ...state.loadingByCampaign, [campaignId]: false },
      }))
    }
  },

  sendCampaignMessage: async (campaignId, text) => {
    const message = await chatApi.sendCampaignChatMessage(campaignId, text)
    set((state) => ({
      messagesByCampaign: {
        ...state.messagesByCampaign,
        [campaignId]: [...(state.messagesByCampaign[campaignId] ?? []), message],
      },
    }))
  },

  updateCampaignMessage: async (campaignId, messageId, text) => {
    const updated = await chatApi.updateCampaignChatMessage(campaignId, messageId, text)
    set((state) => ({
      messagesByCampaign: {
        ...state.messagesByCampaign,
        [campaignId]: (state.messagesByCampaign[campaignId] ?? []).map((message) =>
          message.id === messageId ? updated : message,
        ),
      },
    }))
  },

  deleteCampaignMessage: async (campaignId, messageId) => {
    await chatApi.deleteCampaignChatMessage(campaignId, messageId)
    set((state) => ({
      messagesByCampaign: {
        ...state.messagesByCampaign,
        [campaignId]: (state.messagesByCampaign[campaignId] ?? []).filter(
          (message) => message.id !== messageId,
        ),
      },
    }))
  },

  getCampaignMessages: (campaignId) => get().messagesByCampaign[campaignId] ?? [],

  reset: () => set({ messagesByCampaign: {}, loadingByCampaign: {} }),
}))
