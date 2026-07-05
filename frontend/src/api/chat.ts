import { apiFetch } from '../lib/apiClient'

export interface ChatMessage {
  id: string
  chatId: string
  authorId: string
  author: string
  text: string
  createdAt: string
  updatedAt?: string
}

export function fetchCampaignChatMessages(campaignId: string) {
  return apiFetch<ChatMessage[]>(`/api/campaigns/${campaignId}/chat/messages`)
}

export function sendCampaignChatMessage(campaignId: string, text: string) {
  return apiFetch<ChatMessage>(`/api/campaigns/${campaignId}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function updateCampaignChatMessage(campaignId: string, messageId: string, text: string) {
  return apiFetch<ChatMessage>(`/api/campaigns/${campaignId}/chat/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ text }),
  })
}

export function deleteCampaignChatMessage(campaignId: string, messageId: string) {
  return apiFetch<void>(`/api/campaigns/${campaignId}/chat/messages/${messageId}`, {
    method: 'DELETE',
  })
}
