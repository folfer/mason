'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MasonicLevel, SubmissionStatus } from '@/lib/db/schema'
import { approveSubmission, rejectSubmission } from './actions'

interface Props {
  submission: {
    id: string
    level: MasonicLevel
    certificateUrl: string
    status: SubmissionStatus
    notes: string | null
    reviewedAt: Date | null
    createdAt: Date
    userName: string
    userEmail: string
    userCurrentLevel: MasonicLevel | null
    userLevelVerified: boolean
  }
}

const LEVEL_LABEL: Record<MasonicLevel, string> = {
  aprendiz: 'Aprendiz',
  companheiro: 'Companheiro',
  mestre: 'Mestre',
}

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export function SubmissionRow({ submission }: Props) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [approvePending, startApprove] = useTransition()
  const [rejectPending, startReject] = useTransition()

  function handleApprove() {
    setError('')
    startApprove(async () => {
      try {
        await approveSubmission(submission.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao aprovar')
      }
    })
  }

  function handleReject() {
    setError('')
    startReject(async () => {
      try {
        await rejectSubmission(submission.id, notes || null)
        setShowRejectForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao rejeitar')
      }
    })
  }

  const statusIcon =
    submission.status === 'approved' ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : submission.status === 'rejected' ? (
      <XCircle className="h-4 w-4 text-destructive" />
    ) : (
      <Clock className="h-4 w-4 text-amber-500" />
    )

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{submission.userName}</p>
              <span className="text-sm text-muted-foreground">{submission.userEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>Solicita:</span>
              <Badge variant={submission.level}>{LEVEL_LABEL[submission.level]}</Badge>
              <span>·</span>
              <span>
                Atual:{' '}
                {submission.userCurrentLevel
                  ? `${LEVEL_LABEL[submission.userCurrentLevel]}${submission.userLevelVerified ? '' : ' (não verificado)'}`
                  : 'nenhum'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enviado em{' '}
              {format(submission.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              {submission.reviewedAt && (
                <>
                  {' '}· revisado em{' '}
                  {format(submission.reviewedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            {statusIcon}
            <span>{STATUS_LABEL[submission.status]}</span>
          </div>
        </div>

        {submission.notes && submission.status === 'rejected' && (
          <p className="text-xs text-muted-foreground italic bg-surface/50 border border-border rounded p-2">
            Observação: {submission.notes}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={submission.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver certificado
          </a>

          {submission.status === 'pending' && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectForm((v) => !v)}
                disabled={rejectPending || approvePending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={approvePending || rejectPending}
                className="gap-1"
              >
                {approvePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Aprovar
              </Button>
            </div>
          )}
        </div>

        {showRejectForm && submission.status === 'pending' && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea
              placeholder="Motivo da rejeição (opcional, visível ao usuário)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowRejectForm(false)
                  setNotes('')
                }}
                disabled={rejectPending}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={rejectPending}
                className="gap-1"
              >
                {rejectPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar rejeição
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
