'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quizQuestions, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import type { MasonicLevel } from '@/lib/db/schema'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user || user.role !== 'admin') throw new Error('Sem permissão')
}

export async function createQuestion(data: {
  level: MasonicLevel
  question: string
  options: string[]
  correctAnswer: number
  order: number
}) {
  await requireAdmin()
  await db.insert(quizQuestions).values({
    id: nanoid(),
    level: data.level,
    question: data.question,
    options: data.options,
    correctAnswer: data.correctAnswer,
    order: data.order,
    active: true,
  })
  revalidatePath('/admin/quiz')
}

export async function toggleQuestion(id: string, active: boolean) {
  await requireAdmin()
  await db
    .update(quizQuestions)
    .set({ active })
    .where(eq(quizQuestions.id, id))
  revalidatePath('/admin/quiz')
}

export async function deleteQuestion(id: string) {
  await requireAdmin()
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id))
  revalidatePath('/admin/quiz')
}
