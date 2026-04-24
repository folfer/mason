import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/20 text-primary',
        secondary:
          'border-border bg-surface text-muted-foreground',
        destructive:
          'border-transparent bg-destructive/20 text-destructive',
        outline:
          'border-border text-muted-foreground',
        gold:
          'border-primary/40 bg-primary/10 text-primary',
        aprendiz:
          'border-blue-500/30 bg-blue-500/10 text-blue-300',
        companheiro:
          'border-purple-500/30 bg-purple-500/10 text-purple-300',
        mestre:
          'border-primary/40 bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
