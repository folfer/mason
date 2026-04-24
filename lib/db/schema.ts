import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// --- Enums ---
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const masonicLevelEnum = pgEnum('masonic_level', [
  'aprendiz',
  'companheiro',
  'mestre',
])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'trialing',
])
export const accessLevelEnum = pgEnum('access_level', [
  'all',
  'aprendiz',
  'companheiro',
  'mestre',
])

// --- Users (extended) ---
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    name: text('name').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    // Masonic fields
    cpf: text('cpf').unique(),
    cargo: text('cargo'),
    loja: text('loja'),
    grau: text('grau'),
    level: masonicLevelEnum('level'),
    levelVerified: boolean('level_verified').notNull().default(false),
    onboardingComplete: boolean('onboarding_complete').notNull().default(false),
    // Access control
    role: userRoleEnum('role').notNull().default('user'),
    // Stripe
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    subscriptionStatus: subscriptionStatusEnum('subscription_status'),
    subscriptionPeriodEnd: timestamp('subscription_period_end'),
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_stripe_customer_idx').on(t.stripeCustomerId),
  ]
)

// --- Better Auth: accounts ---
export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)]
)

// --- Better Auth: sessions ---
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('sessions_token_idx').on(t.token),
    index('sessions_user_id_idx').on(t.userId),
  ]
)

// --- Better Auth: verifications ---
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// --- Posts ---
export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: jsonb('content').notNull().default('{}'),
    coverImageUrl: text('cover_image_url'),
    published: boolean('published').notNull().default(false),
    publishedAt: timestamp('published_at'),
    accessLevel: accessLevelEnum('access_level').notNull().default('all'),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('posts_slug_idx').on(t.slug),
    index('posts_published_idx').on(t.published),
    index('posts_access_level_idx').on(t.accessLevel),
  ]
)

// --- Quiz Questions ---
export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: text('id').primaryKey(),
    level: masonicLevelEnum('level').notNull(),
    question: text('question').notNull(),
    options: jsonb('options').notNull().$type<string[]>(),
    correctAnswer: integer('correct_answer').notNull(),
    order: integer('order').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('quiz_questions_level_idx').on(t.level, t.active)]
)

// --- Quiz Attempts ---
export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    level: masonicLevelEnum('level').notNull(),
    score: integer('score').notNull().default(0),
    passed: boolean('passed').notNull().default(false),
    answers: jsonb('answers').notNull().$type<number[]>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('quiz_attempts_user_idx').on(t.userId, t.level)]
)

// --- Post Comments ---
export const postComments = pgTable(
  'post_comments',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    approved: boolean('approved').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('post_comments_post_idx').on(t.postId),
    index('post_comments_user_idx').on(t.userId),
  ]
)

// --- Post Likes ---
export const postLikes = pgTable(
  'post_likes',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('post_likes_unique_idx').on(t.postId, t.userId)]
)

// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  accounts: many(accounts),
  sessions: many(sessions),
  quizAttempts: many(quizAttempts),
  comments: many(postComments),
  likes: many(postLikes),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  comments: many(postComments),
  likes: many(postLikes),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
}))

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  user: one(users, { fields: [postComments.userId], references: [users.id] }),
}))

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}))

// --- Types ---
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type QuizQuestion = typeof quizQuestions.$inferSelect
export type NewQuizQuestion = typeof quizQuestions.$inferInsert
export type QuizAttempt = typeof quizAttempts.$inferSelect
export type PostComment = typeof postComments.$inferSelect
export type PostLike = typeof postLikes.$inferSelect
export type MasonicLevel = 'aprendiz' | 'companheiro' | 'mestre'
export type AccessLevel = 'all' | 'aprendiz' | 'companheiro' | 'mestre'
