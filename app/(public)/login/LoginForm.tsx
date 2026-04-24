'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Globe } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn.email({ email, password, callbackURL: '/news' })

    if (result.error) {
      setError('Email ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/news')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn.social({ provider: 'google', callbackURL: '/register' })
  }

  return (
    <div className="space-y-5">
      {/* Google */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        Entrar com Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-widest">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="irmao@loja.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-widest">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" variant="gold" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
