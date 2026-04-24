import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, Building2, Award, CreditCard, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Meu Perfil' }

const levelLabels: Record<string, string> = {
  aprendiz: '🔵 Aprendiz',
  companheiro: '🟣 Companheiro',
  mestre: '🟡 Mestre',
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user) redirect('/login')

  // Create Stripe billing portal URL if subscribed
  let billingPortalUrl: string | null = null
  if (user.stripeCustomerId) {
    try {
      const appUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
      const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${appUrl}/profile`,
      })
      billingPortalUrl = portal.url
    } catch {
      // Stripe may not be configured for portal
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <div className="space-y-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.cpf && (
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="font-medium font-mono">
                    {user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Masonic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Dados Maçônicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Loja</p>
                <p className="font-medium">{user.loja ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cargo</p>
                <p className="font-medium">{user.cargo ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Grau</p>
                <p className="font-medium">{user.grau ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nível na plataforma</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.level ? (
                    <Badge
                      variant={user.level as 'aprendiz' | 'companheiro' | 'mestre'}
                    >
                      {levelLabels[user.level] ?? user.level}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                  {user.levelVerified && (
                    <span className="text-xs text-green-600">✓ Verificado</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.subscriptionStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mason Daily Premium</p>
                    <p className="text-sm text-muted-foreground">R$9,90/mês</p>
                  </div>
                  <Badge
                    variant={
                      user.subscriptionStatus === 'active'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {user.subscriptionStatus === 'active' ? 'Ativa' : user.subscriptionStatus}
                  </Badge>
                </div>

                {user.subscriptionPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    {user.subscriptionStatus === 'active' ? 'Renova em' : 'Expirou em'}{' '}
                    {format(new Date(user.subscriptionPeriodEnd), "d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                )}

                {billingPortalUrl && (
                  <a href={billingPortalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Gerenciar assinatura
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-4">
                  Você ainda não tem uma assinatura ativa.
                </p>
                <Link href="/subscribe">
                  <Button variant="gold">Assinar agora</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
