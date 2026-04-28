import type { PostBlock } from './deepseek'

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: { type: string }[]
}

export function blocksToTipTapDoc(blocks: PostBlock[]): TipTapNode {
  const content: TipTapNode[] = []

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        content.push({
          type: 'heading',
          attrs: { level: block.level === 3 ? 3 : 2 },
          content: textNodes(block.text ?? ''),
        })
        break
      case 'paragraph':
        content.push({
          type: 'paragraph',
          content: textNodes(block.text ?? ''),
        })
        break
      case 'quote':
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: textNodes(block.text ?? ''),
            },
          ],
        })
        break
      case 'list': {
        const listType = block.ordered ? 'orderedList' : 'bulletList'
        content.push({
          type: listType,
          content: (block.items ?? []).map((item) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: textNodes(item),
              },
            ],
          })),
        })
        break
      }
    }
  }

  return { type: 'doc', content }
}

function textNodes(raw: string): TipTapNode[] {
  // Tiptap rejects empty text nodes; collapse whitespace and bail if empty.
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return []
  return [{ type: 'text', text }]
}
