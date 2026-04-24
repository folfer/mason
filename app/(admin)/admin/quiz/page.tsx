import { Metadata } from 'next'
import { db } from '@/lib/db'
import { quizQuestions } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { QuizManager } from './QuizManager'

export const metadata: Metadata = { title: 'Quiz — Admin' }

export default async function AdminQuizPage() {
  const questions = await db.query.quizQuestions.findMany({
    orderBy: [desc(quizQuestions.level), desc(quizQuestions.order)],
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Perguntas do Quiz</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie as perguntas de verificação por grau maçônico. Cada nível precisa de pelo menos 3 perguntas.
        </p>
      </div>
      <QuizManager initialQuestions={questions} />
    </div>
  )
}
