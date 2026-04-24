'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { completeMasonicProfile } from '../actions'

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

export function CompleteProfileForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cpf, setCpf] = useState('')
  const [cargo, setCargo] = useState('')
  const [loja, setLoja] = useState('')
  const [grau, setGrau] = useState('')
  const [level, setLevel] = useState('')

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cpfClean = cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      setError('CPF inválido.')
      return
    }
    if (!cargo) {
      setError('Selecione seu cargo.')
      return
    }
    if (!grau) {
      setError('Selecione seu grau.')
      return
    }
    if (!level) {
      setError('Selecione seu nível.')
      return
    }
    setLoading(true)
    setError('')

    const result = await completeMasonicProfile({
      userId,
      cpf: cpfClean,
      cargo,
      loja,
      grau,
      level: level as 'aprendiz' | 'companheiro' | 'mestre',
    })

    if (!result.success) {
      setError(result.error ?? 'Erro ao salvar.')
      setLoading(false)
      return
    }

    router.push('/register/quiz')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              required
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grau</Label>
              <Select value={grau} onValueChange={setGrau}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {GRAUS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loja">Loja</Label>
            <Input
              id="loja"
              placeholder="Nome da sua loja"
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Nível na Maçonaria</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aprendiz">Aprendiz — 1º Grau</SelectItem>
                <SelectItem value="companheiro">Companheiro — 2º Grau</SelectItem>
                <SelectItem value="mestre">Mestre — 3º Grau</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e continuar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
