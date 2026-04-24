'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, postComments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autenticado')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user || user.role !== 'admin') throw new Error('Sem permissão')
  return user
}

export async function approveComment(commentId: string): Promise<void> {
  await requireAdmin()
  await db
    .update(postComments)
    .set({ approved: true })
    .where(eq(postComments.id, commentId))
  revalidatePath('/admin/comments')
  revalidatePath('/news')
}

export async function rejectComment(commentId: string): Promise<void> {
  await requireAdmin()
  await db.delete(postComments).where(eq(postComments.id, commentId))
  revalidatePath('/admin/comments')
}
