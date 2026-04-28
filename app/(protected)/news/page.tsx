import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { posts, users } from '@/lib/db/schema'
import { eq, desc, inArray, and } from 'drizzle-orm'
import { getAllowedAccessLevels } from '@/lib/access'
import { PostCard } from '@/components/posts/PostCard'
import { BookOpen } from 'lucide-react'
import type { MasonicLevel } from '@/lib/db/schema'

export const metadata: Metadata = { title: 'Notícias' }

export default async function NewsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) redirect('/login')
  if (!user.level) redirect('/profile')
  if (!user.levelVerified) redirect('/profile')
  if (user.subscriptionStatus !== 'active') redirect('/subscribe')

  const allowedLevels = getAllowedAccessLevels(user.level as MasonicLevel)

  const allPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.published, true),
      inArray(posts.accessLevel, allowedLevels)
    ),
    orderBy: [desc(posts.publishedAt)],
    with: { author: { columns: { name: true } } },
  })

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Notícias do Oriente</h1>
        </div>
        <p className="text-muted-foreground">
          Conteúdo exclusivo para{' '}
          <span className="font-medium capitalize text-foreground">
            {user.level}s
          </span>{' '}
          — {allPosts.length} artigo{allPosts.length !== 1 ? 's' : ''} disponível
          {allPosts.length !== 1 ? 'is' : ''}
        </p>
      </div>

      {allPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum artigo ainda</p>
          <p className="text-sm mt-1">Novos conteúdos em breve.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
