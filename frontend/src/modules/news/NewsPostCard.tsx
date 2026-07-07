import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { isRichTextEmpty, RichTextContent, RichTextEditor } from '../../components/rich-text'
import { NewsCommentItem } from './NewsCommentItem'
import { formatNewsDate, getInitials } from './utils'
import type { NewsPost } from './types'

interface NewsPostCardProps {
  post: NewsPost
  currentUser: string
  currentUserId?: string
  isCampaignMember?: boolean
  onAddComment: (postId: string, content: string) => void | Promise<void>
  onJoinCampaign?: (campaignId: string, postId: string) => void | Promise<void>
  onJoinSuccess?: (campaignName: string) => void
}

export function NewsPostCard({
  post,
  currentUser,
  currentUserId,
  isCampaignMember = false,
  onAddComment,
  onJoinCampaign,
  onJoinSuccess,
}: NewsPostCardProps) {
  const navigate = useNavigate()
  const [commentHtml, setCommentHtml] = useState('')
  const [commentEditorKey, setCommentEditorKey] = useState(0)
  const [showComments, setShowComments] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(isCampaignMember)
  const [joinMessage, setJoinMessage] = useState<string | null>(null)

  const isInvite = post.kind === 'campaign_invite' && post.campaignId
  const isAuthor = currentUserId && post.authorId === currentUserId
  const meta = post.inviteMeta
  const isFull = meta ? meta.players >= meta.maxPlayers : false
  const isClosed = meta ? meta.status !== 'active' : false

  async function handleSubmitComment(e: FormEvent) {
    e.preventDefault()
    if (isRichTextEmpty(commentHtml)) return

    setSubmittingComment(true)
    try {
      await onAddComment(post.id, commentHtml)
      setCommentHtml('')
      setCommentEditorKey((key) => key + 1)
    } finally {
      setSubmittingComment(false)
    }
  }

  useEffect(() => {
    setJoined(isCampaignMember)
  }, [isCampaignMember])

  async function handleJoin() {
    if (!post.campaignId || !onJoinCampaign) return
    setJoining(true)
    setJoinMessage(null)
    try {
      await onJoinCampaign(post.campaignId, post.id)
      setJoined(true)
      const name = meta?.campaignName ?? post.campaign ?? 'кампанию'
      setJoinMessage(`Вы добавлены в кампанию «${name}»`)
      onJoinSuccess?.(name)
    } catch (err) {
      setJoinMessage(err instanceof Error ? err.message : 'Не удалось добавить кампанию')
    } finally {
      setJoining(false)
    }
  }

  return (
    <article className="rounded-xl border border-dnd-border bg-dnd-card p-5 transition hover:border-dnd-purple/30">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dnd-purple/30 to-dnd-gold/20 text-sm font-semibold text-dnd-purple-hover">
          {getInitials(post.author)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{post.author}</span>
            <span className="text-xs text-dnd-muted">{formatNewsDate(post.createdAt)}</span>
            {post.campaign && (
              <span className="rounded-full border border-dnd-gold/30 bg-dnd-gold/10 px-2 py-0.5 text-xs text-dnd-gold">
                {isInvite ? 'Приглашение' : post.campaign}
              </span>
            )}
          </div>

          {isInvite && (
            <h3 className="mt-3 text-lg font-semibold text-white">
              {meta?.campaignName ?? post.campaign}
            </h3>
          )}

          <RichTextContent content={post.content} className="mt-3" />

          {isInvite && !isAuthor && (
            <div className="mt-4 space-y-3">
              {joinMessage && (
                <p
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    joined
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  {joinMessage}
                </p>
              )}
              {joined ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-emerald-400">Кампания в вашем списке</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/campaigns/${post.campaignId}/menu`)}
                    className="text-sm text-dnd-gold hover:underline"
                  >
                    Открыть кампанию →
                  </button>
                </div>
              ) : isClosed ? (
                <p className="text-sm text-dnd-muted">Кампания не принимает новых игроков</p>
              ) : isFull ? (
                <p className="text-sm text-dnd-muted">Все места заняты</p>
              ) : (
                <Button
                  type="button"
                  className="!w-auto px-6"
                  loading={joining}
                  onClick={() => void handleJoin()}
                >
                  Добавить кампанию
                </Button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="mt-4 inline-flex items-center gap-1 text-xs text-dnd-muted transition hover:text-dnd-gold"
          >
            <span>{showComments ? 'Скрыть' : 'Показать'} комментарии</span>
            <span className="rounded-full bg-dnd-border/70 px-2 py-0.5 text-[10px]">
              {post.comments.length}
            </span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-5 border-t border-dnd-border/60 pt-5 pl-0 sm:pl-14">
          {post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <NewsCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmitComment(e)} className="mt-4 space-y-3">
            <RichTextEditor
              key={commentEditorKey}
              compact
              placeholder="Написать комментарий…"
              onChange={setCommentHtml}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-dnd-muted">Комментируете как {currentUser}</p>
              <Button
                type="submit"
                className="!w-auto shrink-0 px-4"
                disabled={isRichTextEmpty(commentHtml)}
                loading={submittingComment}
              >
                Отправить
              </Button>
            </div>
          </form>
        </div>
      )}
    </article>
  )
}
