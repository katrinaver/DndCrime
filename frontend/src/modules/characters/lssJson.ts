/**
 * Импорт/экспорт персонажа в формате Long Story Short (longstoryshort.app).
 *
 * Файл LSS — это обёртка `{ jsonType: 'character', version: '2', data: '<json-строка>' }`,
 * где `data` содержит лист персонажа: статы, навыки, hp и текстовые блоки
 * в виде HTML-строк либо ProseMirror-документов.
 */
import { emptyCharacterSheet } from './characterData'
import type { AbilityScores, CharacterSheet } from './types'
import { abilityModifier } from './utils'

type Dict = Record<string, unknown>

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asDict(value: unknown): Dict {
  return isDict(value) ? value : {}
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback
}

const ABILITY_TABLE: Array<{ key: string; ability: keyof AbilityScores; label: string }> = [
  { key: 'str', ability: 'strength', label: 'Сила' },
  { key: 'dex', ability: 'dexterity', label: 'Ловкость' },
  { key: 'con', ability: 'constitution', label: 'Телосложение' },
  { key: 'int', ability: 'intelligence', label: 'Интеллект' },
  { key: 'wis', ability: 'wisdom', label: 'Мудрость' },
  { key: 'cha', ability: 'charisma', label: 'Харизма' },
]

/** Навыки: ключ LSS → наша метка из DND_SKILLS (метки местами расходятся). */
const SKILL_TABLE: Array<{ key: string; baseStat: string; lssLabel: string; ourLabel: string }> = [
  { key: 'athletics', baseStat: 'str', lssLabel: 'Атлетика', ourLabel: 'Атлетика' },
  { key: 'acrobatics', baseStat: 'dex', lssLabel: 'Акробатика', ourLabel: 'Акробатика' },
  { key: 'sleight of hand', baseStat: 'dex', lssLabel: 'Ловкость рук', ourLabel: 'Ловкость рук' },
  { key: 'stealth', baseStat: 'dex', lssLabel: 'Скрытность', ourLabel: 'Скрытность' },
  { key: 'arcana', baseStat: 'int', lssLabel: 'Магия', ourLabel: 'Магия' },
  { key: 'history', baseStat: 'int', lssLabel: 'История', ourLabel: 'История' },
  { key: 'investigation', baseStat: 'int', lssLabel: 'Анализ', ourLabel: 'Анализ' },
  { key: 'nature', baseStat: 'int', lssLabel: 'Природа', ourLabel: 'Природа' },
  { key: 'religion', baseStat: 'int', lssLabel: 'Религия', ourLabel: 'Религия' },
  { key: 'perception', baseStat: 'wis', lssLabel: 'Восприятие', ourLabel: 'Внимательность' },
  { key: 'survival', baseStat: 'wis', lssLabel: 'Выживание', ourLabel: 'Выживание' },
  { key: 'medicine', baseStat: 'wis', lssLabel: 'Медицина', ourLabel: 'Медицина' },
  { key: 'insight', baseStat: 'wis', lssLabel: 'Проницательность', ourLabel: 'Проницательность' },
  { key: 'animal handling', baseStat: 'wis', lssLabel: 'Уход за животными', ourLabel: 'Животные' },
  { key: 'intimidation', baseStat: 'cha', lssLabel: 'Запугивание', ourLabel: 'Запугивание' },
  { key: 'performance', baseStat: 'cha', lssLabel: 'Выступление', ourLabel: 'Выступление' },
  { key: 'deception', baseStat: 'cha', lssLabel: 'Обман', ourLabel: 'Обман' },
  { key: 'persuasion', baseStat: 'cha', lssLabel: 'Убеждение', ourLabel: 'Убеждение' },
]

const COIN_LABELS: Array<{ key: string; label: string }> = [
  { key: 'pp', label: 'пм' },
  { key: 'gp', label: 'зм' },
  { key: 'ep', label: 'эм' },
  { key: 'sp', label: 'см' },
  { key: 'cp', label: 'мм' },
]

// ---------------------------------------------------------------------------
// Извлечение текста из блоков LSS (HTML-строка или ProseMirror-документ)
// ---------------------------------------------------------------------------

function decodeHtmlEntities(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html')
  return doc.documentElement.textContent ?? ''
}

function htmlToPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  return decodeHtmlEntities(withBreaks)
}

const PM_BLOCK_TYPES = new Set(['paragraph', 'heading', 'listItem', 'blockquote'])

function proseMirrorToPlainText(node: Dict): string {
  if (node.type === 'text') return asString(node.text)
  const content = Array.isArray(node.content) ? node.content : []
  const inner = content.map((child) => proseMirrorToPlainText(asDict(child))).join('')
  return PM_BLOCK_TYPES.has(asString(node.type)) ? `${inner}\n` : inner
}

function collapseBlankLines(text: string): string {
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Текст из блока вида `{ value: { data: <html | doc> } }`. */
function lssBlockToPlainText(block: unknown): string {
  const value = asDict(asDict(block).value)
  const data = 'data' in value ? value.data : asDict(block).data
  if (typeof data === 'string') return collapseBlankLines(htmlToPlainText(data))
  if (isDict(data)) return collapseBlankLines(proseMirrorToPlainText(data))
  return ''
}

// ---------------------------------------------------------------------------
// Импорт: JSON Long Story Short → CharacterSheet
// ---------------------------------------------------------------------------

function joinSections(sections: Array<[title: string, content: string]>): string {
  return sections
    .filter(([, content]) => content.trim() !== '')
    .map(([title, content]) => (title ? `${title}:\n${content}` : content))
    .join('\n\n')
}

export function parseLssJson(text: string): CharacterSheet {
  let outer: unknown
  try {
    outer = JSON.parse(text)
  } catch {
    throw new Error('Файл не является корректным JSON')
  }

  const wrapper = asDict(outer)
  let innerRaw: unknown = wrapper
  if (typeof wrapper.data === 'string') {
    try {
      innerRaw = JSON.parse(wrapper.data)
    } catch {
      throw new Error('Не удалось прочитать данные персонажа (поле data)')
    }
  }
  const inner = asDict(innerRaw)

  if (asString(wrapper.jsonType) !== 'character' && asString(inner.jsonType) !== 'character') {
    throw new Error('Файл не похож на экспорт персонажа Long Story Short')
  }

  const sheet = emptyCharacterSheet()

  sheet.name = asString(asDict(inner.name).value).trim() || 'Безымянный герой'

  const info = asDict(inner.info)
  const infoValue = (key: string) => asString(asDict(info[key]).value).trim()

  const charClass = infoValue('charClass')
  const subclass = infoValue('charSubclass')
  sheet.className = subclass ? `${charClass} (${subclass})` : charClass
  sheet.level = Math.max(1, asNumber(asDict(info.level).value, 1))
  sheet.species = infoValue('race')
  sheet.background = infoValue('background')
  sheet.playerName = infoValue('playerName')
  sheet.alignment = infoValue('alignment')
  sheet.experiencePoints = asNumber(asDict(info.experience).value)
  sheet.proficiencyBonus = asNumber(inner.proficiency, sheet.proficiencyBonus)

  const stats = asDict(inner.stats)
  for (const { key, ability } of ABILITY_TABLE) {
    sheet.abilities[ability] = asNumber(asDict(stats[key]).score, 10)
  }
  sheet.initiative = abilityModifier(sheet.abilities.dexterity)

  const saves = asDict(inner.saves)
  sheet.savingThrows = ABILITY_TABLE.filter(({ key }) => {
    const isProf = asDict(saves[key]).isProf
    return isProf === true || asNumber(isProf) >= 1
  }).map(({ label }) => label)

  const skills = asDict(inner.skills)
  sheet.skills = SKILL_TABLE.filter(({ key }) => {
    const isProf = asDict(skills[key]).isProf
    return isProf === true || asNumber(isProf) >= 1
  }).map(({ ourLabel }) => ourLabel)

  const vitality = asDict(inner.vitality)
  const vitalityValue = (key: string) => asDict(vitality[key]).value
  sheet.maxHp = asNumber(vitalityValue('hp-max'), sheet.maxHp) + asNumber(vitalityValue('hp-max-bonus'))
  sheet.currentHp = asNumber(vitalityValue('hp-current'), sheet.maxHp)
  sheet.tempHp = asNumber(vitalityValue('hp-temp'))
  sheet.armorClass = asNumber(vitalityValue('ac'), sheet.armorClass)
  sheet.speed = asNumber(vitalityValue('speed'), sheet.speed)
  const hitDie = asString(vitalityValue('hit-die')).trim()
  if (hitDie) {
    sheet.hitDice = /^\d/.test(hitDie) ? hitDie : `${sheet.level}${hitDie}`
  }

  const textBlocks = asDict(inner.text)
  const textBlock = (key: string) => lssBlockToPlainText(textBlocks[key])

  sheet.personalityTraits = textBlock('personality')
  sheet.ideals = textBlock('ideals')
  sheet.bonds = textBlock('bonds')
  sheet.flaws = textBlock('flaws')

  const notes = Array.from({ length: 6 }, (_, i) => textBlock(`notes-${i + 1}`))
    .filter((note) => note !== '')
    .join('\n\n')
  sheet.features = joinSections([
    ['', textBlock('traits')],
    ['Умение предыстории', textBlock('features')],
    ['Владения и языки', textBlock('prof')],
    ['Предыстория', textBlock('background')],
    ['Союзники и организации', textBlock('allies')],
    ['Заметки', notes],
  ])

  const weapons = (Array.isArray(inner.weaponsList) ? inner.weaponsList : [])
    .map((weapon) => {
      const w = asDict(weapon)
      const name = asString(asDict(w.name).value).trim()
      if (!name) return ''
      const mod = asString(asDict(w.mod).value).trim()
      const dmg = asString(asDict(w.dmg).value).trim()
      const notesText = asString(asDict(w.notes).value).trim()
      const details = [mod, dmg].filter(Boolean).join(', ')
      return `${name}${details ? `: ${details}` : ''}${notesText ? ` — ${notesText}` : ''}`
    })
    .filter(Boolean)
    .join('\n')

  const coins = asDict(inner.coins)
  const money = COIN_LABELS.map(({ key, label }) => {
    const amount = asNumber(asDict(coins[key]).value)
    return amount > 0 ? `${amount} ${label}` : ''
  })
    .filter(Boolean)
    .join(', ')

  sheet.equipment = joinSections([
    ['', textBlock('equipment')],
    ['Оружие', weapons],
    ['Монеты', money],
  ])

  const spellsInfo = asDict(inner.spellsInfo)
  const spellSave = asString(asDict(spellsInfo.save).customModifier).trim()
  const spellMod = asString(asDict(spellsInfo.mod).customModifier).trim()
  const spellSlots = asDict(inner.spells)
  const slots = Array.from({ length: 9 }, (_, i) => {
    const count = asNumber(asDict(spellSlots[`slots-${i + 1}`]).value)
    return count > 0 ? `${i + 1} ур. — ${count}` : ''
  })
    .filter(Boolean)
    .join(', ')

  sheet.spells = joinSections([
    ['Сл спасброска', spellSave],
    ['Бонус атаки заклинанием', spellMod],
    ['Ячейки заклинаний', slots],
    ['Атаки', textBlock('attacks')],
    ['Заговоры', textBlock('spells-level-0')],
    ...Array.from({ length: 9 }, (_, i): [string, string] => [
      `${i + 1} уровень`,
      textBlock(`spells-level-${i + 1}`),
    ]),
  ])

  // Собственный экспорт DndCrime: текстовые поля лежат в блоках как есть,
  // без разбиения по секциям — берём их без сборных заголовков.
  if (asString(inner.exporter) === 'dndcrime') {
    sheet.features = textBlock('traits')
    sheet.equipment = textBlock('equipment')
    sheet.spells = textBlock('spells-level-0')
  }

  const avatar = asString(asDict(inner.avatar).jpeg).trim()
  if (avatar.startsWith('http')) {
    sheet.avatarFileName = avatar
  }

  sheet.creationType = 'classic'
  return sheet
}

// ---------------------------------------------------------------------------
// Экспорт: CharacterSheet → JSON Long Story Short
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function plainTextToHtmlBlock(text: string): { value: { data: string } } {
  const html = text
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
  return { value: { data: text.trim() ? html : '' } }
}

export function buildLssJson(sheet: CharacterSheet): string {
  const level = sheet.level || 1
  const classMatch = /^(.*?)\s*\((.+)\)\s*$/.exec(sheet.className)
  const charClass = classMatch ? classMatch[1] : sheet.className
  const subclass = classMatch ? classMatch[2] : ''
  const hitDieMatch = /d\d+/.exec(sheet.hitDice)

  const stats: Dict = {}
  const saves: Dict = {}
  for (const { key, ability, label } of ABILITY_TABLE) {
    const score = sheet.abilities[ability]
    stats[key] = { name: key, score, modifier: abilityModifier(score), label, check: 0 }
    saves[key] = { name: key, isProf: sheet.savingThrows.includes(label), bonus: 0 }
  }

  const skills: Dict = {}
  for (const { key, baseStat, lssLabel, ourLabel } of SKILL_TABLE) {
    skills[key] = {
      baseStat,
      name: key,
      label: lssLabel,
      isProf: sheet.skills.includes(ourLabel) ? 1 : 0,
    }
  }

  const inner: Dict = {
    jsonType: 'character',
    template: 'default',
    exporter: 'dndcrime',
    name: { value: sheet.name },
    info: {
      charClass: { name: 'charClass', value: charClass, label: 'класс и уровень' },
      charSubclass: { name: 'charSubclass', value: subclass },
      level: { name: 'level', value: level, label: 'уровень' },
      background: { name: 'background', value: sheet.background, label: 'предыстория' },
      playerName: { name: 'playerName', value: sheet.playerName, label: 'имя игрока' },
      race: { name: 'race', value: sheet.species, label: 'раса' },
      alignment: { name: 'alignment', value: sheet.alignment, label: 'мировоззрение' },
      experience: { name: 'experience', value: sheet.experiencePoints, label: 'опыт' },
    },
    subInfo: {},
    spellsInfo: {},
    spells: {},
    spellsPact: {},
    proficiency: sheet.proficiencyBonus,
    stats,
    saves,
    skills,
    vitality: {
      'hp-dice-current': { value: level },
      'hp-max': { value: sheet.maxHp },
      'hp-current': { value: sheet.currentHp },
      'hp-temp': { value: sheet.tempHp },
      isDying: false,
      deathFails: 0,
      deathSuccesses: 0,
      ac: { value: sheet.armorClass },
      speed: { value: sheet.speed },
      'hit-die': { value: hitDieMatch ? hitDieMatch[0] : 'd8' },
      'hp-max-bonus': { value: 0 },
    },
    weaponsList: [],
    weapons: {},
    text: {
      traits: plainTextToHtmlBlock(sheet.features),
      personality: plainTextToHtmlBlock(sheet.personalityTraits),
      ideals: plainTextToHtmlBlock(sheet.ideals),
      bonds: plainTextToHtmlBlock(sheet.bonds),
      flaws: plainTextToHtmlBlock(sheet.flaws),
      equipment: plainTextToHtmlBlock(sheet.equipment),
      'spells-level-0': plainTextToHtmlBlock(sheet.spells),
    },
    coins: {
      pp: { value: 0 },
      gp: { value: 0 },
      ep: { value: 0 },
      sp: { value: 0 },
      cp: { value: 0 },
      total: { value: 0 },
    },
    createdAt: new Date().toISOString(),
  }

  if (sheet.avatarFileName?.startsWith('http')) {
    inner.avatar = { jpeg: sheet.avatarFileName, webp: sheet.avatarFileName }
  }

  const wrapper = {
    tags: [],
    disabledBlocks: {
      'info-left': [],
      'info-right': [],
      'subinfo-left': [],
      'subinfo-right': [],
      'notes-left': [],
      'notes-right': [],
    },
    edition: '2014',
    spells: { mode: 'text', prepared: [], book: [], edition: '2024' },
    data: JSON.stringify(inner),
    jsonType: 'character',
    version: '2',
  }

  return JSON.stringify(wrapper)
}

export function downloadCharacterJson(sheet: CharacterSheet): void {
  const safeName = sheet.name.replace(/[\\/:*?"<>|]/g, '').trim() || 'Персонаж'
  const blob = new Blob([buildLssJson(sheet)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName} — DndCrime.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
