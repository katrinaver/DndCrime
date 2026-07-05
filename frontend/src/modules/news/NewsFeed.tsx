import { FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { stubNewsPosts } from './newsData'
import { NewsPostCard } from './NewsPostCard'
import { generateId } from './utils'
import type { NewsPost } from './types'

export function NewsFeed() {
  const { user } = useAuth()
  const currentUser = user?.email?.split('@')[0] ?? 'Игрок'

  const [posts, setPosts] = useState<NewsPost[]>(() =>
    [...stubNewsPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )
  const [newPostText, setNewPostText] = useState('')

  function handlePublish(e: FormEvent) {
    e.preventDefault()
    const trimmed = newPostText.trim()
    if (!trimmed) return

    const post: NewsPost = {
      id: generateId(),
      author: currentUser,
      content: trimmed,
      createdAt: new Date().toISOString(),
      comments: [],
    }

    setPosts((prev) => [post, ...prev])
    setNewPostText('')
  }

  function handleAddComment(postId: string, content: string) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: generateId(),
                  postId,
                  author: currentUser,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post,
      ),
    )
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
          <Button type="submit" className="!w-auto px-6" disabled={!newPostText.trim()}>
            Опубликовать
          </Button>
        </div>
      </form>

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
    </div>
  )
}
