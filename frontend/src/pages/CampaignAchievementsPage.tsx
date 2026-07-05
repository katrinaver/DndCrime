import { useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'

export function CampaignAchievementsPage() {
  const { campaign, character } = useOutletContext<CampaignRoomContext>()
  const party = useCharacterStore((s) => s.getPartyByCampaignId(campaign.id))
  const fetchParty = useCharacterStore((s) => s.fetchParty)

  const myEarned = character?.antiAchievements ?? []
  const myEarnedTitles = new Set(myEarned.map((item) => item.title))

  useEffect(() => {
    void fetchParty(campaign.id)
  }, [campaign.id, fetchParty])

  const hallOfShame = party.flatMap((c) =>
    (c.antiAchievements ?? []).map((achievement) => ({
      ...achievement,
      characterName: c.name,
    })),
  )

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="text-lg font-semibold text-white">Ачивки персонажа</h3>
        <p className="mt-1 text-sm text-dnd-muted">
          Антидостижения присваиваются персонажу за курьёзные провалы
        </p>

        {myEarned.length === 0 ? (
          <p className="mt-6 text-sm text-dnd-muted">
            {character
              ? 'У вашего персонажа пока нет антидостижений — так держать!'
              : 'Создайте персонажа, чтобы отслеживать ачивки'}
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {myEarned.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
              >
                <span className="text-xl" aria-hidden>
                  🏅
                </span>
                <div>
                  <p className="font-medium text-amber-200">{item.title}</p>
                  <p className="mt-1 text-xs text-dnd-muted">{item.earnedAt}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {character && (
          <Link
            to={`/characters/${character.id}`}
            className="mt-4 inline-block text-sm text-dnd-gold hover:underline"
          >
            Все ачивки на листе персонажа →
          </Link>
        )}
      </section>

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Пул кампании
        </h4>
        <p className="mt-1 text-xs text-dnd-muted">
          Список задан мастером при создании кампании — из него присваивают персонажам
        </p>
        {campaign.antiAchievementPool.length === 0 ? (
          <p className="mt-4 text-sm text-dnd-muted">Мастер ещё не задал список</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {campaign.antiAchievementPool.map((item) => {
              const isMine = myEarnedTitles.has(item)
              return (
                <li
                  key={item}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    isMine
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                      : 'border-dnd-border text-dnd-muted'
                  }`}
                >
                  {item}
                  {isMine && ' ✓'}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {hallOfShame.length > 0 && (
        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Доска позора группы
          </h4>
          <ul className="mt-4 space-y-2">
            {hallOfShame.map((item) => (
              <li key={item.id} className="text-sm text-gray-300">
                <span className="text-dnd-gold">{item.characterName}</span>
                {' — '}
                {item.title}
                <span className="text-dnd-muted"> · {item.earnedAt}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
