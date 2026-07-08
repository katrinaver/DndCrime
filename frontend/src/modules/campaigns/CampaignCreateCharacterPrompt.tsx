import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

interface CampaignCreateCharacterPromptProps {
  campaignId: string
  compact?: boolean
}

export function CampaignCreateCharacterPrompt({
  campaignId,
  compact = false,
}: CampaignCreateCharacterPromptProps) {
  const createPath = `/characters/new/campaign/${campaignId}`

  if (compact) {
    return (
      <div className="mt-4 rounded-xl border border-dnd-border bg-dnd-card p-4">
        <p className="text-sm text-dnd-muted">У вас пока нет персонажа в этой кампании.</p>
        <Link to={createPath} className="mt-3 inline-block">
          <Button type="button" className="!w-auto px-5">
            Добавить персонажа
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-dnd-purple/30 bg-dnd-purple/5 p-5">
      <p className="text-sm font-medium text-white">Персонаж ещё не создан</p>
      <p className="mt-1 text-sm text-dnd-muted">
        Создайте героя для этой кампании, чтобы участвовать в партии и чате от его имени.
      </p>
      <Link to={createPath} className="mt-4 inline-block">
        <Button type="button" className="!w-auto px-6">
          Добавить персонажа
        </Button>
      </Link>
    </div>
  )
}
