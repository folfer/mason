'use client'

import { useState, useTransition } from 'react'
import { Trash2, MessageSquare, Loader2, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addComment, deleteComment } from './actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  approved: boolean
  createdAt: Date
  user: { name: string } | null
}

interface Props {
  postId: string
  initialComments: Comment[]
  currentUserId: string
  isAdmin: boolean
}

export function CommentSection({
  postId,
  initialComments,
  currentUserId,
  isAdmin,
}: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<'approved' | 'pending' | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    setFeedback(null)

    startTransition(async () => {
      try {
        const result = await addComment(postId, text)
        setFeedback(result.approved ? 'approved' : 'pending')
        setText('')

        if (result.approved) {
          // Optimistically add comment to list
          setComments((prev) => [
            {
              id: `temp-${Date.now()}`,
              content: text.trim(),
              approved: true,
              createdAt: new Date(),
              user: { name: 'Você' },
            },
            ...prev,
          ])
        }
      } catch (err: any) {
        setError(err.message ?? 'Erro ao enviar comentário.')
      }
    })
  }

  function handleDelete(commentId: string) {
    setDeletingId(commentId)
    startTransition(async () => {
      try {
        await deleteComment(commentId)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      } catch {
        setError('Erro ao excluir comentário.')
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Comentários{' '}
          <span className="text-muted-foreground font-normal text-sm">
            ({comments.length})
          </span>
        </h3>
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Compartilhe sua reflexão com os irmãos..."
          maxLength={2000}
          rows={3}
          className={cn(
            'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground',
            'placeholder:text-muted-foreground resize-none',
            'focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/60',
            'transition-colors duration-200'
          )}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length}/2000</span>
          <Button
            type="submit"
            variant="gold"
            size="sm"
            disabled={isPending || !text.trim()}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Comentar
          </Button>
        </div>

        {feedback === 'approved' && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Comentário publicado com sucesso!
          </div>
        )}
        {feedback === 'pending' && (
          <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-3 py-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            Comentário enviado para revisão. Aparecerá após aprovação.
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Seja o primeiro a comentar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border bg-surface p-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {comment.user?.name ?? 'Irmão'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "d 'de' MMM, HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {(comment.user === null ||
                  (comment.user?.name === 'Você') ||
                  isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 flex-shrink-0"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
