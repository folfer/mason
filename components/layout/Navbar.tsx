'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Settings, BookOpen, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const levelLabels: Record<string, string> = {
  aprendiz: 'Aprendiz',
  companheiro: 'Companheiro',
  mestre: 'Mestre',
}

const levelVariants: Record<string, 'aprendiz' | 'companheiro' | 'mestre'> = {
  aprendiz: 'aprendiz',
  companheiro: 'companheiro',
  mestre: 'mestre',
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#080806]/95 backdrop-blur-md border-b border-border shadow-[0_1px_20px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <CompassIcon className="h-5 w-5 text-primary transition-transform duration-500 group-hover:rotate-45" />
            <span className="text-base font-semibold tracking-wide text-foreground">
              Mason{' '}
              <span className="text-primary font-bold">Daily</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/news"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Notícias
                </Link>

                {user?.level && (
                  <Badge variant={levelVariants[user.level] ?? 'default'}>
                    {levelLabels[user.level] ?? user.level}
                  </Badge>
                )}

                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                      <Settings className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </Link>
                )}

                <div className="h-4 w-px bg-border mx-1" />

                <Link href="/profile">
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gold" size="sm">
                    Começar agora
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-[#11100D] px-4 py-4 space-y-2">
            {session ? (
              <>
                <Link
                  href="/news"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  Notícias
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Entrar</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="gold" className="w-full">Começar agora</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      {/* Spacer to push content below fixed header */}
      <div className="h-16" />
    </>
  )
}
