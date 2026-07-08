import { useEffect, useState } from 'react'
import { useCampaignStore } from '../../store/campaignStore'
import type { Campaign } from './types'
import { isCampaignMember } from './utils'

export function useResolvedCampaign(campaignId: string | undefined, userId: string | undefined) {
  const campaigns = useCampaignStore((s) => s.campaigns)
  const listLoading = useCampaignStore((s) => s.loading)
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns)
  const fetchCampaignById = useCampaignStore((s) => s.fetchCampaignById)

  const [resolving, setResolving] = useState(Boolean(campaignId))
  const [notFound, setNotFound] = useState(false)

  const campaign = campaignId ? campaigns.find((c) => c.id === campaignId) : undefined

  useEffect(() => {
    if (!campaignId) {
      setResolving(false)
      setNotFound(true)
      return
    }

    if (campaign) {
      setResolving(false)
      setNotFound(false)
      return
    }

    let cancelled = false
    setResolving(true)
    setNotFound(false)

    void (async () => {
      if (!listLoading && campaigns.length === 0) {
        await fetchCampaigns()
      }

      const fromList = useCampaignStore.getState().campaigns.find((c) => c.id === campaignId)
      if (fromList) {
        if (!cancelled) {
          setResolving(false)
          setNotFound(false)
        }
        return
      }

      const fetched = await fetchCampaignById(campaignId)
      if (!cancelled) {
        setResolving(false)
        setNotFound(!fetched)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [campaignId, campaign, campaigns.length, listLoading, fetchCampaigns, fetchCampaignById])

  const isMember = campaign ? isCampaignMember(campaign, userId) : false

  return {
    campaign,
    resolving: resolving || listLoading,
    notFound: notFound || (Boolean(campaign) && !isMember),
    isMember,
  }
}

export type ResolvedCampaign = Campaign
