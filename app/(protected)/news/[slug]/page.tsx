import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, users, postComments, postLikes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { canAccessPost } from '@/lib/access'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { MasonicLevel } from '@/lib/db/schema'
import { PostContent } from '@/components/posts/PostContent'
import { LikeButton } from './LikeButton'
import { ShareButtons } from '@/components/posts/ShareButtons'
import { CommentSection } from './CommentSection'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return {
    title: post?.title ?? 'Post não encontrado',
    description: post?.excerpt ?? undefined,
  }
}

const levelLabels: Record<string, string> = {
  all: 'Todos',
  aprendiz: 'Aprendiz',
  companheiro: 'Companheiro',
  mestre: 'Mestre',
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const [user, post] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
    db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: { author: { columns: { name: true } } },
    }),
  ])

  if (!user) redirect('/login')
  if (!post || !post.published) notFound()
  if (!user.levelVerified) redirect('/register/quiz')
  if (user.subscriptionStatus !== 'active') redirect('/subscribe')

  const hasAccess = canAccessPost(user.level as MasonicLevel, post.accessLevel)

  // Fetch likes and comments in parallel
  const [allLikes, userLike, approvedComments] = await Promise.all([
    db.query.postLikes.findMany({ where: eq(postLikes.postId, post.id) }),
    db.query.postLikes.findFirst({
      where: and(eq(postLikes.postId, post.id), eq(postLikes.userId, user.id)),
    }),
    db.query.postComments.findMany({
      where: and(
        eq(postComments.postId, post.id),
        eq(postComments.approved, true)
      ),
      with: { user: { columns: { name: true } } },
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    }),
  ])

  const appUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
  const postUrl = `${appUrl}/news/${post.slug}`

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Back */}
      <div className="mb-6">
        <Link href="/news">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Cover */}
      {post.coverImageUrl && (
        <div className="relative h-72 mb-8 rounded-xl overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant={post.accessLevel === 'all' ? 'secondary' : (post.accessLevel as any)}
          >
            {levelLabels[post.accessLevel]}
          </Badge>
          {post.publishedAt && (
            <span className="text-sm text-muted-foreground">
              {format(new Date(post.publishedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          )}
        </div>

        <h1 className="heading-serif text-4xl sm:text-5xl leading-tight mb-4 text-foreground">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            {post.excerpt}
          </p>
        )}

        {post.author && 'name' in post.author && (
          <p className="text-sm text-muted-foreground">
            Por{' '}
            <span className="font-medium text-foreground">
              {(post.author as { name: string }).name}
            </span>
          </p>
        )}
      </div>

      {/* Content or lock */}
      {!hasAccess ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Conteúdo restrito</h2>
          <p className="text-muted-foreground">
            Este artigo é exclusivo para{' '}
            <strong className="capitalize">{levelLabels[post.accessLevel]}s</strong>.
            Seu grau atual não permite acesso a este conteúdo.
          </p>
        </div>
      ) : (
        <>
          <PostContent content={post.content as object} />

          {/* Interaction bar */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <LikeButton
              postId={post.id}
              initialCount={allLikes.length}
              initialLiked={!!userLike}
            />
            <ShareButtons url={postUrl} title={post.title} />
          </div>

          {/* Comments */}
          <CommentSection
            postId={post.id}
            initialComments={approvedComments.map((c) => ({
              id: c.id,
              content: c.content,
              approved: c.approved,
              createdAt: c.createdAt,
              user: c.user ? { name: (c.user as { name: string }).name } : null,
            }))}
            currentUserId={user.id}
            isAdmin={user.role === 'admin'}
          />
        </>
      )}
    </div>
  )
}
