import type { CampaignFormConfig } from '../modules/characters/types'

/** Dev-заглушки — в приложении анкета загружается с GET /api/campaigns/:id/questionnaire */
export const campaignFormConfigs: CampaignFormConfig[] = [
  {
    campaignId: '1',
    title: 'Анкета: Проклятие Страда',
    description: 'Готика, хоррор и политика Баровии.',
    fields: [
      {
        id: 'connection',
        label: 'Связь с Баровией',
        type: 'textarea',
        placeholder: 'Почему ваш персонаж оказался в проклятых землях?',
      },
      {
        id: 'fear',
        label: 'Главный страх',
        type: 'text',
        placeholder: 'Чего боится ваш герой?',
      },
    ],
  },
  {
    campaignId: '2',
    title: 'Анкета: Таверна у Красного Дракона',
    description: 'Городское приключение с интригами.',
    fields: [
      {
        id: 'guild',
        label: 'Связь с гильдией',
        type: 'text',
        placeholder: 'Гильдия, культ, стража, преступники...',
      },
      {
        id: 'secret',
        label: 'Тайна персонажа',
        type: 'textarea',
        placeholder: 'Секрет, который может всплыть в кампании',
      },
    ],
  },
  {
    campaignId: '3',
    title: 'Анкета: Подземелье Чёрного Змея',
    description: 'Классическое подземелье для группы искателей приключений.',
    fields: [
      {
        id: 'motivation',
        label: 'Зачем лезете в подземелье',
        type: 'textarea',
        placeholder: 'Золото, слава, спасение, знания?',
      },
      {
        id: 'fear',
        label: 'Чего боитесь больше всего',
        type: 'text',
        placeholder: 'Темнота, монстры, предательство...',
      },
    ],
  },
  {
    campaignId: '4',
    title: 'Анкета: Остров Туманов',
    description: 'Морское приключение на затерянном острове.',
    fields: [
      {
        id: 'sea',
        label: 'Опыт на море',
        type: 'text',
        placeholder: 'Моряк, пассажир, первый раз на корабле...',
      },
      {
        id: 'goal',
        label: 'Цель на острове',
        type: 'textarea',
        placeholder: 'Зачем вы здесь и чего хотите достичь?',
      },
    ],
  },
]

export function getCampaignFormConfig(campaignId: string): CampaignFormConfig | undefined {
  return campaignFormConfigs.find((c) => c.campaignId === campaignId)
}
