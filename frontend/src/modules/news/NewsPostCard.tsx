import { FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { NewsCommentItem } from './NewsCommentItem'
import { formatNewsDate, getInitials } from './utils'
import type { NewsPost } from './types'

interface NewsPostCardProps {
  post: NewsPost
  currentUser: string
  onAddComment: (postId: string, content: string) => void
}

export function NewsPostCard({ post, currentUser, onAddComment }: NewsPostCardProps) {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(true)

  function handleSubmitComment(e: FormEvent) {
    e.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed) return
    onAddComment(post.id, trimmed)
    setCommentText('')
  }

  return (
    <article className="rounded-xl border border-dnd-border bg-dnd-card p-5">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dnd-purple/25 text-sm font-semibold text-dnd-purple-hover">
          {getInitials(post.author)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{post.author}</span>
            <span className="text-xs text-dnd-muted">{formatNewsDate(post.createdAt)}</span>
            {post.campaign && (
              <span className="rounded-full border border-dnd-gold/30 bg-dnd-gold/10 px-2 py-0.5 text-xs text-dnd-gold">
                {post.campaign}
              </span>
            )}
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {post.content}
          </p>

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="mt-3 text-xs text-dnd-muted transition hover:text-dnd-gold"
          >
            {showComments ? 'Скрыть' : 'Показать'} комментарии ({post.comments.length})
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-dnd-border/60 pt-4 pl-14">
          {post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <NewsCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Написать комментарий..."
              className="min-w-0 flex-1 rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
            <Button type="submit" className="!w-auto shrink-0 px-4" disabled={!commentText.trim()}>
              Отправить
            </Button>
          </form>
          <p className="mt-1 text-xs text-dnd-muted">Комментируете как {currentUser}</p>
        </div>
      )}
    </article>
  )
}
