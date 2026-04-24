'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { createQuestion, toggleQuestion, deleteQuestion } from './actions'
import type { QuizQuestion, MasonicLevel } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface Props {
  initialQuestions: QuizQuestion[]
}

const levelLabels: Record<MasonicLevel, string> = {
  aprendiz: '🔵 Aprendiz',
  companheiro: '🟣 Companheiro',
  mestre: '🟡 Mestre',
}

export function QuizManager({ initialQuestions }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // New question form
  const [level, setLevel] = useState<MasonicLevel>('aprendiz')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  function updateOption(idx: number, value: string) {
    const next = [...options]
    next[idx] = value
    setOptions(next)
  }

  async function handleCreate() {
    if (!question.trim() || options.some((o) => !o.trim())) return
    setLoading('creating')
    await createQuestion({
      level,
      question,
      options: options.map((o) => o.trim()),
      correctAnswer,
      order: initialQuestions.filter((q) => q.level === level).length,
    })
    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrectAnswer(0)
    setCreating(false)
    setLoading(null)
    router.refresh()
  }

  async function handleToggle(id: string, active: boolean) {
    setLoading(id)
    await toggleQuestion(id, !active)
    setLoading(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta pergunta?')) return
    setLoading(id)
    await deleteQuestion(id)
    setLoading(null)
    router.refresh()
  }

  const grouped = (['aprendiz', 'companheiro', 'mestre'] as MasonicLevel[]).map(
    (lvl) => ({
      level: lvl,
      questions: initialQuestions.filter((q) => q.level === lvl),
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="gold" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova pergunta
        </Button>
      </div>

      {creating && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Nova pergunta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select
                value={level}
                onValueChange={(v) => setLevel(v as MasonicLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprendiz">🔵 Aprendiz</SelectItem>
                  <SelectItem value="companheiro">🟣 Companheiro</SelectItem>
                  <SelectItem value="mestre">🟡 Mestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Input
                placeholder="Digite a pergunta..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Opções (marque a correta)</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(idx)}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      correctAnswer === idx
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:border-primary/50'
                    )}
                  >
                    {correctAnswer === idx && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </button>
                  <span className="text-sm font-medium w-4">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <Input
                    placeholder={`Opção ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Clique no círculo para marcar a resposta correta
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCreating(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="gold"
                onClick={handleCreate}
                disabled={loading === 'creating'}
                className="flex-1"
              >
                {loading === 'creating' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar pergunta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {grouped.map(({ level: lvl, questions }) => (
        <div key={lvl}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-semibold">{levelLabels[lvl]}</h2>
            <Badge variant={lvl}>
              {questions.length} pergunta{questions.length !== 1 ? 's' : ''}
            </Badge>
            {questions.length < 3 && (
              <Badge variant="destructive" className="text-xs">
                Mínimo 3 necessário
              </Badge>
            )}
          </div>

          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 pl-2">
              Nenhuma pergunta ainda para este nível.
            </p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-md border p-4',
                    !q.active && 'opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">
                        {qIdx + 1}. {q.question}
                      </p>
                      <ul className="space-y-0.5">
                        {(q.options as string[]).map((opt, i) => (
                          <li
                            key={i}
                            className={cn(
                              'text-xs',
                              i === q.correctAnswer
                                ? 'text-green-600 font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                            {i === q.correctAnswer && ' ✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(q.id, q.active)}
                        disabled={loading === q.id}
                        title={q.active ? 'Desativar' : 'Ativar'}
                      >
                        {q.active ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(q.id)}
                        disabled={loading === q.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  )
}
