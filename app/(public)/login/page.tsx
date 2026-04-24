import { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Área restrita
          </p>
          <h1 className="heading-serif text-4xl text-foreground mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre na sua conta para acessar o Mason Daily
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-7 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <LoginForm />
        </div>

        {/* Ornament */}
        <p className="text-center text-xs text-muted-foreground/40 italic font-serif mt-6">
          Ordo Ab Chao
        </p>
      </div>
    </div>
  )
}
