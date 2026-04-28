import { Metadata } from 'next'
import { db } from '@/lib/db'
import { levelSubmissions, users } from '@/lib/db/schema'
import type { MasonicLevel, SubmissionStatus } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { ShieldCheck } from 'lucide-react'
import { SubmissionRow } from './SubmissionRow'

export const metadata: Metadata = { title: 'Submissões — Admin' }

export default async function SubmissionsPage() {
  // pending first, then by createdAt desc
  const rows = await db
    .select({
      id: levelSubmissions.id,
      level: levelSubmissions.level,
      certificateUrl: levelSubmissions.certificateUrl,
      status: levelSubmissions.status,
      notes: levelSubmissions.notes,
      reviewedAt: levelSubmissions.reviewedAt,
      createdAt: levelSubmissions.createdAt,
      userId: levelSubmissions.userId,
      userName: users.name,
      userEmail: users.email,
      userLevel: users.level,
      userLevelVerified: users.levelVerified,
    })
    .from(levelSubmissions)
    .leftJoin(users, eq(levelSubmissions.userId, users.id))
    .orderBy(
      sql`case when ${levelSubmissions.status} = 'pending' then 0 else 1 end`,
      desc(levelSubmissions.createdAt),
    )

  const pendingCount = rows.filter((r) => r.status === 'pending').length

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Submissões de Grau</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Aprove os certificados enviados pelos usuários. Aprovar atualiza o grau do usuário (se for
          maior que o atual) e libera o conteúdo do nível. {pendingCount > 0 && (
            <span className="text-foreground font-medium">
              {pendingCount} pendente{pendingCount === 1 ? '' : 's'}.
            </span>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          Nenhuma submissão enviada ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <SubmissionRow
              key={r.id}
              submission={{
                id: r.id,
                level: r.level as MasonicLevel,
                certificateUrl: r.certificateUrl,
                status: r.status as SubmissionStatus,
                notes: r.notes,
                reviewedAt: r.reviewedAt,
                createdAt: r.createdAt,
                userName: r.userName ?? '—',
                userEmail: r.userEmail ?? '—',
                userCurrentLevel: (r.userLevel as MasonicLevel | null) ?? null,
                userLevelVerified: !!r.userLevelVerified,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
