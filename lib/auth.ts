import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
  },
  user: {
    additionalFields: {
      cpf: { type: 'string', required: false },
      cargo: { type: 'string', required: false },
      loja: { type: 'string', required: false },
      grau: { type: 'string', required: false },
      level: { type: 'string', required: false },
      levelVerified: { type: 'boolean', required: false, defaultValue: false },
      onboardingComplete: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      role: { type: 'string', required: false, defaultValue: 'user' },
      stripeCustomerId: { type: 'string', required: false },
      stripeSubscriptionId: { type: 'string', required: false },
      subscriptionStatus: { type: 'string', required: false },
      subscriptionPeriodEnd: { type: 'string', required: false },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
