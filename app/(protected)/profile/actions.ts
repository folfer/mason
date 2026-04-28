'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, levelSubmissions } from '@/lib/db/schema'
import type { MasonicLevel } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { uploadToStorage } from '@/lib/storage'
import { uploadCertificateAndCreateSubmission } from '@/lib/level-submissions'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5 MB

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user) throw new Error('Usuário não encontrado')
  return user
}

export async function updateProfile(formData: FormData) {
  const me = await requireUser()

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const loja = (formData.get('loja') as string | null)?.trim() ?? ''
  const cargo = (formData.get('cargo') as string | null)?.trim() ?? ''
  const grau = (formData.get('grau') as string | null)?.trim() ?? ''
  const avatar = formData.get('avatar')

  if (!name) throw new Error('Nome é obrigatório')

  let imageUrl: string | undefined

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(avatar.type)) {
      throw new Error('Formato de imagem inválido (use JPG, PNG ou WEBP)')
    }
    if (avatar.size > MAX_AVATAR_BYTES) {
      throw new Error('Imagem muito grande (máximo 5 MB)')
    }
    const ext = avatar.type === 'image/png' ? 'png' : avatar.type === 'image/webp' ? 'webp' : 'jpg'
    const key = `avatars/${me.id}-${nanoid(8)}.${ext}`
    const buffer = Buffer.from(await avatar.arrayBuffer())
    imageUrl = await uploadToStorage(key, buffer, avatar.type)
  }

  await db
    .update(users)
    .set({
      name: name.slice(0, 120),
      loja: loja ? loja.slice(0, 200) : null,
      cargo: cargo ? cargo.slice(0, 200) : null,
      grau: grau ? grau.slice(0, 100) : null,
      ...(imageUrl ? { image: imageUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, me.id))

  revalidatePath('/profile')
  revalidatePath('/news')

  return { success: true, imageUrl: imageUrl ?? me.image ?? null }
}

export async function submitLevelCertificate(formData: FormData) {
  const me = await requireUser()

  const level = formData.get('level') as MasonicLevel | null
  const file = formData.get('certificate')

  if (!level || !['aprendiz', 'companheiro', 'mestre'].includes(level)) {
    throw new Error('Selecione um grau válido.')
  }
  if (!(file instanceof File)) {
    throw new Error('Anexe o certificado.')
  }

  // Block duplicate pending submission for the same level — admin should
  // resolve the existing one first.
  const existing = await db.query.levelSubmissions.findFirst({
    where: and(
      eq(levelSubmissions.userId, me.id),
      eq(levelSubmissions.level, level),
      eq(levelSubmissions.status, 'pending'),
    ),
  })
  if (existing) {
    throw new Error('Já existe uma submissão pendente para este grau.')
  }

  await uploadCertificateAndCreateSubmission({ userId: me.id, level, file })

  revalidatePath('/profile')
  return { success: true }
}

