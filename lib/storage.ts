import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT ?? 'localhost'}:${process.env.MINIO_PORT ?? '9000'}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
  },
  forcePathStyle: true,
})

export const BUCKET = process.env.MINIO_BUCKET ?? 'mason-daily'

export function getPublicUrl(key: string): string {
  const base = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000'
  return `${base}/${BUCKET}/${key}`
}

export async function uploadToStorage(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
  return getPublicUrl(key)
}

export async function deleteFromStorage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
