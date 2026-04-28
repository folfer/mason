const DEEPSEEK_BASE = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-v4-flash'

export interface PostBlock {
  type: 'heading' | 'paragraph' | 'list' | 'quote'
  level?: 2 | 3
  text?: string
  ordered?: boolean
  items?: string[]
}

export interface GeneratedPost {
  title: string
  excerpt: string
  imagePrompt: string
  blocks: PostBlock[]
}

const SYSTEM_PROMPT = `Você é um escritor experiente em filosofia maçônica brasileira, escrevendo para uma coluna diária ("Coluna do Oriente"). Seus artigos são autorais, profundos, históricos e simbólicos — nunca rituais secretos ou conteúdo sigiloso. Você responde EXCLUSIVAMENTE com um objeto JSON válido seguindo o schema fornecido. Sem markdown, sem comentários, sem texto extra antes ou depois do JSON.`

const SCHEMA_DESCRIPTION = `Schema de saída (JSON puro):
{
  "title": string (máx 80 caracteres, atraente),
  "excerpt": string (resumo de 1-2 frases, máx 200 caracteres),
  "imagePrompt": string (descrição visual em inglês para gerar a capa, sem texto/letras na imagem, estilo arte clássica/simbólica/alquímica),
  "blocks": [
    { "type": "heading", "level": 2 | 3, "text": string },
    { "type": "paragraph", "text": string },
    { "type": "list", "ordered": boolean, "items": [string, ...] },
    { "type": "quote", "text": string }
  ]
}
Regras dos blocks:
- Mínimo 4 blocks, máximo 14
- Sempre alternar: comece com paragraph (introdução), use 1-3 headings ao longo, finalize com paragraph
- Listas opcionais; cada item no máximo 1 frase
- Linguagem culta, próxima do leitor brasileiro, sem clichês
- Não inclua título dentro de blocks (já está em "title")`

export async function generatePostContent(opts: {
  accessLevel: 'all' | 'aprendiz' | 'companheiro' | 'mestre'
  promptHint?: string | null
  recentTitles?: string[]
  apiKey: string
  model?: string
}): Promise<GeneratedPost> {
  const levelLabel = {
    all: 'todos os graus (sem distinção)',
    aprendiz: 'Aprendiz (1º grau)',
    companheiro: 'Companheiro (2º grau)',
    mestre: 'Mestre (3º grau)',
  }[opts.accessLevel]

  const recentBlock = opts.recentTitles?.length
    ? `\n\nTítulos publicados recentemente (NÃO repita o tema):\n- ${opts.recentTitles.slice(0, 10).join('\n- ')}`
    : ''

  const hintBlock = opts.promptHint?.trim()
    ? `\n\nDirecionamento adicional do editor: ${opts.promptHint.trim()}`
    : ''

  const userPrompt = `Escreva um artigo original para a coluna, voltado para leitores no nível "${levelLabel}".

${SCHEMA_DESCRIPTION}${recentBlock}${hintBlock}

Responda apenas com o JSON.`

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 4000,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DeepSeek ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[]
  }

  const raw = data.choices[0]?.message?.content
  if (!raw) throw new Error('DeepSeek returned empty content')

  let parsed: GeneratedPost
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    throw new Error(
      `DeepSeek returned invalid JSON: ${(err as Error).message}\n\n${raw.slice(0, 400)}`,
    )
  }

  validateGeneratedPost(parsed)
  return parsed
}

function validateGeneratedPost(p: unknown): asserts p is GeneratedPost {
  if (!p || typeof p !== 'object') throw new Error('Generated post is not an object')
  const obj = p as Record<string, unknown>
  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('Generated post missing title')
  }
  if (typeof obj.excerpt !== 'string' || !obj.excerpt.trim()) {
    throw new Error('Generated post missing excerpt')
  }
  if (typeof obj.imagePrompt !== 'string' || !obj.imagePrompt.trim()) {
    throw new Error('Generated post missing imagePrompt')
  }
  if (!Array.isArray(obj.blocks) || obj.blocks.length === 0) {
    throw new Error('Generated post has no blocks')
  }
  for (const block of obj.blocks as PostBlock[]) {
    if (!block || typeof block !== 'object') throw new Error('Invalid block')
    if (!['heading', 'paragraph', 'list', 'quote'].includes(block.type)) {
      throw new Error(`Unknown block type: ${block.type}`)
    }
    if (block.type === 'list') {
      if (!Array.isArray(block.items) || block.items.length === 0) {
        throw new Error('List block missing items')
      }
    } else if (typeof block.text !== 'string' || !block.text.trim()) {
      throw new Error(`Block ${block.type} missing text`)
    }
  }
}
