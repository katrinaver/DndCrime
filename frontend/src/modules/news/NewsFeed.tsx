import { FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useNewsStore } from '../../store/newsStore'
import { NewsPostCard } from './NewsPostCard'

export function NewsFeed() {
  const { user } = useAuth()
  const posts = useNewsStore((s) => s.posts)
  const loading = useNewsStore((s) => s.loading)
  const error = useNewsStore((s) => s.error)
  const publishPost = useNewsStore((s) => s.publishPost)
  const addComment = useNewsStore((s) => s.addComment)

  const currentUser = user?.email?.split('@')[0] ?? 'Игрок'
  const [newPostText, setNewPostText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handlePublish(e: FormEvent) {
    e.preventDefault()
    const trimmed = newPostText.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      await publishPost(trimmed)
      setNewPostText('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddComment(postId: string, content: string) {
    await addComment(postId, content)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handlePublish}
        className="rounded-xl border border-dnd-border bg-dnd-card p-5"
      >
        <h3 className="mb-3 text-sm font-medium text-white">Новая публикация</h3>
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Что нового в ваших кампаниях?"
          rows={3}
          className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-xs text-dnd-muted">Публикуете как {currentUser}</span>
          <Button
            type="submit"
            className="!w-auto px-6"
            disabled={!newPostText.trim()}
            loading={submitting}
          >
            Опубликовать
          </Button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading && posts.length === 0 ? (
        <p className="text-center text-sm text-dnd-muted">Загрузка новостей…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-sm text-dnd-muted">Новостей пока нет</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <NewsPostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
