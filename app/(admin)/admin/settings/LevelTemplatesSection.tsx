'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { createAiTemplate } from './actions'
import type { AccessLevel } from '@/lib/db/schema'
import { TemplateCard } from './TemplateCard'

interface TemplateData {
  id: string
  name: string | null
  enabled: boolean
  postsPerDay: number
  promptHint: string | null
  lastRunAt: Date | null
}

interface Props {
  level: AccessLevel
  label: string
  description: string
  templates: TemplateData[]
}

export function LevelTemplatesSection({ level, label, description, templates }: Props) {
  const [pending, startTransition] = useTransition()

  function handleAdd() {
    startTransition(async () => {
      try {
        await createAiTemplate(level)
      } catch (err) {
        console.error(err)
      }
    })
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
          className="gap-1 flex-shrink-0"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Adicionar template
        </Button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground italic px-1">
            Nenhum template configurado para este nível.
          </p>
        ) : (
          templates.map((t) => <TemplateCard key={t.id} template={t} />)
        )}
      </div>
    </section>
  )
}
