import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { stripe, SUBSCRIPTION_PRICE_ID } from '@/lib/stripe'
import { SubscribeClient } from './SubscribeClient'

export const metadata: Metadata = { title: 'Assinar Mason Daily' }

export default async function SubscribePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) redirect('/login')
  if (!user.levelVerified) redirect('/profile')
  if (user.subscriptionStatus === 'active') redirect('/news')

  const appUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    })
    stripeCustomerId = customer.id
    await db
      .update(users)
      .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
      .where(eq(users.id, user.id))
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    locale: 'pt-BR',
    line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/subscribe`,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Assinatura
          </p>
          <h1 className="heading-serif text-4xl text-foreground mb-2">
            Acesso Premium
          </h1>
          <p className="text-muted-foreground text-sm">
            Assine e acesse todo o conteúdo exclusivo do Mason Daily
          </p>
        </div>
        <SubscribeClient checkoutUrl={checkoutSession.url!} />
      </div>
    </div>
  )
}
