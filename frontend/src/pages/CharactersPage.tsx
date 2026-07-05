import { CharacterCreateMenu } from '../modules/characters/CharacterCreateMenu'
import { CharacterList } from '../modules/characters/CharacterList'
import { useCharacterStore } from '../store/characterStore'

export function CharactersPage() {
  const characters = useCharacterStore((s) => s.list)
  const loading = useCharacterStore((s) => s.loading)
  const error = useCharacterStore((s) => s.error)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Мои персонажи</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            {loading
              ? 'Загрузка…'
              : `${characters.length} ${characters.length === 1 ? 'персонаж' : 'персонажей'} в коллекции`}
          </p>
        </div>
        <CharacterCreateMenu />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && characters.length === 0 ? (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center text-sm text-dnd-muted">
          Персонажей пока нет. Создайте первого через меню «Создать персонажа».
        </div>
      ) : (
        <CharacterList characters={characters} />
      )}
    </div>
  )
}
