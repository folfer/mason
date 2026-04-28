'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { MasonicLevel } from '@/lib/db/schema'
import { uploadCertificateAndCreateSubmission } from '@/lib/level-submissions'

export async function completeMasonicProfile(data: {
  userId: string
  cpf: string
  cargo: string
  loja: string
  grau: string
  level: MasonicLevel
}) {
  try {
    if (!data.userId) {
      return { success: false, error: 'Não autenticado.' }
    }

    await db
      .update(users)
      .set({
        cpf: data.cpf,
        cargo: data.cargo,
        loja: data.loja,
        grau: data.grau,
        level: data.level,
        onboardingComplete: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, data.userId))

    return { success: true }
  } catch (err) {
    console.error('completeMasonicProfile error:', err)
    return { success: false, error: 'Erro interno ao salvar perfil.' }
  }
}

export async function submitRegistrationCertificate(formData: FormData) {
  try {
    const userId = formData.get('userId') as string | null
    const level = formData.get('level') as MasonicLevel | null
    const file = formData.get('certificate')

    if (!userId) return { success: false, error: 'Usuário não identificado.' }
    if (!level) return { success: false, error: 'Nível não informado.' }
    if (!(file instanceof File)) {
      return { success: false, error: 'Anexe o certificado do grau.' }
    }

    await uploadCertificateAndCreateSubmission({ userId, level, file })
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao enviar certificado.',
    }
  }
}
