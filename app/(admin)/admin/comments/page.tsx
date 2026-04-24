import { Metadata } from 'next'
import { db } from '@/lib/db'
import { postComments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { approveComment, rejectComment } from './actions'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Moderação de Comentários — Admin' }

export default async function CommentsPage() {
  const pending = await db.query.postComments.findMany({
    where: eq(postComments.approved, false),
    with: {
      user: { columns: { name: true, email: true } },
      post: { columns: { title: true, slug: true } },
    },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Moderação de Comentários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending.length} comentário{pending.length !== 1 ? 's' : ''} aguardando revisão
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4 opacity-60" />
          <h2 className="text-lg font-semibold mb-1">Tudo em dia!</h2>
          <p className="text-sm text-muted-foreground">
            Nenhum comentário aguardando moderação.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((comment) => {
            const post = comment.post as { title: string; slug: string } | null
            const user = comment.user as { name: string; email: string } | null

            return (
              <div
                key={comment.id}
                className="rounded-xl border border-border bg-surface p-5 space-y-3"
              >
                {/* Meta */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name ?? 'Usuário desconhecido'}
                      <span className="text-muted-foreground font-normal ml-2 text-xs">
                        {user?.email}
                      </span>
                    </p>
                    {post && (
                      <p className="text-xs text-muted-foreground">
                        Em:{' '}
                        <a
                          href={`/news/${post.slug}`}
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          {post.title}
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "d 'de' MMM 'de' yyyy, HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={approveComment.bind(null, comment.id)}>
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-green-400 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aprovar
                      </Button>
                    </form>
                    <form action={rejectComment.bind(null, comment.id)}>
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rejeitar
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Content */}
                <div className="rounded-lg bg-surface-elevated border border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
