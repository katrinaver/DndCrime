import type { CampaignFormConfig } from '../modules/characters/types'

export const campaignFormConfigs: CampaignFormConfig[] = [
  {
    campaignId: '1',
    title: 'Анкета: Проклятие Страда',
    description: 'Готика, хоррор и политика Баровии. Мастер собирает персонажей под атмосферу кампании.',
    fields: [
      {
        id: 'connection',
        label: 'Связь с Баровией или Страдом',
        type: 'textarea',
        placeholder: 'Почему ваш персонаж оказался в проклятых землях?',
      },
      {
        id: 'fear',
        label: 'Главный страх персонажа',
        type: 'text',
        placeholder: 'Чего боится ваш герой?',
      },
      {
        id: 'secret',
        label: 'Тайна персонажа',
        type: 'textarea',
        placeholder: 'Секрет, который может всплыть в кампании',
      },
      {
        id: 'ally',
        label: 'Потенциальный союзник в партии',
        type: 'text',
        placeholder: 'С кем из группы персонаж может сблизиться?',
      },
    ],
  },
  {
    campaignId: '2',
    title: 'Анкета: Таверна у Красного Дракона',
    description: 'Городское приключение с интригами, торговлей и социальными столкновениями.',
    fields: [
      {
        id: 'tavern',
        label: 'Отношение к таверне',
        type: 'select',
        options: ['Постоянный гость', 'Работник', 'Конкурент', 'Новичок в городе'],
      },
      {
        id: 'faction',
        label: 'Связь с городской фракцией',
        type: 'text',
        placeholder: 'Гильдия, культ, стража, преступники...',
      },
      {
        id: 'goal',
        label: 'Личная цель в городе',
        type: 'textarea',
        placeholder: 'Зачем персонаж здесь и чего хочет достичь?',
      },
    ],
  },
  {
    campaignId: '3',
    title: 'Анкета: Поход в Подгорье',
    description: 'Классический поход в подземелье — выживание, исследование и добыча.',
    fields: [
      {
        id: 'dungeon',
        label: 'Опыт подземелий',
        type: 'select',
        options: ['Первый поход', 'Был в паре подземелий', 'Опытный исследователь'],
      },
      {
        id: 'motivation',
        label: 'Мотивация для похода',
        type: 'textarea',
        placeholder: 'Золото, слава, спасение, знания?',
      },
      {
        id: 'loadout',
        label: 'Предпочитаемое снаряжение',
        type: 'text',
        placeholder: 'Факелы, верёвка, зелья...',
      },
    ],
  },
]

export function getCampaignFormConfig(campaignId: string): CampaignFormConfig | undefined {
  return campaignFormConfigs.find((c) => c.campaignId === campaignId)
}
