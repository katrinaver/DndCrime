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
