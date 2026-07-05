import { FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { isRichTextEmpty, RichTextEditor } from '../../components/rich-text'
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
  const [newPostHtml, setNewPostHtml] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function handlePublish(e: FormEvent) {
    e.preventDefault()
    if (isRichTextEmpty(newPostHtml)) return

    setSubmitting(true)
    try {
      await publishPost(newPostHtml)
      setNewPostHtml('')
      setEditorKey((key) => key + 1)
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
        className="rounded-xl border border-dnd-border bg-dnd-card p-5 shadow-lg shadow-black/10"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Новая публикация</h3>
            <p className="mt-1 text-sm text-dnd-muted">
              Форматирование, ссылки, смайлики и вложения до 2 МБ
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-dnd-border bg-dnd-dark px-3 py-1 text-xs text-dnd-muted">
            {currentUser}
          </span>
        </div>

        <RichTextEditor
          key={editorKey}
          placeholder="Что нового в ваших кампаниях?"
          onChange={setNewPostHtml}
        />

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            type="submit"
            className="!w-auto px-6"
            disabled={isRichTextEmpty(newPostHtml)}
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
        <div className="rounded-xl border border-dashed border-dnd-border bg-dnd-card/40 px-6 py-12 text-center">
          <p className="text-sm text-dnd-muted">Новостей пока нет — напишите первую публикацию</p>
        </div>
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
