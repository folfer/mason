'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
} from 'lucide-react'
import {
  updateUser,
  resetUserPassword,
  revokeUserSessions,
  deleteUser,
} from '../actions'
import type { User, MasonicLevel } from '@/lib/db/schema'

const LEVEL_NONE = '__none__'

interface Props {
  user: User
  providers: string[]
  hasCredential: boolean
}

export function UserDetailForm({ user, providers, hasCredential }: Props) {
  const router = useRouter()

  // Profile fields
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [cpf, setCpf] = useState(user.cpf ?? '')
  const [cargo, setCargo] = useState(user.cargo ?? '')
  const [loja, setLoja] = useState(user.loja ?? '')
  const [grau, setGrau] = useState(user.grau ?? '')
  const [level, setLevel] = useState<MasonicLevel | null>(user.level)
  const [levelVerified, setLevelVerified] = useState(user.levelVerified)
  const [emailVerified, setEmailVerified] = useState(user.emailVerified)
  const [onboardingComplete, setOnboardingComplete] = useState(
    user.onboardingComplete
  )
  const [role, setRole] = useState<'user' | 'admin'>(
    (user.role as 'user' | 'admin') ?? 'user'
  )

  // Save state
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, startSave] = useTransition()

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [resetting, startReset] = useTransition()

  // Sessions/delete state
  const [revoking, startRevoke] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [actionError, setActionError] = useState('')

  function handleSave() {
    setSaveError('')
    setSaveSuccess(false)
    startSave(async () => {
      try {
        await updateUser(user.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          cpf: cpf.trim() || null,
          cargo: cargo.trim() || null,
          loja: loja.trim() || null,
          grau: grau.trim() || null,
          level,
          levelVerified,
          emailVerified,
          onboardingComplete,
          role,
        })
        setSaveSuccess(true)
        router.refresh()
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  function handleResetPassword() {
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 8) {
      setPwError('A senha deve ter ao menos 8 caracteres')
      return
    }
    if (
      !confirm(
        `Definir nova senha para ${user.email}? Todas as sessões ativas serão encerradas.`
      )
    )
      return

    startReset(async () => {
      try {
        await resetUserPassword(user.id, newPassword)
        setPwSuccess(true)
        setNewPassword('')
      } catch (err) {
        setPwError(err instanceof Error ? err.message : 'Erro ao resetar senha')
      }
    })
  }

  function handleRevokeSessions() {
    setActionError('')
    if (!confirm('Encerrar todas as sessões ativas deste usuário?')) return
    startRevoke(async () => {
      try {
        await revokeUserSessions(user.id)
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Erro ao encerrar sessões'
        )
      }
    })
  }

  function handleDelete() {
    setActionError('')
    if (
      !confirm(
        `Excluir permanentemente o usuário ${user.email}? Esta ação não pode ser desfeita.`
      )
    )
      return
    startDelete(async () => {
      try {
        await deleteUser(user.id)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Erro ao excluir')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
            {role === 'admin' ? 'Admin' : 'Usuário'}
          </Badge>
          {user.subscriptionStatus && (
            <Badge
              variant={
                user.subscriptionStatus === 'active'
                  ? 'default'
                  : 'destructive'
              }
            >
              Assinatura: {user.subscriptionStatus}
            </Badge>
          )}
          {providers.length > 0 ? (
            providers.map((p) => (
              <Badge key={p} variant="secondary" className="capitalize">
                {p}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary">sem provedor</Badge>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) =>
                  setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))
                }
                placeholder="00000000000"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loja">Loja</Label>
              <Input
                id="loja"
                value={loja}
                onChange={(e) => setLoja(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grau">Grau</Label>
              <Input
                id="grau"
                value={grau}
                onChange={(e) => setGrau(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nível maçônico</Label>
              <Select
                value={level ?? LEVEL_NONE}
                onValueChange={(v) =>
                  setLevel(v === LEVEL_NONE ? null : (v as MasonicLevel))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LEVEL_NONE}>—</SelectItem>
                  <SelectItem value="aprendiz">Aprendiz</SelectItem>
                  <SelectItem value="companheiro">Companheiro</SelectItem>
                  <SelectItem value="mestre">Mestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cargo de acesso</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as 'user' | 'admin')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={levelVerified}
                onChange={(e) => setLevelVerified(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Nível verificado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailVerified}
                onChange={(e) => setEmailVerified(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Email verificado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onboardingComplete}
                onChange={(e) => setOnboardingComplete(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">Onboarding concluído</span>
            </label>
          </div>

          {saveError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded px-2 py-1.5">
              Alterações salvas.
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password reset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {hasCredential
              ? 'Definir uma nova senha encerra todas as sessões ativas do usuário.'
              : 'Este usuário ainda não possui senha (login social). Definir uma senha permitirá login por email + senha.'}
          </p>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {pwError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5">
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 rounded px-2 py-1.5">
              Senha redefinida com sucesso.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleResetPassword}
              disabled={resetting || newPassword.length === 0}
              className="gap-2"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Redefinir senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">
            Zona de risco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5">
              {actionError}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">Encerrar sessões</p>
              <p className="text-xs text-muted-foreground">
                Faz logout em todos os dispositivos do usuário.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRevokeSessions}
              disabled={revoking}
              className="gap-2"
            >
              {revoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Encerrar sessões
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">Excluir usuário</p>
              <p className="text-xs text-muted-foreground">
                Remove o usuário e todos os dados associados. Não reversível.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
