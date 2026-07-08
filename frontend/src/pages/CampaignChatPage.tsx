import { useOutletContext } from 'react-router-dom'
import { CampaignChatPanel } from '../modules/campaigns/CampaignChatPanel'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'

export function CampaignChatPage() {
  const { campaign } = useOutletContext<CampaignRoomContext>()

  return <CampaignChatPanel campaignId={campaign.id} campaignName={campaign.name} masterId={campaign.masterId} />
}
