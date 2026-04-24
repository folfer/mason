import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Assinatura confirmada!' }

export default async function SubscribeSuccessPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao Mason Daily!
        </h1>
        <p className="text-muted-foreground">
          Sua assinatura foi confirmada. Você agora tem acesso completo a todo o
          conteúdo exclusivo para irmãos maçons.
        </p>
        <Link href="/news">
          <Button variant="gold" size="lg" className="gap-2">
            <BookOpen className="h-5 w-5" />
            Acessar as notícias
          </Button>
        </Link>
      </div>
    </div>
  )
}
