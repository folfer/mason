'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import slugify from 'slugify'
import type { AccessLevel } from '@/lib/db/schema'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user || user.role !== 'admin') throw new Error('Sem permissão')
  return user
}

export async function createPost(data: {
  title: string
  content: object
  excerpt: string
  coverImageUrl: string
  accessLevel: AccessLevel
  published: boolean
}) {
  const user = await requireAdmin()

  const slug =
    slugify(data.title, { lower: true, strict: true, locale: 'pt' }) +
    '-' +
    nanoid(6)

  await db.insert(posts).values({
    id: nanoid(),
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImageUrl: data.coverImageUrl || null,
    accessLevel: data.accessLevel,
    published: data.published,
    publishedAt: data.published ? new Date() : null,
    authorId: user.id,
  })

  revalidatePath('/news')
  revalidatePath('/admin/posts')
  return { success: true, slug }
}

export async function updatePost(
  postId: string,
  data: {
    title: string
    content: object
    excerpt: string
    coverImageUrl: string
    accessLevel: AccessLevel
    published: boolean
  }
) {
  await requireAdmin()

  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  })
  if (!existing) throw new Error('Post não encontrado')

  await db
    .update(posts)
    .set({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      coverImageUrl: data.coverImageUrl || null,
      accessLevel: data.accessLevel,
      published: data.published,
      publishedAt:
        data.published && !existing.publishedAt ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))

  revalidatePath('/news')
  revalidatePath(`/news/${existing.slug}`)
  revalidatePath('/admin/posts')
  return { success: true }
}

export async function deletePost(postId: string) {
  await requireAdmin()
  await db.delete(posts).where(eq(posts.id, postId))
  revalidatePath('/news')
  revalidatePath('/admin/posts')
}
