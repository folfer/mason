import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { levelSubmissions } from '@/lib/db/schema'
import type { MasonicLevel } from '@/lib/db/schema'
import { uploadToStorage } from '@/lib/storage'

const ALLOWED_CERTIFICATE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function uploadCertificateAndCreateSubmission(opts: {
  userId: string
  level: MasonicLevel
  file: File
}): Promise<{ submissionId: string; certificateUrl: string }> {
  const { userId, level, file } = opts

  if (!ALLOWED_CERTIFICATE_TYPES.has(file.type)) {
    throw new Error('Formato inválido. Envie PDF, JPG, PNG ou WEBP.')
  }
  if (file.size > MAX_CERTIFICATE_BYTES) {
    throw new Error('Arquivo muito grande (máximo 10 MB).')
  }
  if (file.size === 0) {
    throw new Error('Arquivo vazio.')
  }

  const ext =
    file.type === 'application/pdf'
      ? 'pdf'
      : file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'jpg'

  const key = `certificates/${userId}-${nanoid(10)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const certificateUrl = await uploadToStorage(key, buffer, file.type)

  const submissionId = nanoid()
  await db.insert(levelSubmissions).values({
    id: submissionId,
    userId,
    level,
    certificateUrl,
    status: 'pending',
  })

  return { submissionId, certificateUrl }
}
