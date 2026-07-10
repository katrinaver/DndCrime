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
  /** Сторона svg-бокса, px (viewBox всегда 0 0 60 60) */
  size: number
  strokeWidth: number
  /** Прозрачность контура; у d20 контур полностью непрозрачный */
  outlineOpacity?: number
  shape:
    | { kind: 'polygon'; points: string }
    | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  /** Горизонтальная «ось» ромбов d8/d10 */
  midline?: { x1: number; y1: number; x2: number; y2: number }
  /** Внутренний контур-грань d20 */
  inner?: string
  /** Узлы-точки в вершинах */
  dots: Array<[number, number]>
  dotR: number
  /** y цифры (x всегда 30) */
  numY: number
  fontSize: number
}

/** Полоса «Набор искателя»: контурные кости, геометрия из прототипа */
export const DICE: DieSpec[] = [
  {
    max: 4, label: 'd4', size: 48, strokeWidth: 1.4, outlineOpacity: 0.85,
    shape: { kind: 'polygon', points: '30,7 53,51 7,51' },
    dots: [[30, 7], [53, 51], [7, 51]], dotR: 1.6, numY: 40, fontSize: 15,
  },
  {
    max: 6, label: 'd6', size: 48, strokeWidth: 1.4, outlineOpacity: 0.85,
    shape: { kind: 'rect', x: 8, y: 8, w: 44, h: 44, rx: 9 },
    dots: [[8, 8], [52, 8], [52, 52], [8, 52]], dotR: 1.6, numY: 31, fontSize: 18,
  },
  {
    max: 8, label: 'd8', size: 48, strokeWidth: 1.4, outlineOpacity: 0.85,
    shape: { kind: 'polygon', points: '30,6 54,30 30,54 6,30' },
    midline: { x1: 6, y1: 30, x2: 54, y2: 30 },
    dots: [[30, 6], [30, 54]], dotR: 1.6, numY: 32, fontSize: 17,
  },
  {
    max: 10, label: 'd10', size: 48, strokeWidth: 1.4, outlineOpacity: 0.85,
    shape: { kind: 'polygon', points: '30,6 52,28 30,54 8,28' },
    midline: { x1: 8, y1: 28, x2: 52, y2: 28 },
    dots: [[30, 6], [30, 54]], dotR: 1.6, numY: 30, fontSize: 14,
  },
  {
    max: 12, label: 'd12', size: 48, strokeWidth: 1.4, outlineOpacity: 0.85,
    shape: { kind: 'polygon', points: '30,6 54,24 45,53 15,53 6,24' },
    dots: [[30, 6], [54, 24], [6, 24]], dotR: 1.6, numY: 33, fontSize: 14,
  },
  {
    max: 20, label: 'd20', size: 54, strokeWidth: 1.5,
    shape: { kind: 'polygon', points: '30,5 52,17 52,43 30,55 8,43 8,17' },
    inner: '20,22 40,22 30,40',
    dots: [[30, 5], [52, 17], [52, 43], [30, 55], [8, 43], [8, 17]], dotR: 1.7, numY: 31, fontSize: 15,
  },
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
