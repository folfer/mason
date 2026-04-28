'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, levelSubmissions } from '@/lib/db/schema'
import type { MasonicLevel } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const LEVEL_RANK: Record<MasonicLevel, number> = {
  aprendiz: 1,
  companheiro: 2,
  mestre: 3,
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user || user.role !== 'admin') throw new Error('Sem permissão')
  return user
}

export async function approveSubmission(submissionId: string) {
  const admin = await requireAdmin()

  const submission = await db.query.levelSubmissions.findFirst({
    where: eq(levelSubmissions.id, submissionId),
  })
  if (!submission) throw new Error('Submissão não encontrada')
  if (submission.status !== 'pending') {
    throw new Error('Submissão já foi revisada')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, submission.userId),
  })
  if (!user) throw new Error('Usuário não encontrado')

  const submittedLevel = submission.level as MasonicLevel
  const currentLevel = (user.level as MasonicLevel | null) ?? null
  const shouldUpgrade =
    !currentLevel || LEVEL_RANK[submittedLevel] > LEVEL_RANK[currentLevel]

  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(levelSubmissions)
      .set({
        status: 'approved',
        reviewedById: admin.id,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(levelSubmissions.id, submissionId))

    await tx
      .update(users)
      .set({
        ...(shouldUpgrade ? { level: submittedLevel } : {}),
        levelVerified: true,
        updatedAt: now,
      })
      .where(eq(users.id, submission.userId))
  })

  revalidatePath('/admin/submissions')
  revalidatePath('/profile')
  revalidatePath('/news')

  return { success: true }
}

export async function rejectSubmission(submissionId: string, notes: string | null) {
  const admin = await requireAdmin()

  const submission = await db.query.levelSubmissions.findFirst({
    where: eq(levelSubmissions.id, submissionId),
  })
  if (!submission) throw new Error('Submissão não encontrada')
  if (submission.status !== 'pending') {
    throw new Error('Submissão já foi revisada')
  }

  const trimmedNotes = notes?.trim() ? notes.trim().slice(0, 500) : null

  await db
    .update(levelSubmissions)
    .set({
      status: 'rejected',
      notes: trimmedNotes,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(levelSubmissions.id, submissionId))

  revalidatePath('/admin/submissions')
  revalidatePath('/profile')

  return { success: true }
}
