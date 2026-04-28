'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, Camera, User as UserIcon, CheckCircle2 } from 'lucide-react'
import { updateProfile } from './actions'

// Mirror the lists used at signup (app/(public)/register/RegisterForm.tsx).
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

interface Props {
  user: {
    name: string
    image: string | null
    loja: string | null
    cargo: string | null
    grau: string | null
  }
}

export function ProfileForm({ user }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user.name)
  const [loja, setLoja] = useState(user.loja ?? '')
  const [cargo, setCargo] = useState(user.cargo ?? '')
  const [grau, setGrau] = useState(user.grau ?? '')
  const [imageUrl, setImageUrl] = useState(user.image)

  // If the saved value isn't in the canonical list (e.g. legacy data), keep
  // it as a one-off option so the Select can render it.
  const cargoOptions = cargo && !CARGOS.includes(cargo) ? [cargo, ...CARGOS] : CARGOS
  const grauOptions = grau && !GRAUS.includes(grau) ? [grau, ...GRAUS] : GRAUS
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [pending, startTransition] = useTransition()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máximo 5 MB)')
      return
    }
    setError('')
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSavedAt(null)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('loja', loja)
    formData.set('cargo', cargo)
    formData.set('grau', grau)
    if (pendingFile) formData.set('avatar', pendingFile)

    startTransition(async () => {
      try {
        const result = await updateProfile(formData)
        if (result.imageUrl) setImageUrl(result.imageUrl)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }
        setPendingFile(null)
        setSavedAt(new Date())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao salvar')
      }
    })
  }

  const displayUrl = previewUrl ?? imageUrl

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
              {displayUrl ? (
                // Avatars are remote URLs (MinIO via /api/storage or Google OAuth);
                // a plain <img> avoids needing remotePatterns updates.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayUrl}
                  alt={name || 'Foto de perfil'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending}
              >
                <Camera className="h-4 w-4" />
                {imageUrl || previewUrl ? 'Alterar foto' : 'Adicionar foto'}
              </Button>
              {pendingFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Será enviada ao salvar.
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loja">Loja</Label>
              <Input
                id="loja"
                value={loja}
                onChange={(e) => setLoja(e.target.value)}
                maxLength={200}
                placeholder="Nome da sua Loja"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger id="cargo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {cargoOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grau">Grau</Label>
              <Select value={grau} onValueChange={setGrau}>
                <SelectTrigger id="grau">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {grauOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar alterações
            </Button>
            {savedAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                Salvo
              </span>
            )}
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
