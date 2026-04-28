const REPLICATE_BASE = 'https://api.replicate.com/v1'
const FLUX_MODEL = 'black-forest-labs/flux-schnell'

interface Prediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string | string[] | null
  error?: string | null
  urls?: { get?: string }
}

export async function generateCoverImage(opts: {
  prompt: string
  apiKey: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
  outputFormat?: 'webp' | 'jpg' | 'png'
}): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const aspect = opts.aspectRatio ?? '16:9'
  const format = opts.outputFormat ?? 'webp'

  const fullPrompt = `${opts.prompt}. Classical fine art illustration, alchemical and esoteric symbolism, muted earth tones with gold accents, no text, no letters, no watermark, painterly style, high detail.`

  // Initial request — Prefer: wait makes Replicate hold the connection up to 60s.
  const startRes = await fetch(
    `${REPLICATE_BASE}/models/${FLUX_MODEL}/predictions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({
        input: {
          prompt: fullPrompt,
          aspect_ratio: aspect,
          output_format: format,
          num_outputs: 1,
          go_fast: true,
        },
      }),
    },
  )

  if (!startRes.ok) {
    const body = await startRes.text()
    throw new Error(`Replicate ${startRes.status}: ${body.slice(0, 300)}`)
  }

  let prediction = (await startRes.json()) as Prediction

  // If still processing after wait window, poll until terminal.
  while (
    prediction.status === 'starting' ||
    prediction.status === 'processing'
  ) {
    if (!prediction.urls?.get) {
      throw new Error('Replicate prediction has no get URL')
    }
    await new Promise((r) => setTimeout(r, 2000))
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${opts.apiKey}` },
    })
    if (!pollRes.ok) {
      throw new Error(`Replicate poll ${pollRes.status}`)
    }
    prediction = (await pollRes.json()) as Prediction
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(
      `Replicate prediction ${prediction.status}: ${prediction.error ?? 'no error message'}`,
    )
  }

  const url = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output
  if (!url) throw new Error('Replicate prediction returned no output URL')

  const imgRes = await fetch(url)
  if (!imgRes.ok) {
    throw new Error(`Failed to download generated image: ${imgRes.status}`)
  }
  const arrayBuffer = await imgRes.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const contentType = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    png: 'image/png',
  }[format]

  return { buffer, contentType, ext: format }
}
