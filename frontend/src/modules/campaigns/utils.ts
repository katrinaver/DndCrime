import type { Campaign } from './types'

/** Путь к комнате игрока или панели мастера в зависимости от роли. */
export function getCampaignEntryPath(campaign: Campaign, userId?: string): string {
  if (userId && userId === campaign.masterId) {
    return `/campaigns/${campaign.id}/master`
  }
  return `/campaigns/${campaign.id}/menu`
}

export function isCampaignMaster(campaign: Campaign, userId?: string): boolean {
  return Boolean(userId && userId === campaign.masterId)
}

export function isCampaignMember(campaign: Campaign, userId?: string): boolean {
  if (!userId) return false
  return isCampaignMaster(campaign, userId) || campaign.playerIds.includes(userId)
}

/** Путь к комнате игрока (всегда, независимо от роли). */
export function getCampaignPlayerPath(campaignId: string): string {
  return `/campaigns/${campaignId}/menu`
}

/** Путь к панели мастера. */
export function getCampaignMasterPath(campaignId: string): string {
  return `/campaigns/${campaignId}/master`
}
