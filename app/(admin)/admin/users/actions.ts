'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function promoteUser(
  targetUserId: string,
  newRole: 'user' | 'admin'
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')

  const caller = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!caller || caller.role !== 'admin') throw new Error('Sem permissão')

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))

  revalidatePath('/admin/users')
}
