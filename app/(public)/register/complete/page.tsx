import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CompleteProfileForm } from './CompleteProfileForm'

export const metadata: Metadata = { title: 'Completar Perfil' }

export default async function CompleteProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/register')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete seu perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Precisamos de mais algumas informações para liberar seu acesso
          </p>
        </div>
        <CompleteProfileForm userId={session.user.id} />
      </div>
    </div>
  )
}
