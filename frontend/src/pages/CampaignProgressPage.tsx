import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CampaignProgressView } from '../modules/campaigns/CampaignProgressView'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'
import type { CampaignProgress } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

export function CampaignProgressPage() {
  const { campaign } = useOutletContext<CampaignRoomContext>()
  const fetchCampaignProgress = useCampaignStore((s) => s.fetchCampaignProgress)
  const cached = useCampaignStore((s) => s.getCampaignProgress(campaign.id))

  const [progress, setProgress] = useState<CampaignProgress | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchCampaignProgress(campaign.id)
        if (!cancelled) setProgress(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [campaign.id, fetchCampaignProgress])

  if (loading) {
    return <p className="text-sm text-dnd-muted">Загрузка прогресса…</p>
  }

  if (!progress) {
    return (
      <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center text-sm text-dnd-muted">
        Мастер ещё не опубликовал прогресс кампании
      </div>
    )
  }

  return <CampaignProgressView progress={progress} />
}
