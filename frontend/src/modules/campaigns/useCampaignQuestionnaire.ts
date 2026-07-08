import { useEffect, useState } from 'react'
import { useCampaignStore } from '../../store/campaignStore'
import type { CampaignFormConfig } from '../characters/types'

export function useCampaignQuestionnaire(campaignId: string | undefined) {
  const config = useCampaignStore((s) =>
    campaignId ? s.questionnaires[campaignId] : undefined,
  )
  const fetchQuestionnaire = useCampaignStore((s) => s.fetchQuestionnaire)

  const [loading, setLoading] = useState(Boolean(campaignId))
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!campaignId) {
      setLoading(false)
      setNotFound(true)
      return
    }

    if (config) {
      setLoading(false)
      setNotFound(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)

    void fetchQuestionnaire(campaignId).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result) {
        setNotFound(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [campaignId, config, fetchQuestionnaire])

  return {
    config: config as CampaignFormConfig | undefined,
    loading,
    error,
    notFound,
  }
}
