import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3, BUCKET } from '@/lib/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  // URLs are built as `${MINIO_PUBLIC_URL}/${BUCKET}/${key}` (see lib/storage.ts).
  // When MINIO_PUBLIC_URL points at this route, the first segment is the bucket
  // name — strip it so we look up the real S3 key.
  const segments = path.map(decodeURIComponent)
  const keySegments = segments[0] === BUCKET ? segments.slice(1) : segments
  const key = keySegments.join('/')

  try {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    )

    if (!result.Body) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = result.Body as ReadableStream<Uint8Array>
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': result.ContentType ?? 'application/octet-stream',
        'Content-Length': result.ContentLength?.toString() ?? '',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Storage error'
    const status = message.toLowerCase().includes('nosuchkey') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
