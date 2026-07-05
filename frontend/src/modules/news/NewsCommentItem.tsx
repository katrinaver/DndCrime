import { formatNewsDate, getInitials } from './utils'
import type { NewsComment } from './types'

interface NewsCommentItemProps {
  comment: NewsComment
}

export function NewsCommentItem({ comment }: NewsCommentItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dnd-border text-xs font-semibold text-dnd-muted">
        {getInitials(comment.author)}
      </div>
      <div className="min-w-0 flex-1 rounded-lg border border-dnd-border/60 bg-dnd-dark/40 px-3 py-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-white">{comment.author}</span>
          <span className="text-xs text-dnd-muted">{formatNewsDate(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{comment.content}</p>
      </div>
    </div>
  )
}
