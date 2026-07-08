import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CampaignPartyMemberCard } from '../modules/campaigns/CampaignPartyMemberCard'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'
import { useCharacterStore } from '../store/characterStore'
import type { CharacterSummary } from '../modules/characters/types'
import { apiFetch } from '../lib/apiClient'

export function CampaignMasterParticipantsPage() {
  const { campaign } = useOutletContext<CampaignMasterContext>()
  const party = useCharacterStore((s) => s.getPartyByCampaignId(campaign.id))
  const fetchParty = useCharacterStore((s) => s.fetchParty)

  const [assigningFor, setAssigningFor] = useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchParty(campaign.id)
  }, [campaign.id, fetchParty])

  async function assignAchievement(character: CharacterSummary, title: string) {
    if (!title) return
    setError(null)
    try {
      await apiFetch<CharacterSummary>(`/api/characters/${character.id}/achievements`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      await fetchParty(campaign.id)
      setAssigningFor(null)
      setSelectedTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось присвоить антидостижение')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="text-lg font-semibold text-white">Игроки кампании</h3>
        <p className="mt-1 text-sm text-dnd-muted">
          {party.length} из {campaign.maxPlayers} слотов занято
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {party.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-dnd-border bg-dnd-dark/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-white">Игроков пока нет</p>
            <p className="mt-2 max-w-md text-sm text-dnd-muted">
              Когда участники присоединятся к кампании и создадут персонажей, они появятся здесь.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {party.map((member) => (
              <div key={member.id} className="space-y-3">
                <CampaignPartyMemberCard character={member} />
                {campaign.antiAchievementPool.length > 0 && (
                  <div className="rounded-lg border border-dnd-border bg-dnd-dark/30 p-3">
                    {assigningFor === member.id ? (
                      <div className="space-y-2">
                        <select
                          value={selectedTitle}
                          onChange={(e) => setSelectedTitle(e.target.value)}
                          className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white outline-none focus:border-dnd-purple"
                        >
                          <option value="">Выберите антидостижение</option>
                          {campaign.antiAchievementPool.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            className="!w-auto flex-1"
                            disabled={!selectedTitle}
                            onClick={() => void assignAchievement(member, selectedTitle)}
                          >
                            Присвоить
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="!w-auto"
                            onClick={() => {
                              setAssigningFor(null)
                              setSelectedTitle('')
                            }}
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningFor(member.id)
                          setSelectedTitle('')
                        }}
                        className="text-xs text-dnd-gold transition hover:underline"
                      >
                        Присвоить антидостижение
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
