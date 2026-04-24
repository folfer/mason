import { Metadata } from 'next'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DeletePostButton } from './DeletePostButton'

export const metadata: Metadata = { title: 'Posts — Admin' }

const levelLabels: Record<string, string> = {
  all: 'Todos',
  aprendiz: 'Aprendiz',
  companheiro: 'Companheiro',
  mestre: 'Mestre',
}

export default async function AdminPostsPage() {
  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: { author: { columns: { name: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground text-sm">{allPosts.length} artigos no total</p>
        </div>
        <Link href="/admin/posts/new">
          <Button variant="gold">
            <Plus className="h-4 w-4 mr-2" />
            Novo post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Título</th>
              <th className="text-left px-4 py-3 font-medium">Nível</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allPosts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={(post.accessLevel as any) === 'all' ? 'secondary' : (post.accessLevel as any)}>
                    {levelLabels[post.accessLevel]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={post.published ? 'default' : 'outline'}>
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}

            {allPosts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum post ainda.{' '}
                  <Link href="/admin/posts/new" className="text-primary hover:underline">
                    Criar o primeiro
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
