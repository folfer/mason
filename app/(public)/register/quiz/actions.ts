'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, quizAttempts, quizQuestions } from '@/lib/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import type { MasonicLevel } from '@/lib/db/schema'

export async function submitQuizAttempt(data: {
  answers: number[]
  level: MasonicLevel
  questionIds: string[]
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { passed: false, score: 0, error: 'Não autenticado' }

  const userId = session.user.id

  // Cooldown: prevent retry within 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentAttempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.level, data.level),
      eq(quizAttempts.passed, false),
      gte(quizAttempts.createdAt, yesterday)
    ),
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  })

  if (recentAttempt) {
    return {
      passed: false,
      score: 0,
      error: 'Aguarde 24h para tentar novamente.',
    }
  }

  // Fetch the correct answers from DB (don't trust client)
  const questions = await db.query.quizQuestions.findMany({
    where: (q) => {
      // inline: IDs match
      return and(
        eq(q.level, data.level),
        eq(q.active, true)
      )
    },
  })

  const questionMap = new Map(questions.map((q) => [q.id, q.correctAnswer]))

  let score = 0
  for (let i = 0; i < data.questionIds.length; i++) {
    const correctAnswer = questionMap.get(data.questionIds[i])
    if (correctAnswer !== undefined && data.answers[i] === correctAnswer) {
      score++
    }
  }

  const passed = score === data.questionIds.length

  await db.insert(quizAttempts).values({
    id: nanoid(),
    userId,
    level: data.level,
    score,
    passed,
    answers: data.answers,
  })

  if (passed) {
    await db
      .update(users)
      .set({ levelVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }

  return { passed, score }
}
