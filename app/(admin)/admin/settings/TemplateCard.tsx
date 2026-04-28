'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Wand2, Trash2, CheckCircle2 } from 'lucide-react'
import { updateAiTemplate, deleteAiTemplate, generateNow } from './actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  template: {
    id: string
    name: string | null
    enabled: boolean
    postsPerDay: number
    promptHint: string | null
    lastRunAt: Date | null
  }
}

export function TemplateCard({ template }: Props) {
  const [name, setName] = useState(template.name ?? '')
  const [enabled, setEnabled] = useState(template.enabled)
  const [postsPerDay, setPostsPerDay] = useState(String(template.postsPerDay))
  const [promptHint, setPromptHint] = useState(template.promptHint ?? '')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [generated, setGenerated] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [savingPending, startSave] = useTransition()
  const [genPending, startGen] = useTransition()
  const [deletePending, startDelete] = useTransition()

  function handleSave() {
    setError('')
    setSavedAt(null)
    startSave(async () => {
      try {
        await updateAiTemplate({
          id: template.id,
          name: name || null,
          enabled,
          postsPerDay: Number(postsPerDay) || 0,
          promptHint: promptHint || null,
        })
        setSavedAt(new Date())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao salvar')
      }
    })
  }

  function handleGenerate() {
    setError('')
    setGenerated(null)
    startGen(async () => {
      try {
        const result = await generateNow(template.id)
        setGenerated(result.title)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao gerar post')
      }
    })
  }

  function handleDelete() {
    if (!confirm('Apagar este template? Os posts já gerados continuam.')) return
    setError('')
    startDelete(async () => {
      try {
        await deleteAiTemplate(template.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao remover')
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`name-${template.id}`}>Nome do template</Label>
            <Input
              id={`name-${template.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: História da Maçonaria no Brasil"
              maxLength={120}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none pt-7">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium">{enabled ? 'Ativo' : 'Inativo'}</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-[140px_1fr] gap-4">
          <div className="space-y-1.5">
            <Label htmlFor={`ppd-${template.id}`}>Posts por dia</Label>
            <Input
              id={`ppd-${template.id}`}
              type="number"
              min={0}
              max={20}
              value={postsPerDay}
              onChange={(e) => setPostsPerDay(e.target.value)}
              disabled={!enabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`hint-${template.id}`}>Direcionamento</Label>
            <Textarea
              id={`hint-${template.id}`}
              rows={3}
              placeholder="Ex.: priorize temas históricos sobre a Maçonaria brasileira no Império."
              value={promptHint}
              onChange={(e) => setPromptHint(e.target.value)}
              disabled={!enabled}
            />
          </div>
        </div>

        {template.lastRunAt && (
          <p className="text-xs text-muted-foreground">
            Última execução:{' '}
            {format(template.lastRunAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={handleSave} disabled={savingPending} size="sm">
            {savingPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Salvar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={genPending || !enabled}
            size="sm"
            variant="outline"
          >
            {genPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Wand2 className="h-4 w-4 mr-1" />
            )}
            Gerar agora
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deletePending}
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive ml-auto"
          >
            {deletePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
          {savedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Salvo
            </span>
          )}
          {generated && (
            <span className="text-xs text-muted-foreground">
              Gerado: <span className="font-medium text-foreground">{generated}</span>
            </span>
          )}
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
