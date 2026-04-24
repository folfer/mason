'use client'

import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Shield } from 'lucide-react'

const features = [
  'Acesso a todos os artigos e notícias',
  'Conteúdo exclusivo segmentado por grau',
  'Publicações semanais do Oriente',
  'Arquivo histórico completo',
  'Cancele quando quiser',
]

interface Props {
  checkoutUrl: string
}

export function SubscribeClient({ checkoutUrl }: Props) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-surface p-8 shadow-[0_0_60px_rgba(198,161,91,0.08)]">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30 mb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        </div>
        <h2 className="heading-serif text-3xl text-foreground mb-1">
          Mason Daily Premium
        </h2>
        <p className="text-sm text-muted-foreground">Acesso completo ao portal</p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className="heading-serif text-5xl font-bold text-primary">R$&thinsp;9</span>
          <span className="heading-serif text-3xl text-primary">,90</span>
          <span className="text-muted-foreground ml-1">/mês</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Sem taxa de adesão</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-7" />

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((text) => (
          <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Check className="h-3 w-3 text-primary" />
            </div>
            {text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant="gold"
        size="lg"
        className="w-full gap-2"
        onClick={() => (window.location.href = checkoutUrl)}
      >
        Assinar agora
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-primary/60" />
        Pagamento seguro via Stripe
      </div>
    </div>
  )
}
