import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
  // In Stripe API 2026+, current_period_end lives on the first SubscriptionItem
  const item = subscription.items?.data?.[0]
  if (item && 'current_period_end' in item) {
    return new Date((item as any).current_period_end * 1000)
  }
  // Fallback: use trial_end or cancel_at
  if (subscription.trial_end) return new Date(subscription.trial_end * 1000)
  if (subscription.cancel_at) return new Date(subscription.cancel_at * 1000)
  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items'],
          })
          await db
            .update(users)
            .set({
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: subscription.status as any,
              subscriptionPeriodEnd: getPeriodEnd(subscription),
              onboardingComplete: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await db
            .update(users)
            .set({
              subscriptionStatus: subscription.status as any,
              subscriptionPeriodEnd: getPeriodEnd(subscription),
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await db
            .update(users)
            .set({
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await db
          .update(users)
          .set({ subscriptionStatus: 'past_due', updatedAt: new Date() })
          .where(eq(users.stripeCustomerId, customerId))
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
