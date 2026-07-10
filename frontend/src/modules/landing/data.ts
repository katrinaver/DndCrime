import type { Tip } from './fx/tipBurn'

/** Ротация советов мастера (порядок и нумерация из прототипа) */
export const TIPS: Tip[] = [
  { n: 20, q: '«Никогда не разделяйте партию. Особенно её заметки.»' },
  { n: 1, q: '«Натуральная единица — не провал, а сюжетный поворот.»' },
  { n: 7, q: '«Кубик виден всем. Последствия — тоже.»' },
  { n: 11, q: '«Снеки на столе продлевают жизнь партии на 1d4 часа.»' },
  { n: 13, q: '«Записывайте имена NPC сразу — иначе будет „тот лысый из таверны“.»' },
  { n: 8, q: '«Если план сработал с первого раза — вы что-то не заметили.»' },
  { n: 3, q: '«Инициатива уходит к тем, кто не опаздывает на сессию.»' },
  { n: 17, q: '«Карта не врёт. Врёт тот, кто её рисовал.»' },
]

export interface QuickLink {
  code: string
  title: string
  sub: string
}

/** Сетка «Быстрые переходы» в моке главной панели */
export const QUICK_LINKS: QuickLink[] = [
  { code: 'КМП', title: 'Кампании', sub: '3 активные' },
  { code: 'ПРС', title: 'Персонажи', sub: '7 листов' },
  { code: 'КАЛ', title: 'Календарь', sub: '2 сессии' },
  { code: 'НОВ', title: 'Новости', sub: '2 новых' },
  { code: 'ЗМТ', title: 'Заметки', sub: '12 записей' },
  { code: 'ПРФ', title: 'Профиль', sub: 'Google' },
]

export interface DieSpec {
  max: number
  label: string
  /** Размер внешней фигуры, px */
  size: number
  /** clip-path фигуры; null — скруглённый квадрат (d6) */
  clip: string | null
  /** Отступ внутренней (тёмной) фигуры от золотого канта, px */
  inset: number
  /** border-radius внешней/внутренней фигуры для d6 */
  radius?: { outer: number; inner: number }
  /** Сдвиг цифры вниз (у треугольника d4 центр масс выше геометрического) */
  numShift?: number
  fontSize: number
}

/** Полоса «Набор искателя»: параметры шести костей */
export const DICE: DieSpec[] = [
  { max: 4, label: 'd4', size: 44, clip: 'polygon(50% 0, 100% 100%, 0 100%)', inset: 3, numShift: 7, fontSize: 13 },
  { max: 6, label: 'd6', size: 41, clip: null, inset: 2, radius: { outer: 9, inner: 7 }, fontSize: 14 },
  { max: 8, label: 'd8', size: 46, clip: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)', inset: 2, fontSize: 14 },
  { max: 10, label: 'd10', size: 46, clip: 'polygon(50% 0, 96% 45%, 50% 100%, 4% 45%)', inset: 2, fontSize: 13 },
  { max: 12, label: 'd12', size: 47, clip: 'polygon(50% 2%, 98% 37%, 80% 98%, 20% 98%, 2% 37%)', inset: 2, fontSize: 14 },
  { max: 20, label: 'd20', size: 50, clip: 'polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)', inset: 2, fontSize: 15 },
]

export interface AbilityScore {
  code: string
  value: number
  mod: string
}

/** Характеристики Кассандры Вейл в моке листа персонажа */
export const ABILITY_SCORES: AbilityScore[] = [
  { code: 'СИЛ', value: 10, mod: '+0' },
  { code: 'ЛОВ', value: 16, mod: '+3' },
  { code: 'ТЕЛ', value: 14, mod: '+2' },
  { code: 'ИНТ', value: 12, mod: '+1' },
  { code: 'МДР', value: 13, mod: '+1' },
  { code: 'ХАР', value: 11, mod: '+0' },
]

/** Начальный статус под d20 до первого броска */
export const INITIAL_DIE_STATUS = 'Кликни — бросок. Потяни — раскрутится.'
