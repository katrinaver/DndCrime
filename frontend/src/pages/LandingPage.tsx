import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    title: 'Кампании',
    text: 'Храните описание партии, место встреч, состав игроков и анкету персонажа.',
  },
  {
    title: 'Персонажи',
    text: 'Ведите листы персонажей, заметки, антидостижения и связь с кампанией.',
  },
  {
    title: 'Коммуникация',
    text: 'Обсуждайте сессии в чатах, публикуйте новости и ставьте события в календарь.',
  },
]

const previewEvents = [
  { label: 'Сегодня', title: 'Подготовка к сессии', meta: 'Проклятие Страда' },
  { label: 'Сб 19:00', title: 'Сессия #12', meta: 'Онлайн, 5 игроков' },
  { label: 'Вс', title: 'Обновить анкеты', meta: '2 персонажа ждут проверки' },
]

export function LandingPage() {
  const { user } = useAuth()
  const appLink = user ? '/home' : '/login'
  const ctaLabel = 'Войти'

  return (
    <main className="min-h-screen bg-dnd-dark text-gray-100">
      <header className="border-b border-dnd-border bg-dnd-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold text-dnd-gold">
            DndCrime
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to={appLink}
              className="rounded-lg border border-dnd-gold/60 px-4 py-2 font-medium text-dnd-gold transition hover:border-dnd-gold-hover hover:text-dnd-gold-hover"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-dnd-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_420px] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase text-dnd-gold">
              Портал для офлайн D&amp;D партий
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              DndCrime собирает кампании, персонажей и подготовку к сессиям в одном месте.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-dnd-muted sm:text-lg">
              Мастеру проще держать порядок в партии, а игрокам — быстро найти чат, календарь,
              лист персонажа и свежие новости по игре.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={appLink}
                className="inline-flex items-center justify-center rounded-lg bg-dnd-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-dnd-purple-hover"
              >
                {ctaLabel}
              </Link>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center justify-center rounded-lg border border-dnd-border px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-dnd-gold hover:text-dnd-gold"
              >
                Как хранятся данные
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-dnd-border bg-dnd-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dnd-border pb-4">
              <div>
                <p className="text-xs uppercase text-dnd-muted">Следующая партия</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Проклятие Страда</h2>
              </div>
              <span className="rounded-full bg-dnd-purple/20 px-3 py-1 text-xs font-medium text-dnd-purple-hover">
                Активна
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-dnd-border bg-dnd-dark p-3">
                <p className="text-xl font-semibold text-white">5</p>
                <p className="mt-1 text-xs text-dnd-muted">игроков</p>
              </div>
              <div className="rounded-lg border border-dnd-border bg-dnd-dark p-3">
                <p className="text-xl font-semibold text-white">12</p>
                <p className="mt-1 text-xs text-dnd-muted">сессий</p>
              </div>
              <div className="rounded-lg border border-dnd-border bg-dnd-dark p-3">
                <p className="text-xl font-semibold text-white">3</p>
                <p className="mt-1 text-xs text-dnd-muted">заметки</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {previewEvents.map((event) => (
                <div key={event.title} className="rounded-lg border border-dnd-border bg-dnd-dark px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="mt-1 text-xs text-dnd-muted">{event.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-dnd-gold/15 px-2 py-1 text-xs text-dnd-gold">
                      {event.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-dnd-border bg-dnd-card p-5">
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-dnd-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-dnd-border bg-dnd-card/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-dnd-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 DndCrime</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-policy" className="text-dnd-gold hover:text-dnd-gold-hover">
              Политика конфиденциальности
            </Link>
            <Link to="/terms-of-service" className="text-dnd-gold hover:text-dnd-gold-hover">
              Условия использования
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
