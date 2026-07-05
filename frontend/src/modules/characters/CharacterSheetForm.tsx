import { DND_SAVING_THROWS, DND_SKILLS, type CharacterSheet } from './types'
import { formatModifier } from './utils'

interface CharacterSheetFormProps {
  sheet: CharacterSheet
  readOnly?: boolean
  onChange?: (updates: Partial<CharacterSheet>) => void
}

function SheetInput({
  label,
  value,
  readOnly,
  onChange,
  type = 'text',
  className = '',
}: {
  label: string
  value: string | number
  readOnly?: boolean
  onChange?: (v: string) => void
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-dnd-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white outline-none transition focus:border-dnd-purple disabled:opacity-70"
      />
    </div>
  )
}

function SheetTextarea({
  label,
  value,
  readOnly,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  readOnly?: boolean
  onChange?: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-dnd-muted">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        rows={rows}
        className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white outline-none transition focus:border-dnd-purple disabled:opacity-70"
      />
    </div>
  )
}

function AbilityBlock({
  label,
  abbr,
  value,
  readOnly,
  onChange,
}: {
  label: string
  abbr: string
  value: number
  readOnly?: boolean
  onChange?: (v: number) => void
}) {
  return (
    <div className="rounded-lg border border-dnd-border bg-dnd-dark/50 p-3 text-center">
      <div className="text-xs font-medium text-dnd-muted">{label}</div>
      <div className="text-[10px] uppercase text-dnd-muted">{abbr}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        readOnly={readOnly}
        disabled={readOnly}
        className="mt-1 w-full bg-transparent text-center text-2xl font-bold text-white outline-none disabled:opacity-70"
      />
      <div className="text-sm text-dnd-gold">{formatModifier(value)}</div>
    </div>
  )
}

export function CharacterSheetForm({ sheet, readOnly = false, onChange }: CharacterSheetFormProps) {
  function updateAbility(key: keyof CharacterSheet['abilities'], value: number) {
    onChange?.({ abilities: { ...sheet.abilities, [key]: value } })
  }

  function toggleArrayItem(field: 'savingThrows' | 'skills', item: string) {
    if (readOnly) return
    const list = sheet[field]
    const next = list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    onChange?.({ [field]: next })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dnd-gold/30 bg-dnd-card p-4 text-center">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-dnd-gold">
          Dungeons &amp; Dragons — Лист персонажа (5e 2024)
        </h3>
      </div>

      {/* Основная информация */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Основная информация
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SheetInput
            label="Имя персонажа"
            value={sheet.name}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ name: v })}
          />
          <SheetInput
            label="Класс"
            value={sheet.className}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ className: v })}
          />
          <SheetInput
            label="Уровень"
            value={sheet.level}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ level: Number(v) })}
          />
          <SheetInput
            label="Вид (Species)"
            value={sheet.species}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ species: v })}
          />
          <SheetInput
            label="Предыстория"
            value={sheet.background}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ background: v })}
          />
          <SheetInput
            label="Имя игрока"
            value={sheet.playerName}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ playerName: v })}
          />
          <SheetInput
            label="Мировоззрение"
            value={sheet.alignment}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ alignment: v })}
          />
          <SheetInput
            label="Опыт (XP)"
            value={sheet.experiencePoints}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ experiencePoints: Number(v) })}
          />
          <SheetInput
            label="Бонус мастерства"
            value={sheet.proficiencyBonus}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ proficiencyBonus: Number(v) })}
          />
        </div>
      </section>

      {/* Характеристики */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Характеристики
        </h4>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <AbilityBlock
            label="Сила"
            abbr="STR"
            value={sheet.abilities.strength}
            readOnly={readOnly}
            onChange={(v) => updateAbility('strength', v)}
          />
          <AbilityBlock
            label="Ловкость"
            abbr="DEX"
            value={sheet.abilities.dexterity}
            readOnly={readOnly}
            onChange={(v) => updateAbility('dexterity', v)}
          />
          <AbilityBlock
            label="Телосложение"
            abbr="CON"
            value={sheet.abilities.constitution}
            readOnly={readOnly}
            onChange={(v) => updateAbility('constitution', v)}
          />
          <AbilityBlock
            label="Интеллект"
            abbr="INT"
            value={sheet.abilities.intelligence}
            readOnly={readOnly}
            onChange={(v) => updateAbility('intelligence', v)}
          />
          <AbilityBlock
            label="Мудрость"
            abbr="WIS"
            value={sheet.abilities.wisdom}
            readOnly={readOnly}
            onChange={(v) => updateAbility('wisdom', v)}
          />
          <AbilityBlock
            label="Харизма"
            abbr="CHA"
            value={sheet.abilities.charisma}
            readOnly={readOnly}
            onChange={(v) => updateAbility('charisma', v)}
          />
        </div>
      </section>

      {/* Бой */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">Бой</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SheetInput
            label="Класс брони (КБ)"
            value={sheet.armorClass}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ armorClass: Number(v) })}
          />
          <SheetInput
            label="Инициатива"
            value={sheet.initiative}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ initiative: Number(v) })}
          />
          <SheetInput
            label="Скорость"
            value={sheet.speed}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ speed: Number(v) })}
          />
          <SheetInput
            label="Кости хитов"
            value={sheet.hitDice}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ hitDice: v })}
          />
          <SheetInput
            label="Макс. ХП"
            value={sheet.maxHp}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ maxHp: Number(v) })}
          />
          <SheetInput
            label="Текущие ХП"
            value={sheet.currentHp}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ currentHp: Number(v) })}
          />
          <SheetInput
            label="Временные ХП"
            value={sheet.tempHp}
            type="number"
            readOnly={readOnly}
            onChange={(v) => onChange?.({ tempHp: Number(v) })}
          />
        </div>
      </section>

      {/* Спасброски и навыки */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Спасброски и навыки
        </h4>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-dnd-muted">Владение спасбросками</p>
            <div className="flex flex-wrap gap-2">
              {DND_SAVING_THROWS.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    sheet.savingThrows.includes(item)
                      ? 'border-dnd-purple bg-dnd-purple/20 text-white'
                      : 'border-dnd-border text-dnd-muted'
                  } ${readOnly ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={sheet.savingThrows.includes(item)}
                    onChange={() => toggleArrayItem('savingThrows', item)}
                    disabled={readOnly}
                    className="sr-only"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-dnd-muted">Владение навыками</p>
            <div className="flex flex-wrap gap-2">
              {DND_SKILLS.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    sheet.skills.includes(item)
                      ? 'border-dnd-gold bg-dnd-gold/15 text-dnd-gold'
                      : 'border-dnd-border text-dnd-muted'
                  } ${readOnly ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={sheet.skills.includes(item)}
                    onChange={() => toggleArrayItem('skills', item)}
                    disabled={readOnly}
                    className="sr-only"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Личность */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Личность
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <SheetTextarea
            label="Черты характера"
            value={sheet.personalityTraits}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ personalityTraits: v })}
          />
          <SheetTextarea
            label="Идеалы"
            value={sheet.ideals}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ ideals: v })}
          />
          <SheetTextarea
            label="Привязанности"
            value={sheet.bonds}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ bonds: v })}
          />
          <SheetTextarea
            label="Слабости"
            value={sheet.flaws}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ flaws: v })}
          />
        </div>
      </section>

      {/* Особенности, снаряжение, заклинания */}
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-5">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Особенности и снаряжение
        </h4>
        <div className="space-y-4">
          <SheetTextarea
            label="Особенности и черты"
            value={sheet.features}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ features: v })}
          />
          <SheetTextarea
            label="Снаряжение"
            value={sheet.equipment}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ equipment: v })}
          />
          <SheetTextarea
            label="Заклинания"
            value={sheet.spells}
            readOnly={readOnly}
            onChange={(v) => onChange?.({ spells: v })}
            rows={4}
          />
        </div>
      </section>
    </div>
  )
}
