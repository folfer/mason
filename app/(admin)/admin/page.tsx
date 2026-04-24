import { Metadata } from 'next'
import { db } from '@/lib/db'
import { posts, users, quizAttempts } from '@/lib/db/schema'
import { count, eq, and } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, CheckCircle2, DollarSign } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

export default async function AdminDashboardPage() {
  const [
    [totalUsers],
    [activeSubscribers],
    [totalPosts],
    [publishedPosts],
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(eq(users.subscriptionStatus, 'active')),
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(posts).where(eq(posts.published, true)),
  ])

  const stats = [
    {
      title: 'Total de usuários',
      value: totalUsers.count,
      icon: Users,
      description: 'cadastros realizados',
    },
    {
      title: 'Assinantes ativos',
      value: activeSubscribers.count,
      icon: DollarSign,
      description: 'R$9,90/mês',
    },
    {
      title: 'Posts publicados',
      value: publishedPosts.count,
      icon: FileText,
      description: `de ${totalPosts.count} no total`,
    },
    {
      title: 'Receita mensal',
      value: `R$${(activeSubscribers.count * 9.9).toFixed(2)}`,
      icon: CheckCircle2,
      description: 'estimado',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do Mason Daily</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
