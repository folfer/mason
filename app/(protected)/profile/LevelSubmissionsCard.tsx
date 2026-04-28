'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MasonicLevel, SubmissionStatus } from '@/lib/db/schema'
import { submitLevelCertificate } from './actions'

interface Submission {
  id: string
  level: MasonicLevel
  certificateUrl: string
  status: SubmissionStatus
  notes: string | null
  reviewedAt: Date | null
  createdAt: Date
}

interface Props {
  submissions: Submission[]
  currentLevel: MasonicLevel | null
  levelVerified: boolean
}

const LEVEL_OPTIONS: { value: MasonicLevel; label: string }[] = [
  { value: 'aprendiz', label: 'Aprendiz — 1º Grau' },
  { value: 'companheiro', label: 'Companheiro — 2º Grau' },
  { value: 'mestre', label: 'Mestre — 3º Grau' },
]

const LEVEL_LABEL: Record<MasonicLevel, string> = {
  aprendiz: 'Aprendiz',
  companheiro: 'Companheiro',
  mestre: 'Mestre',
}

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; icon: typeof Clock; tone: string }
> = {
  pending: { label: 'Pendente', icon: Clock, tone: 'text-amber-500' },
  approved: { label: 'Aprovado', icon: CheckCircle2, tone: 'text-green-600' },
  rejected: { label: 'Rejeitado', icon: XCircle, tone: 'text-destructive' },
}

export function LevelSubmissionsCard({ submissions, currentLevel, levelVerified }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [level, setLevel] = useState<MasonicLevel | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    if (selected && selected.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 10 MB).')
      setFile(null)
      e.target.value = ''
      return
    }
    setError('')
    setFile(selected)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!level) {
      setError('Escolha o grau a submeter.')
      return
    }
    if (!file) {
      setError('Anexe o certificado.')
      return
    }

    const formData = new FormData()
    formData.set('level', level)
    formData.set('certificate', file)

    startTransition(async () => {
      try {
        await submitLevelCertificate(formData)
        setSuccess(true)
        setLevel('')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao submeter')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" />
          Meus Graus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current verified level */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Grau atual</p>
          {currentLevel && levelVerified ? (
            <Badge variant={currentLevel}>{LEVEL_LABEL[currentLevel]}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">
              {currentLevel
                ? `${LEVEL_LABEL[currentLevel]} (aguardando aprovação)`
                : 'Nenhum grau verificado ainda'}
            </span>
          )}
        </div>

        {/* Submissions list */}
        {submissions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Histórico de submissões</p>
            <ul className="space-y-2">
              {submissions.map((s) => {
                const cfg = STATUS_CONFIG[s.status]
                const Icon = cfg.icon
                return (
                  <li
                    key={s.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-surface/50 p-3"
                  >
                    <Icon className={`h-4 w-4 ${cfg.tone} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm font-medium">
                          {LEVEL_LABEL[s.level]}
                        </p>
                        <span className={`text-xs ${cfg.tone}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enviado em{' '}
                        {format(s.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {s.reviewedAt && (
                          <>
                            {' '}· revisado em{' '}
                            {format(s.reviewedAt, 'dd/MM/yyyy', { locale: ptBR })}
                          </>
                        )}
                      </p>
                      {s.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Observação: {s.notes}
                        </p>
                      )}
                      <a
                        href={s.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver certificado enviado
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* New submission */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-border">
          <p className="text-sm font-medium">Submeter novo grau</p>
          <p className="text-xs text-muted-foreground">
            Envie o certificado do grau que deseja desbloquear. Após aprovação do administrador
            você terá acesso ao conteúdo desse grau.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="submit-level">Grau</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as MasonicLevel)}>
                <SelectTrigger id="submit-level">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Certificado</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 rounded-md border border-dashed border-border bg-surface/40 px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-surface"
              >
                {file ? (
                  <>
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Anexar arquivo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={pending} className="gap-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Enviar para aprovação
            </Button>
            {success && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                Enviado, aguardando aprovação
              </span>
            )}
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
