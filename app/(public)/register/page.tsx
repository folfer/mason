import { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Cadastro' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Cadastro
          </p>
          <h1 className="heading-serif text-4xl text-foreground mb-2">
            Junte-se ao Oriente
          </h1>
          <p className="text-muted-foreground text-sm">
            Crie sua conta e acesse o conteúdo exclusivo para irmãos maçons
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-7 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <RegisterForm />
        </div>

        <p className="text-center text-xs text-muted-foreground/40 italic font-serif mt-6">
          Ordo Ab Chao
        </p>
      </div>
    </div>
  )
}
