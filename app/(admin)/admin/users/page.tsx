import { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PromoteButton } from './PromoteButton'
import { CheckCircle2, XCircle, Pencil } from 'lucide-react'

export const metadata: Metadata = { title: 'Usuários — Admin' }

const levelColors: Record<string, 'aprendiz' | 'companheiro' | 'mestre' | 'secondary'> = {
  aprendiz: 'aprendiz',
  companheiro: 'companheiro',
  mestre: 'mestre',
}

export default async function AdminUsersPage() {
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm">
          {allUsers.length} usuário{allUsers.length !== 1 ? 's' : ''} cadastrado
          {allUsers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Usuário</th>
              <th className="text-left px-4 py-3 font-medium">Loja / Cargo</th>
              <th className="text-left px-4 py-3 font-medium">Nível</th>
              <th className="text-left px-4 py-3 font-medium">Verificado</th>
              <th className="text-left px-4 py-3 font-medium">Assinatura</th>
              <th className="text-left px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.cpf && (
                    <p className="text-xs text-muted-foreground font-mono">
                      CPF: {user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{user.loja ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{user.cargo ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  {user.level ? (
                    <Badge variant={levelColors[user.level] ?? 'secondary'} className="capitalize">
                      {user.level}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.levelVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.subscriptionStatus ? (
                    <Badge
                      variant={
                        user.subscriptionStatus === 'active'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {user.subscriptionStatus}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {format(new Date(user.createdAt), 'dd/MM/yy', { locale: ptBR })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Ver / editar usuário"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <PromoteButton
                      userId={user.id}
                      currentRole={user.role ?? 'user'}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
