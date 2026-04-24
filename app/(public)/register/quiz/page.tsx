import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { quizQuestions, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { QuizClient } from './QuizClient'

export const metadata: Metadata = { title: 'Verificação de Grau' }

export default async function QuizPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) redirect('/login')
  if (user.levelVerified) redirect('/subscribe')
  if (!user.level) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Perfil incompleto</h1>
          <p className="text-muted-foreground">
            Seu nível maçônico não foi salvo. Volte e complete o cadastro.
          </p>
          <a href="/register/complete" className="text-primary underline text-sm">
            Completar perfil
          </a>
        </div>
      </div>
    )
  }

  const questions = await db.query.quizQuestions.findMany({
    where: and(
      eq(quizQuestions.level, user.level),
      eq(quizQuestions.active, true)
    ),
    orderBy: (q, { asc }) => [asc(q.order)],
  })

  // Need at least 3 questions
  if (questions.length < 3) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Quiz em preparação</h1>
          <p className="text-muted-foreground">
            As perguntas de verificação para o nível{' '}
            <strong className="capitalize">{user.level}</strong> ainda estão
            sendo configuradas. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    )
  }

  // Pick 3 random questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 3)

  const safeQuestions = shuffled.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options as string[],
    correctAnswer: q.correctAnswer,
  }))

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">
              {user.level === 'aprendiz'
                ? '🔵'
                : user.level === 'companheiro'
                  ? '🟣'
                  : '🟡'}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Verificação de Grau
          </h1>
          <p className="mt-2 text-muted-foreground">
            Responda as 3 perguntas abaixo para confirmar seu grau de{' '}
            <strong className="capitalize text-foreground">{user.level}</strong>
          </p>
        </div>
        <QuizClient questions={safeQuestions} level={user.level} />
      </div>
    </div>
  )
}
