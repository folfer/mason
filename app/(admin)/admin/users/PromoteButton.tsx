'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'
import { promoteUser } from './actions'

export function PromoteButton({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isAdmin = currentRole === 'admin'

  async function handleClick() {
    if (
      !confirm(
        isAdmin
          ? 'Remover permissão de admin deste usuário?'
          : 'Promover este usuário a admin?'
      )
    )
      return
    setLoading(true)
    await promoteUser(userId, isAdmin ? 'user' : 'admin')
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={loading}
      title={isAdmin ? 'Remover admin' : 'Promover a admin'}
      className={isAdmin ? 'text-primary' : 'text-muted-foreground'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAdmin ? (
        <Shield className="h-4 w-4" />
      ) : (
        <ShieldOff className="h-4 w-4" />
      )}
    </Button>
  )
}
