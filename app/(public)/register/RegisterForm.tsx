'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Globe, Check, FileText, Upload } from 'lucide-react'
import { completeMasonicProfile, submitRegistrationCertificate } from './actions'
import { cn } from '@/lib/utils'

const CARGOS = [
  'Venerável Mestre',
  'Primeiro Vigilante',
  'Segundo Vigilante',
  'Orador',
  'Secretário',
  'Tesoureiro',
  'Chanceler',
  'Hospitaleiro',
  'Mestre de Cerimônias',
  'Porta-Estandarte',
  'Guarda do Templo Interno',
  'Guarda do Templo Externo',
  'Experto',
  'Diácono',
  'Irmão',
]

const GRAUS = Array.from({ length: 33 }, (_, i) => `${i + 1}º Grau`)

type Step = 'account' | 'masonic'

const STEPS = [
  { key: 'account', label: 'Conta' },
  { key: 'masonic', label: 'Dados Maçônicos' },
] as const

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [cpf, setCpf] = useState('')
  const [cargo, setCargo] = useState('')
  const [loja, setLoja] = useState('')
  const [grau, setGrau] = useState('')
  const [level, setLevel] = useState('')
  const [certificate, setCertificate] = useState<File | null>(null)
  const certificateInputRef = useRef<HTMLInputElement>(null)

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn.social({ provider: 'google', callbackURL: '/register' })
  }

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.')
      return
    }
    setStep('masonic')
    setError('')
  }

  async function handleMasonicStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cpfClean = cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      setError('CPF inválido. Digite os 11 dígitos.')
      setLoading(false)
      return
    }
    if (!cargo) { setError('Selecione seu cargo.'); setLoading(false); return }
    if (!grau) { setError('Selecione seu grau.'); setLoading(false); return }
    if (!level) { setError('Selecione seu nível.'); setLoading(false); return }
    if (!certificate) {
      setError('Anexe o certificado do grau para verificação.')
      setLoading(false)
      return
    }
    if (certificate.size > 10 * 1024 * 1024) {
      setError('Certificado muito grande (máximo 10 MB).')
      setLoading(false)
      return
    }

    const result = await signUp.email({ email, password, name, callbackURL: '/news' })

    if (result.error) {
      setError(result.error.message ?? 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    const userId = result.data?.user?.id
    if (!userId) {
      setError('Erro ao obter ID do usuário.')
      setLoading(false)
      return
    }

    const profileResult = await completeMasonicProfile({
      userId,
      cpf: cpfClean,
      cargo,
      loja,
      grau,
      level: level as 'aprendiz' | 'companheiro' | 'mestre',
    })

    if (!profileResult.success) {
      setError(profileResult.error ?? 'Erro ao salvar perfil.')
      setLoading(false)
      return
    }

    const certForm = new FormData()
    certForm.set('userId', userId)
    certForm.set('level', level)
    certForm.set('certificate', certificate)
    const certResult = await submitRegistrationCertificate(certForm)

    if (!certResult.success) {
      setError(certResult.error ?? 'Erro ao enviar certificado.')
      setLoading(false)
      return
    }

    router.push('/news')
  }

  const stepIndex = step === 'account' ? 0 : 1

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const isActive = i === stepIndex
          const isDone = i < stepIndex
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border',
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_12px_rgba(198,161,91,0.3)]'
                      : isDone
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-transparent border-border text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'text-xs whitespace-nowrap transition-colors',
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1 mx-3 mb-5 transition-colors duration-300',
                    isDone ? 'bg-primary/40' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Form content */}
      {step === 'account' ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Cadastrar com Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleAccountStep} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
                Nome completo
              </Label>
              <Input id="name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" placeholder="irmao@loja.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
                Senha
              </Label>
              <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="gold" className="w-full">
              Continuar
            </Button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleMasonicStep} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-xs uppercase tracking-widest text-muted-foreground">
              CPF
            </Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              required
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CARGOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Grau</Label>
              <Select value={grau} onValueChange={setGrau}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {GRAUS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loja" className="text-xs uppercase tracking-widest text-muted-foreground">
              Loja
            </Label>
            <Input id="loja" placeholder="Nome da sua loja" value={loja} onChange={(e) => setLoja(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Nível na Maçonaria
            </Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue placeholder="Selecione seu nível" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aprendiz">Aprendiz — 1º Grau</SelectItem>
                <SelectItem value="companheiro">Companheiro — 2º Grau</SelectItem>
                <SelectItem value="mestre">Mestre — 3º Grau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Certificado do Grau
            </Label>
            <input
              ref={certificateInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setCertificate(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => certificateInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-md border border-dashed border-border bg-surface/40 px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-surface"
            >
              {certificate ? (
                <>
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {certificate.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(certificate.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <span className="text-xs text-primary">Trocar</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Anexar certificado</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG, PNG ou WEBP — até 10 MB
                    </p>
                  </div>
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              O certificado passará por aprovação do administrador antes de liberar o conteúdo do seu grau.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setStep('account'); setError('') }}
            >
              Voltar
            </Button>
            <Button type="submit" variant="gold" className="flex-1" disabled={loading || !level}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continuar
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  )
}
