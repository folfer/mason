import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { LayoutDashboard, FileText, HelpCircle, Users, MessageSquare, ArrowLeft } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/posts', icon: FileText, label: 'Posts' },
  { href: '/admin/comments', icon: MessageSquare, label: 'Comentários' },
  { href: '/admin/quiz', icon: HelpCircle, label: 'Quiz' },
  { href: '/admin/users', icon: Users, label: 'Usuários' },
]

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user || user.role !== 'admin') redirect('/news')

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-border bg-surface flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <CompassIcon className="h-5 w-5 text-primary transition-transform duration-500 group-hover:rotate-45" />
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">
                Mason <span className="text-primary">Daily</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Painel Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group"
            >
              <Icon className="h-4 w-4 flex-shrink-0 group-hover:text-primary transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/news"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-surface/50 flex items-center px-6 flex-shrink-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Área administrativa
          </p>
        </header>

        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
