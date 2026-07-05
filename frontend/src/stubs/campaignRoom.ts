/** Офлайн-заглушки чата и ассетов кампании — не подключены к UI. */

export const STUB_ANTI_ACHIEVEMENT_SUGGESTIONS = [
  'Уронил факел в собственный инвентарь',
  'Попытался убедить дракона пожертвовать сокровища',
  'Забыл, зачем пришли в подземелье',
  'Согласился на «безобидную» сделку с неизвестным',
  'Критически провалил проверку Скрытности в таверне',
  'Использовал Огненный шар в узком коридоре',
] as const

export interface StubCampaignAsset {
  id: string
  title: string
  type: 'map' | 'handout' | 'note' | 'link'
  description: string
}

export interface StubCampaignChatMessage {
  id: string
  author: string
  text: string
  time: string
}

export const stubCampaignAssets: Record<string, StubCampaignAsset[]> = {
  '1': [
    {
      id: 'a1',
      title: 'Карта Баровии',
      type: 'map',
      description: 'Обзорная карта проклятых земель',
    },
    {
      id: 'a2',
      title: 'Письмо от Страда',
      type: 'handout',
      description: 'Приглашение в замок Равенлофт',
    },
    {
      id: 'a3',
      title: 'Домашние правила хоррора',
      type: 'note',
      description: 'Табу, механика страха и безумия',
    },
  ],
  '2': [
    {
      id: 'b1',
      title: 'План таверны',
      type: 'map',
      description: 'Этажи «Красного Дракона»',
    },
    {
      id: 'b2',
      title: 'Список городских фракций',
      type: 'note',
      description: 'Гильдии, стража, преступники',
    },
  ],
}

export const stubCampaignChat: Record<string, StubCampaignChatMessage[]> = {
  '1': [
    { id: 'c1', author: 'Алексей', text: 'Напоминаю: сессия в субботу в 19:00', time: '10:30' },
    { id: 'c2', author: 'Мария', text: 'Эларион готов к визиту в замок', time: '11:05' },
    { id: 'c3', author: 'Игорь', text: 'Торвин принесет эль для всех', time: '12:20' },
  ],
  '2': [
    { id: 'd1', author: 'Мария', text: 'Кто-нибудь видел бандитов у склада?', time: '09:15' },
    { id: 'd2', author: 'Игорь', text: 'Торвин патрулирует двор', time: '09:40' },
  ],
}
