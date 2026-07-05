import { NewsFeed } from '../modules/news'

export function NewsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Новости</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Лента публикаций с форматированием, ссылками, смайликами и вложениями
        </p>
      </div>

      <NewsFeed />
    </div>
  )
}
