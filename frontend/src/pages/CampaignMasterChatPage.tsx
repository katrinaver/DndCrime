import { useOutletContext } from 'react-router-dom'
import { CampaignChatPanel } from '../modules/campaigns/CampaignChatPanel'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'

export function CampaignMasterChatPage() {
  const { campaign } = useOutletContext<CampaignMasterContext>()

  return <CampaignChatPanel campaignId={campaign.id} campaignName={campaign.name} masterId={campaign.masterId} />
}
