import Link from 'next/link'

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

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <CompassIcon className="h-5 w-5 text-primary transition-transform duration-500 group-hover:rotate-45" />
              <span className="text-base font-semibold text-foreground">
                Mason <span className="text-primary">Daily</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              O jornal digital exclusivo para irmãos maçons. Conhecimento,
              tradição e fraternidade em um só lugar.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground/60">
              <div className="w-4 h-px bg-border" />
              <span className="font-serif italic">Ordo Ab Chao</span>
              <div className="w-4 h-px bg-border" />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:pl-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
                Acesso
              </p>
              <ul className="space-y-2.5">
                {[
                  { href: '/login', label: 'Entrar' },
                  { href: '/register', label: 'Cadastrar' },
                  { href: '/subscribe', label: 'Assinar' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
                Conteúdo
              </p>
              <ul className="space-y-2.5">
                {[
                  { href: '/news', label: 'Notícias' },
                  { href: '/profile', label: 'Meu Perfil' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Mason Daily. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/40 italic font-serif">
            Feito com fraternidade.
          </p>
        </div>
      </div>
    </footer>
  )
}
