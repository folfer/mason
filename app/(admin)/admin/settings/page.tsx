import { Metadata } from 'next'
import { db } from '@/lib/db'
import { aiPostSettings } from '@/lib/db/schema'
import type { AccessLevel } from '@/lib/db/schema'
import { Sparkles } from 'lucide-react'
import { asc } from 'drizzle-orm'
import { LevelTemplatesSection } from './LevelTemplatesSection'

export const metadata: Metadata = { title: 'Configurações — Admin' }

const ACCESS_LEVELS: { level: AccessLevel; label: string; description: string }[] = [
  { level: 'all', label: 'Todos os Graus', description: 'Posts visíveis para qualquer assinante.' },
  { level: 'aprendiz', label: 'Aprendiz', description: 'Conteúdo direcionado ao 1º grau.' },
  { level: 'companheiro', label: 'Companheiro', description: 'Conteúdo direcionado ao 2º grau.' },
  { level: 'mestre', label: 'Mestre', description: 'Conteúdo direcionado ao 3º grau.' },
]

export default async function SettingsPage() {
  const rows = await db.query.aiPostSettings.findMany({
    orderBy: [asc(aiPostSettings.createdAt)],
  })

  const groupedByLevel = new Map<AccessLevel, typeof rows>()
  for (const lv of ACCESS_LEVELS) groupedByLevel.set(lv.level, [])
  for (const row of rows) {
    const level = row.accessLevel as AccessLevel
    if (!groupedByLevel.has(level)) groupedByLevel.set(level, [])
    groupedByLevel.get(level)!.push(row)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Posts automáticos com IA</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Cada nível pode ter vários templates. Cada template tem seu próprio direcionamento e cota
          diária — a cota total/dia do nível é a soma das cotas dos templates ativos. O agendador
          roda de hora em hora e completa o que faltar.
        </p>
      </div>

      <div className="space-y-10">
        {ACCESS_LEVELS.map(({ level, label, description }) => (
          <LevelTemplatesSection
            key={level}
            level={level}
            label={label}
            description={description}
            templates={(groupedByLevel.get(level) ?? []).map((t) => ({
              id: t.id,
              name: t.name,
              enabled: t.enabled,
              postsPerDay: t.postsPerDay,
              promptHint: t.promptHint,
              lastRunAt: t.lastRunAt,
            }))}
          />
        ))}
      </div>
    </div>
  )
}
