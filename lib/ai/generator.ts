import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { eq, desc, sql, and, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts, users, aiPostSettings } from '@/lib/db/schema'
import type { AccessLevel, AiPostSetting } from '@/lib/db/schema'
import { uploadToStorage } from '@/lib/storage'
import { generatePostContent } from './deepseek'
import { generateCoverImage } from './replicate'
import { blocksToTipTapDoc } from './tiptap'

export interface GenerationResult {
  accessLevel: AccessLevel
  templateId: string
  templateName: string | null
  postId: string
  slug: string
  title: string
}

export class GenerationError extends Error {
  constructor(message: string, readonly templateId: string) {
    super(message)
    this.name = 'GenerationError'
  }
}

/**
 * Generate one post from a specific template. Caller is responsible for
 * the quota check.
 */
export async function generateFromTemplate(
  templateId: string,
): Promise<GenerationResult> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const replicateKey = process.env.REPLICATE_API_TOKEN
  if (!deepseekKey) throw new GenerationError('DEEPSEEK_API_KEY missing', templateId)
  if (!replicateKey) throw new GenerationError('REPLICATE_API_TOKEN missing', templateId)

  const template = await db.query.aiPostSettings.findFirst({
    where: eq(aiPostSettings.id, templateId),
  })
  if (!template) throw new GenerationError(`Template ${templateId} not found`, templateId)

  const author = await db.query.users.findFirst({
    where: eq(users.role, 'admin'),
    orderBy: [users.createdAt],
  })
  if (!author) throw new GenerationError('No admin user to assign as author', templateId)

  const accessLevel = template.accessLevel as AccessLevel

  const recent = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.accessLevel, accessLevel))
    .orderBy(desc(posts.createdAt))
    .limit(10)

  const generated = await generatePostContent({
    accessLevel,
    promptHint: template.promptHint,
    recentTitles: recent.map((r) => r.title),
    apiKey: deepseekKey,
  })

  const cover = await generateCoverImage({
    prompt: generated.imagePrompt,
    apiKey: replicateKey,
  })

  const imageKey = `covers/ai-${nanoid(12)}.${cover.ext}`
  const coverUrl = await uploadToStorage(imageKey, cover.buffer, cover.contentType)

  const baseSlug = slugify(generated.title, { lower: true, strict: true, locale: 'pt' })
  const slug = `${baseSlug || 'post'}-${nanoid(6)}`
  const postId = nanoid()
  const now = new Date()

  await db.insert(posts).values({
    id: postId,
    title: generated.title.slice(0, 200),
    slug,
    excerpt: generated.excerpt.slice(0, 300),
    content: blocksToTipTapDoc(generated.blocks),
    coverImageUrl: coverUrl,
    published: true,
    publishedAt: now,
    accessLevel,
    authorId: author.id,
    generatedByAi: true,
    aiTemplateId: template.id,
    createdAt: now,
    updatedAt: now,
  })

  await db
    .update(aiPostSettings)
    .set({ lastRunAt: now, updatedAt: now })
    .where(eq(aiPostSettings.id, template.id))

  return {
    accessLevel,
    templateId: template.id,
    templateName: template.name,
    postId,
    slug,
    title: generated.title,
  }
}

interface SkipReason {
  templateId: string
  templateName: string | null
  accessLevel: AccessLevel
  reason: string
}

interface CycleError {
  templateId: string
  templateName: string | null
  accessLevel: AccessLevel
  error: string
}

/**
 * Walk every enabled template; if its daily quota isn't met yet, generate one
 * post for it. We generate at most one per template per cycle so a single bad
 * run can't burn a whole day's budget — the cron loops anyway.
 */
export async function runQuotaCycle(): Promise<{
  generated: GenerationResult[]
  skipped: SkipReason[]
  errors: CycleError[]
}> {
  const generated: GenerationResult[] = []
  const skipped: SkipReason[] = []
  const errors: CycleError[] = []

  const templates = await db.query.aiPostSettings.findMany()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  for (const template of templates as AiPostSetting[]) {
    const level = template.accessLevel as AccessLevel
    const meta = {
      templateId: template.id,
      templateName: template.name,
      accessLevel: level,
    }

    if (!template.enabled) {
      skipped.push({ ...meta, reason: 'disabled' })
      continue
    }
    if (template.postsPerDay <= 0) {
      skipped.push({ ...meta, reason: 'posts_per_day=0' })
      continue
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(
        and(
          eq(posts.aiTemplateId, template.id),
          gte(posts.createdAt, startOfDay),
        ),
      )

    const remaining = template.postsPerDay - count
    if (remaining <= 0) {
      skipped.push({
        ...meta,
        reason: `quota-met (${count}/${template.postsPerDay})`,
      })
      continue
    }

    try {
      const result = await generateFromTemplate(template.id)
      generated.push(result)
    } catch (err) {
      errors.push({
        ...meta,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { generated, skipped, errors }
}
