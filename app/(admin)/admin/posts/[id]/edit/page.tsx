import { Metadata } from 'next'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PostEditor } from '../../PostEditor'

export const metadata: Metadata = { title: 'Editar Post — Admin' }

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) })
  if (!post) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Post</h1>
        <p className="text-sm text-muted-foreground line-clamp-1">{post.title}</p>
      </div>
      <PostEditor post={post} />
    </div>
  )
}
