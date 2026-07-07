import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const quickLinks = [
  {
    to: '/campaigns',
    title: 'Мои кампании',
    text: 'Создавайте партии, настраивайте анкету персонажа и держите состав игроков под рукой.',
  },
  {
    to: '/characters',
    title: 'Персонажи',
    text: 'Ведите листы, историю, заметки и антидостижения по каждому герою.',
  },
  {
    to: '/calendar',
    title: 'Календарь',
    text: 'Планируйте сессии и не теряйте даты встреч.',
  },
  {
    to: '/news',
    title: 'Новости',
    text: 'Публикуйте объявления для игроков и обсуждайте изменения между сессиями.',
  },
]

export function HomePage() {
  const { user } = useAuth()
  const displayName = user?.name || user?.email?.split('@')[0]

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-8">
        <p className="text-sm font-semibold uppercase text-dnd-gold">Панель DndCrime</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Добро пожаловать, {displayName}!
        </h2>
        <p className="mt-3 max-w-2xl text-dnd-muted">
          Здесь собирается всё, что нужно для партии: кампании, персонажи, календарь,
          новости, заметки и игровые чаты. Начните с кампании или откройте персонажа,
          которого готовите к следующей сессии.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-xl border border-dnd-border bg-dnd-card p-5 transition hover:border-dnd-gold/70 hover:bg-dnd-border/30"
          >
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-dnd-muted">{item.text}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
