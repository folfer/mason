import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

// Named export for convenience — only call in server context where env vars exist
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID ?? ''

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
}
