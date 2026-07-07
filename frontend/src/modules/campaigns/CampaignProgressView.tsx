import type { CampaignProgress } from './types'

interface CampaignProgressViewProps {
  progress: CampaignProgress
  editable?: boolean
}

export function CampaignProgressView({ progress }: CampaignProgressViewProps) {
  const milestones = [...(progress.milestones ?? [])].sort((a, b) => a.order - b.order)
  const completedCount = milestones.filter((m) => m.completed).length

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Прогресс кампании</h3>
            {progress.currentChapter && (
              <p className="mt-1 text-sm text-dnd-gold">{progress.currentChapter}</p>
            )}
          </div>
          {milestones.length > 0 && (
            <p className="text-sm text-dnd-muted">
              {completedCount} / {milestones.length} этапов
            </p>
          )}
        </div>

        {progress.summary ? (
          <p className="mt-4 text-sm leading-relaxed text-gray-300">{progress.summary}</p>
        ) : (
          <p className="mt-4 text-sm text-dnd-muted">Мастер ещё не добавил описание прогресса.</p>
        )}
      </section>

      {milestones.length > 0 && (
        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Этапы
          </h4>
          <ol className="mt-4 space-y-3">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.id || `milestone-${index}`}
                className={`rounded-lg border p-4 ${
                  milestone.completed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-dnd-border bg-dnd-dark/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      milestone.completed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-dnd-border/50 text-dnd-muted'
                    }`}
                  >
                    {milestone.completed ? '✓' : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${
                        milestone.completed ? 'text-emerald-200' : 'text-white'
                      }`}
                    >
                      {milestone.title}
                    </p>
                    {milestone.description && (
                      <p className="mt-1 text-sm text-dnd-muted">{milestone.description}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
