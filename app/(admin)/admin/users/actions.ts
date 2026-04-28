'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { accounts, sessions, users } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { hashPassword } from 'better-auth/crypto'
import { nanoid } from 'nanoid'
import type { MasonicLevel } from '@/lib/db/schema'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autenticado')

  const caller = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!caller || caller.role !== 'admin') throw new Error('Sem permissão')
  return caller
}

export async function promoteUser(
  targetUserId: string,
  newRole: 'user' | 'admin'
) {
  await requireAdmin()

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${targetUserId}`)
}

export async function updateUser(
  targetUserId: string,
  data: {
    name: string
    email: string
    cpf: string | null
    cargo: string | null
    loja: string | null
    grau: string | null
    level: MasonicLevel | null
    levelVerified: boolean
    emailVerified: boolean
    onboardingComplete: boolean
    role: 'user' | 'admin'
  }
) {
  await requireAdmin()

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  })
  if (!target) throw new Error('Usuário não encontrado')

  if (data.email !== target.email) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })
    if (existing && existing.id !== targetUserId) {
      throw new Error('Email já está em uso')
    }
  }

  if (data.cpf && data.cpf !== target.cpf) {
    const existing = await db.query.users.findFirst({
      where: eq(users.cpf, data.cpf),
    })
    if (existing && existing.id !== targetUserId) {
      throw new Error('CPF já está em uso')
    }
  }

  await db
    .update(users)
    .set({
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      cargo: data.cargo,
      loja: data.loja,
      grau: data.grau,
      level: data.level,
      levelVerified: data.levelVerified,
      emailVerified: data.emailVerified,
      onboardingComplete: data.onboardingComplete,
      role: data.role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, targetUserId))

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${targetUserId}`)
}

export async function resetUserPassword(
  targetUserId: string,
  newPassword: string
) {
  await requireAdmin()

  if (!newPassword || newPassword.length < 8) {
    throw new Error('A senha deve ter ao menos 8 caracteres')
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  })
  if (!target) throw new Error('Usuário não encontrado')

  const passwordHash = await hashPassword(newPassword)

  const credentialAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, targetUserId),
      eq(accounts.providerId, 'credential')
    ),
  })

  if (credentialAccount) {
    await db
      .update(accounts)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(accounts.id, credentialAccount.id))
  } else {
    await db.insert(accounts).values({
      id: nanoid(),
      accountId: targetUserId,
      providerId: 'credential',
      userId: targetUserId,
      password: passwordHash,
    })
  }

  await db.delete(sessions).where(eq(sessions.userId, targetUserId))

  revalidatePath(`/admin/users/${targetUserId}`)
}

export async function revokeUserSessions(targetUserId: string) {
  await requireAdmin()
  await db.delete(sessions).where(eq(sessions.userId, targetUserId))
  revalidatePath(`/admin/users/${targetUserId}`)
}

export async function deleteUser(targetUserId: string) {
  const caller = await requireAdmin()
  if (caller.id === targetUserId) {
    throw new Error('Você não pode excluir sua própria conta')
  }

  await db.delete(users).where(eq(users.id, targetUserId))

  revalidatePath('/admin/users')
  redirect('/admin/users')
}
