'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleLike } from './actions'

interface Props {
  postId: string
  initialCount: number
  initialLiked: boolean
}

export function LikeButton({ postId, initialCount, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // Optimistic update
    setLiked((p) => !p)
    setCount((p) => (liked ? p - 1 : p + 1))

    startTransition(async () => {
      try {
        const result = await toggleLike(postId)
        setLiked(result.liked)
        setCount(result.count)
      } catch {
        // Revert on error
        setLiked((p) => !p)
        setCount((p) => (liked ? p + 1 : p - 1))
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
        liked
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
          : 'border-border bg-surface text-muted-foreground hover:border-rose-500/30 hover:text-rose-400'
      )}
    >
      <Heart
        className={cn('h-4 w-4 transition-transform', liked && 'fill-rose-400 scale-110')}
      />
      <span>{count}</span>
    </button>
  )
}
