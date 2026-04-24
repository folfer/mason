import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock } from 'lucide-react'
import type { Post } from '@/lib/db/schema'

const levelMeta: Record<string, { label: string; variant: 'aprendiz' | 'companheiro' | 'mestre' | 'secondary' }> = {
  all: { label: 'Todos os Graus', variant: 'secondary' },
  aprendiz: { label: 'Aprendiz', variant: 'aprendiz' },
  companheiro: { label: 'Companheiro', variant: 'companheiro' },
  mestre: { label: 'Mestre', variant: 'mestre' },
}

function estimateReadTime(content: unknown): number {
  const text = JSON.stringify(content ?? {})
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

interface PostCardProps {
  post: Post & { author?: { name: string } }
}

export function PostCard({ post }: PostCardProps) {
  const level = levelMeta[post.accessLevel] ?? levelMeta.all
  const readTime = estimateReadTime(post.content)

  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-surface-elevated transition-all duration-300 overflow-hidden"
    >
      {/* Cover image */}
      {post.coverImageUrl ? (
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-44 flex-shrink-0 bg-surface-elevated flex items-center justify-center border-b border-border">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="h-10 w-10 text-primary/20"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={level.variant}>{level.label}</Badge>
          {post.publishedAt && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: ptBR })}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          {post.author ? (
            <p className="text-xs text-muted-foreground">
              {post.author.name}
            </p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {readTime} min
          </div>
        </div>
      </div>
    </Link>
  )
}
