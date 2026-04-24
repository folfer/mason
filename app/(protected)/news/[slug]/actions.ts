'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, postComments, postLikes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

async function getActiveSubscriber() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autenticado')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) throw new Error('Usuário não encontrado')
  if (!user.levelVerified) throw new Error('Grau não verificado')
  if (user.subscriptionStatus !== 'active') throw new Error('Assinatura inativa')

  return user
}

async function moderateWithDeepSeek(content: string): Promise<boolean> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return true // fallback: aprovado se sem key

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'Você é um moderador de comentários para uma plataforma maçônica. Analise o comentário e responda APENAS com "aprovado" ou "rejeitado". Rejeite comentários com: linguagem ofensiva, ódio, spam, conteúdo sexual, ameaças, ou que violem o respeito fraternal. Aprove comentários construtivos, perguntas, elogios e críticas respeitosas.',
          },
          {
            role: 'user',
            content: `Comentário: "${content}"`,
          },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    const data = await res.json()
    const answer: string =
      data?.choices?.[0]?.message?.content?.toLowerCase() ?? ''
    return answer.includes('aprovado')
  } catch {
    return true // em caso de erro, aprova por padrão
  }
}

export async function addComment(
  postId: string,
  content: string
): Promise<{ approved: boolean }> {
  const user = await getActiveSubscriber()

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 2000) {
    throw new Error('Comentário inválido')
  }

  const approved = await moderateWithDeepSeek(trimmed)

  await db.insert(postComments).values({
    id: nanoid(),
    postId,
    userId: user.id,
    content: trimmed,
    approved,
  })

  revalidatePath(`/news`)
  return { approved }
}

export async function deleteComment(commentId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autenticado')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user) throw new Error('Usuário não encontrado')

  const comment = await db.query.postComments.findFirst({
    where: eq(postComments.id, commentId),
  })
  if (!comment) throw new Error('Comentário não encontrado')

  // Apenas o dono ou admin pode excluir
  if (comment.userId !== user.id && user.role !== 'admin') {
    throw new Error('Sem permissão')
  }

  await db.delete(postComments).where(eq(postComments.id, commentId))
  revalidatePath(`/news`)
}

export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; count: number }> {
  const user = await getActiveSubscriber()

  const existing = await db.query.postLikes.findFirst({
    where: and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)),
  })

  if (existing) {
    await db
      .delete(postLikes)
      .where(
        and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id))
      )
  } else {
    await db.insert(postLikes).values({
      id: nanoid(),
      postId,
      userId: user.id,
    })
  }

  const all = await db.query.postLikes.findMany({
    where: eq(postLikes.postId, postId),
  })

  revalidatePath(`/news`)
  return { liked: !existing, count: all.length }
}
