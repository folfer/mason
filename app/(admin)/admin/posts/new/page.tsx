import { Metadata } from 'next'
import { PostEditor } from '../PostEditor'

export const metadata: Metadata = { title: 'Novo Post — Admin' }

export default function NewPostPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Post</h1>
        <p className="text-sm text-muted-foreground">
          Crie um novo artigo para o Mason Daily
        </p>
      </div>
      <PostEditor />
    </div>
  )
}
