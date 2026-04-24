'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { submitQuizAttempt } from './actions'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Props {
  questions: Question[]
  level: string
}

export function QuizClient({ questions, level }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null)

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const isCorrect = confirmed && selected === current.correctAnswer

  function handleSelect(idx: number) {
    if (confirmed) return
    setSelected(idx)
  }

  function handleConfirm() {
    if (selected === null) return
    setConfirmed(true)
  }

  async function handleNext() {
    const newAnswers = [...answers, selected!]
    if (isLast) {
      setSubmitting(true)
      const res = await submitQuizAttempt({
        answers: newAnswers,
        level: level as any,
        questionIds: questions.map((q) => q.id),
      })
      setResult(res)
      setSubmitting(false)
    } else {
      setAnswers(newAnswers)
      setSelected(null)
      setConfirmed(false)
      setCurrentIndex((i) => i + 1)
    }
  }

  if (result) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {result.passed ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                Parabéns, Irmão!
              </h2>
              <p className="text-muted-foreground">
                Você acertou {result.score} de {questions.length} perguntas e
                comprovou seu grau de{' '}
                <strong className="capitalize text-foreground">{level}</strong>.
              </p>
              <Button
                className="mt-4"
                variant="gold"
                onClick={() => router.push('/subscribe')}
              >
                Prosseguir para o pagamento
              </Button>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold text-destructive">
                Não foi dessa vez
              </h2>
              <p className="text-muted-foreground">
                Você acertou {result.score} de {questions.length}. É necessário
                acertar todas as perguntas. Você poderá tentar novamente em 24h.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/login')}
              >
                Voltar ao início
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Pergunta {currentIndex + 1} de {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 w-6 rounded-full transition-colors',
                  i < currentIndex
                    ? 'bg-primary'
                    : i === currentIndex
                      ? 'bg-primary/50'
                      : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
        <CardTitle className="text-lg leading-snug">{current.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {current.options.map((option, idx) => {
          let variant = 'outline' as const
          let extra = ''

          if (confirmed) {
            if (idx === current.correctAnswer) {
              extra = 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'
            } else if (idx === selected && idx !== current.correctAnswer) {
              extra = 'border-destructive bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
            }
          } else if (idx === selected) {
            extra = 'border-primary bg-accent'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={confirmed}
              className={cn(
                'w-full text-left rounded-md border px-4 py-3 text-sm transition-all',
                'hover:border-primary hover:bg-accent disabled:cursor-default',
                extra
              )}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          )
        })}

        {confirmed && (
          <p className={cn('text-sm font-medium', isCorrect ? 'text-green-600' : 'text-destructive')}>
            {isCorrect ? '✓ Correto!' : `✗ Resposta correta: ${String.fromCharCode(65 + current.correctAnswer)}`}
          </p>
        )}

        <div className="pt-2">
          {!confirmed ? (
            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={selected === null}
            >
              Confirmar resposta
            </Button>
          ) : (
            <Button className="w-full" onClick={handleNext} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLast ? 'Ver resultado' : 'Próxima pergunta'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
