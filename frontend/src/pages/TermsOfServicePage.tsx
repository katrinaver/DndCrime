import { Link } from 'react-router-dom'

export function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-dnd-dark px-4 py-12 text-gray-200">
      <article className="mx-auto max-w-3xl rounded-xl border border-dnd-border bg-dnd-card p-8">
        <Link to="/" className="text-sm font-medium text-dnd-gold hover:text-dnd-gold-hover">
          DndCrime
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">Условия использования</h1>
        <p className="mt-2 text-sm text-dnd-muted">Обновлено: 7 июля 2026</p>

        <div className="mt-8 space-y-5 text-sm leading-6">
          <p>
            DndCrime — частный портал для организации настольных ролевых игр. Используя
            сервис, вы соглашаетесь применять его только для законной и добросовестной
            активности.
          </p>
          <p>
            Вы отвечаете за материалы, которые создаёте или загружаете: описания кампаний,
            листы персонажей, заметки, сообщения, изображения, вложения и данные профиля.
          </p>
          <p>
            Доступ может быть ограничен, приостановлен или удалён, если сервис используется
            не по назначению, нарушает правила или проекту требуется техническое обслуживание.
          </p>
          <p>
            Сервис предоставляется «как есть», без гарантий доступности, сохранности данных
            или наличия конкретных функций. Храните собственные копии важных материалов
            кампаний.
          </p>
          <p>
            Вход через Google используется только для авторизации. DndCrime не запрашивает и не
            хранит ваш пароль Google.
          </p>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-dnd-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-dnd-purple-hover"
        >
          На главную
        </Link>
      </article>
    </main>
  )
}
