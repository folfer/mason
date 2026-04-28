import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, levelSubmissions } from '@/lib/db/schema'
import type { MasonicLevel, SubmissionStatus } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, ExternalLink, Mail, IdCard } from 'lucide-react'
import Link from 'next/link'
import { ProfileForm } from './ProfileForm'
import { LevelSubmissionsCard } from './LevelSubmissionsCard'

export const metadata: Metadata = { title: 'Meu Perfil' }

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user) redirect('/login')

  const submissionRows = await db.query.levelSubmissions.findMany({
    where: eq(levelSubmissions.userId, user.id),
    orderBy: [desc(levelSubmissions.createdAt)],
  })

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
        <ProfileForm
          user={{
            name: user.name,
            image: user.image,
            loja: user.loja,
            cargo: user.cargo,
            grau: user.grau,
          }}
        />

        {/* Account info — read-only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.cpf && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IdCard className="h-3 w-3" /> CPF
                  </p>
                  <p className="font-medium font-mono">
                    {user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <LevelSubmissionsCard
          submissions={submissionRows.map((s) => ({
            id: s.id,
            level: s.level as MasonicLevel,
            certificateUrl: s.certificateUrl,
            status: s.status as SubmissionStatus,
            notes: s.notes,
            reviewedAt: s.reviewedAt,
            createdAt: s.createdAt,
          }))}
          currentLevel={(user.level as MasonicLevel) ?? null}
          levelVerified={user.levelVerified}
        />

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
