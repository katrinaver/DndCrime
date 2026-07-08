import type { CampaignAssetType } from './types'

export const assetTypeLabels: Record<CampaignAssetType, string> = {
  map: 'Карта',
  handout: 'Раздатка',
  note: 'Заметка',
  link: 'Ссылка',
  file: 'Файл',
}

export const assetTypeStyles: Record<CampaignAssetType, string> = {
  map: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  handout: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  note: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  link: 'border-dnd-purple/30 bg-dnd-purple/10 text-dnd-purple-hover',
  file: 'border-gray-500/30 bg-gray-500/10 text-gray-300',
}

export function inferAssetType(file: File): CampaignAssetType {
  if (file.type.startsWith('image/')) return 'map'
  if (file.type === 'application/pdf') return 'handout'
  return 'file'
}

export function assetActionLabel(type: CampaignAssetType) {
  return type === 'file' || type === 'handout' || type === 'map' ? 'Скачать' : 'Открыть'
}
