import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { accounts, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { UserDetailForm } from './UserDetailForm'

export const metadata: Metadata = { title: 'Usuário — Admin' }

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!user) notFound()

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, id),
  })

  const providers = userAccounts.map((a) => a.providerId)
  const hasCredential = providers.includes('credential')

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para usuários
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Cadastrado em{' '}
          {format(new Date(user.createdAt), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
          {' · ID '}
          <span className="font-mono">{user.id}</span>
        </p>
      </div>

      <UserDetailForm
        user={user}
        providers={providers}
        hasCredential={hasCredential}
      />
    </div>
  )
}
