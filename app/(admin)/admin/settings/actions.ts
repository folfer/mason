'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { aiPostSettings, users } from '@/lib/db/schema'
import type { AccessLevel } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { generateFromTemplate } from '@/lib/ai/generator'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user || user.role !== 'admin') throw new Error('Sem permissão')
  return user
}

export async function createAiTemplate(accessLevel: AccessLevel) {
  await requireAdmin()
  const id = nanoid()
  await db.insert(aiPostSettings).values({
    id,
    accessLevel,
    name: 'Novo template',
    enabled: false,
    postsPerDay: 0,
    promptHint: null,
  })
  revalidatePath('/admin/settings')
  return { success: true, id }
}

export async function updateAiTemplate(input: {
  id: string
  name: string | null
  enabled: boolean
  postsPerDay: number
  promptHint: string | null
}) {
  await requireAdmin()

  const postsPerDay = Math.max(0, Math.min(20, Math.floor(input.postsPerDay)))
  const promptHint = input.promptHint?.trim() ? input.promptHint.trim() : null
  const name = input.name?.trim() ? input.name.trim().slice(0, 120) : null

  await db
    .update(aiPostSettings)
    .set({
      name,
      enabled: input.enabled,
      postsPerDay,
      promptHint,
      updatedAt: new Date(),
    })
    .where(eq(aiPostSettings.id, input.id))

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function deleteAiTemplate(id: string) {
  await requireAdmin()
  await db.delete(aiPostSettings).where(eq(aiPostSettings.id, id))
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function generateNow(templateId: string) {
  await requireAdmin()
  const result = await generateFromTemplate(templateId)
  revalidatePath('/admin/settings')
  revalidatePath('/admin/posts')
  revalidatePath('/news')
  return { success: true, slug: result.slug, title: result.title }
}
