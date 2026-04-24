'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, Eye, Upload, X, Image as ImageIcon } from 'lucide-react'
import { createPost, updatePost } from './actions'
import type { Post, AccessLevel } from '@/lib/db/schema'

interface PostEditorProps {
  post?: Post
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? '')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(
    (post?.accessLevel as AccessLevel) ?? 'all'
  )
  const [content, setContent] = useState<object>(
    (post?.content as object) ?? {}
  )
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 10MB.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Erro no upload')
      setCoverImageUrl(data.url)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao enviar imagem.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(published: boolean) {
    if (!title.trim()) {
      setError('O título é obrigatório.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (post) {
        await updatePost(post.id, {
          title,
          content,
          excerpt,
          coverImageUrl,
          accessLevel,
          published,
        })
        router.push('/admin/posts')
      } else {
        const result = await createPost({
          title,
          content,
          excerpt,
          coverImageUrl,
          accessLevel,
          published,
        })
        if (result.success) router.push('/admin/posts')
      }
    } catch {
      setError('Erro ao salvar post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título do artigo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Textarea
              id="excerpt"
              placeholder="Breve descrição do artigo (aparece no feed)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Escreva o conteúdo do artigo aqui..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Access level */}
              <div className="space-y-2">
                <Label>Nível de acesso</Label>
                <Select
                  value={accessLevel}
                  onValueChange={(v) => setAccessLevel(v as AccessLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os assinantes</SelectItem>
                    <SelectItem value="aprendiz">Aprendiz+</SelectItem>
                    <SelectItem value="companheiro">Companheiro+</SelectItem>
                    <SelectItem value="mestre">Somente Mestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <Label>Imagem de capa</Label>

                {/* Preview */}
                {coverImageUrl ? (
                  <div className="relative rounded-md overflow-hidden">
                    <img
                      src={coverImageUrl}
                      alt="Capa"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-accent transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Clique para enviar
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          PNG, JPG, WebP — máx. 10MB
                        </span>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Change button when image exists */}
                {coverImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Trocar imagem
                  </Button>
                )}
              </div>

              <Separator />

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  variant="gold"
                  onClick={() => handleSave(true)}
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Publicar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={loading || uploading}
                >
                  <Save className="h-4 w-4" />
                  Salvar rascunho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
