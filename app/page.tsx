import Link from 'next/link'
import { ArrowRight, Check, BookOpen, Shield, Star, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Stagger, StaggerItem, FadeUp, FadeIn } from '@/components/ui/animate'

const features = [
  {
    icon: BookOpen,
    title: 'Conteúdo Exclusivo',
    description: 'Artigos, notícias e reflexões sobre a Maçonaria, curados para cada grau maçônico.',
  },
  {
    icon: Shield,
    title: 'Verificação de Grau',
    description: 'Acesso verificado por quiz de 3 perguntas específicas para cada nível maçônico.',
  },
  {
    icon: Star,
    title: 'Três Níveis',
    description: 'Conteúdo segmentado para Aprendizes, Companheiros e Mestres.',
  },
  {
    icon: Compass,
    title: 'CMS Próprio',
    description: 'Publicações gerenciadas pelo Oriente com editor rico e upload de imagens.',
  },
]

const levels = [
  {
    roman: 'I',
    name: 'Aprendiz',
    subtitle: '1º Grau',
    description: 'Acesso às notícias e artigos introdutórios. A jornada começa com o primeiro passo na Câmara de Reflexão.',
    color: 'from-blue-600/5 to-blue-600/0',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    textColor: 'text-blue-400',
  },
  {
    roman: 'II',
    name: 'Companheiro',
    subtitle: '2º Grau',
    description: 'Conteúdo do segundo grau e todo o conteúdo disponível para Aprendizes. A busca pela perfeição.',
    color: 'from-purple-600/5 to-purple-600/0',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
    textColor: 'text-purple-400',
  },
  {
    roman: 'III',
    name: 'Mestre',
    subtitle: '3º Grau',
    description: 'Acesso completo e irrestrito a todo o conteúdo da plataforma. A verdadeira palavra do Mestre.',
    color: 'from-primary/8 to-primary/0',
    borderColor: 'border-primary/30 hover:border-primary/60',
    textColor: 'text-primary',
  },
]

const testimonials = [
  {
    quote: 'Uma plataforma que finalmente respeita a profundidade do conhecimento maçônico.',
    author: 'Irmão V.M.',
    lodge: 'Loja Fraternidade',
  },
  {
    quote: 'O conteúdo segmentado por grau é exatamente o que precisávamos há anos.',
    author: 'Irmão Secretário',
    lodge: 'Loja Luz do Oriente',
  },
  {
    quote: 'Elegante, funcional e respeitoso com nossa tradição. Parabéns ao Oriente.',
    author: 'Irmão Orador',
    lodge: 'Loja Pitagórica',
  },
]

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden texture-grid">
          {/* Background radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[80px]" />
          </div>

          <div className="relative container mx-auto px-4 py-24 text-center max-w-4xl">
            {/* Badge */}
            <div className="animate-fade-in inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-primary/90">
                Portal exclusivo para Irmãos Maçons
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up heading-serif text-6xl sm:text-7xl lg:text-8xl mb-6 text-foreground">
              Mason{' '}
              <span className="text-gold-gradient">Daily</span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up animate-delay-100 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Conhecimento maçônico curado por grau. Notícias, reflexões e
              conteúdo exclusivo — de irmão para irmão.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up animate-delay-200 flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" variant="gold" className="gap-2 px-8">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="animate-fade-up animate-delay-300 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {[
                'R$9,90/mês',
                'Cancele quando quiser',
                'Verificação por grau',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── Features ── */}
        <section className="py-24 container mx-auto px-4 max-w-5xl">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              A plataforma
            </p>
            <h2 className="heading-serif text-4xl sm:text-5xl text-foreground">
              Tudo que você precisa
            </h2>
          </FadeUp>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="group rounded-xl border border-border bg-surface p-6 hover:border-primary/40 hover:bg-surface-elevated transition-all duration-300 h-full">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Ornament divider ── */}
        <div className="container mx-auto px-4 max-w-xl">
          <div className="ornament-divider">◆</div>
        </div>

        {/* ── Levels ── */}
        <section className="py-24 bg-surface/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <FadeUp className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Conteúdo por grau
              </p>
              <h2 className="heading-serif text-4xl sm:text-5xl text-foreground mb-4">
                Acesso ao seu nível
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Cada grau tem seu conteúdo. A verificação é feita por um quiz de 3 perguntas.
              </p>
            </FadeUp>

            <Stagger className="grid sm:grid-cols-3 gap-6">
              {levels.map(({ roman, name, subtitle, description, color, borderColor, textColor }) => (
                <StaggerItem key={name}>
                  <div className={`relative rounded-xl border bg-gradient-to-b ${color} ${borderColor} bg-surface p-7 transition-all duration-300 h-full flex flex-col`}>
                    <div className={`heading-serif text-5xl font-bold mb-4 ${textColor} opacity-60`}>
                      {roman}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
                    <p className={`text-xs font-medium uppercase tracking-widest mb-4 ${textColor}`}>
                      {subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Quote / Manifesto ── */}
        <FadeIn>
          <section className="py-24 container mx-auto px-4 max-w-3xl text-center">
            <div className="ornament-divider mb-10">◆</div>
            <blockquote className="heading-serif text-3xl sm:text-4xl font-medium italic text-foreground/80 leading-snug mb-6">
              &ldquo;O conhecimento é o único tesouro que cresce quando compartilhado
              entre irmãos.&rdquo;
            </blockquote>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Sabedoria Maçônica
            </p>
            <div className="ornament-divider mt-10">◆</div>
          </section>
        </FadeIn>

        {/* ── Testimonials ── */}
        <section className="py-20 bg-surface/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <FadeUp className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Depoimentos
              </p>
              <h2 className="heading-serif text-4xl text-foreground">
                O que dizem nossos irmãos
              </h2>
            </FadeUp>
            <Stagger className="grid sm:grid-cols-3 gap-6">
              {testimonials.map(({ quote, author, lodge }) => (
                <StaggerItem key={author}>
                  <div className="rounded-xl border border-border bg-surface p-6 h-full flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed italic flex-1 mb-5">
                      &ldquo;{quote}&rdquo;
                    </p>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground">{author}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lodge}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-24 container mx-auto px-4 max-w-xl text-center">
          <FadeUp>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Assinatura
            </p>
            <h2 className="heading-serif text-4xl sm:text-5xl text-foreground mb-12">
              Acesso por apenas
            </h2>
            <div className="rounded-2xl border border-primary/30 bg-surface p-8 shadow-[0_0_60px_rgba(198,161,91,0.07)]">
              <div className="mb-6">
                <span className="heading-serif text-6xl font-bold text-primary">R$&thinsp;9</span>
                <span className="heading-serif text-3xl text-primary">,90</span>
                <span className="text-muted-foreground text-lg">/mês</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                {[
                  'Acesso a todos os artigos e notícias',
                  'Conteúdo exclusivo por grau maçônico',
                  'Publicações semanais do Oriente',
                  'Arquivo histórico completo',
                  'Cancele quando quiser',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="gold" size="lg" className="w-full gap-2">
                  Criar conta e assinar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                Pagamento seguro via Stripe. Cancele quando quiser.
              </p>
            </div>
          </FadeUp>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative py-24 overflow-hidden texture-grid">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          </div>
          <div className="relative container mx-auto px-4 max-w-2xl text-center">
            <FadeUp>
              <div className="ornament-divider mb-8">◆</div>
              <h2 className="heading-serif text-4xl sm:text-5xl text-foreground mb-5">
                Pronto para entrar no Oriente?
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Cadastre-se, comprove seu grau e acesse conteúdo exclusivo por apenas R$9,90/mês.
              </p>
              <Link href="/register">
                <Button size="lg" variant="gold" className="gap-2 px-10">
                  Criar conta gratuita
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="ornament-divider mt-8">◆</div>
            </FadeUp>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
