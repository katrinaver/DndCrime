export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(score: number): string {
  const mod = abilityModifier(score)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export const creationTypeLabels = {
  general: 'Общая анкета',
  campaign: 'Анкета кампании',
  classic: 'Лист D&D 5e',
} as const
