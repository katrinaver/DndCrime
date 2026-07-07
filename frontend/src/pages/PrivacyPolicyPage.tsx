import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-dnd-dark px-4 py-12 text-gray-200">
      <article className="mx-auto max-w-3xl rounded-xl border border-dnd-border bg-dnd-card p-8">
        <Link to="/" className="text-sm font-medium text-dnd-gold hover:text-dnd-gold-hover">
          DndCrime
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-white">Политика конфиденциальности</h1>
        <p className="mt-2 text-sm text-dnd-muted">Обновлено: 7 июля 2026</p>

        <div className="mt-8 space-y-5 text-sm leading-6">
          <p>
            DndCrime использует вход через Google. Мы сохраняем минимальные
            данные, необходимые для работы портала: идентификатор Google-аккаунта, email,
            отображаемое имя и URL аватара, если Google передаёт его приложению.
          </p>
          <p>
            Также мы сохраняем данные, которые вы создаёте внутри приложения: профиль,
            кампании, персонажей, заметки, сообщения в чатах, новости, события календаря,
            уведомления и загруженные файлы.
          </p>
          <p>
            Мы не храним пароли Google. Проверка личности выполняется на стороне Google,
            а после успешного входа DndCrime выдаёт собственный токен приложения для работы
            с закрытыми разделами сайта.
          </p>
          <p>
            Данные приложения хранятся в MySQL, а загруженные файлы — в S3-совместимом
            объектном хранилище. Доступ к этим данным ограничен операторами приложения и
            инфраструктурой, необходимой для работы сервиса.
          </p>
          <p>
            Чтобы запросить удаление или исправление своих данных, свяжитесь с оператором
            DndCrime через канал, по которому вы получили доступ к сервису.
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
