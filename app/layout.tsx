import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://coluna.oriente.news'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mason Daily — O Jornal da Maçonaria',
    template: '%s | Mason Daily',
  },
  description:
    'Notícias, artigos e reflexões maçônicas curados por grau. Conteúdo exclusivo para Aprendizes, Companheiros e Mestres — de irmão para irmão.',
  applicationName: 'Mason Daily',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'maçonaria',
    'maçonaria brasileira',
    'jornal maçônico',
    'notícias maçônicas',
    'irmão maçom',
    'loja maçônica',
    'aprendiz maçom',
    'companheiro maçom',
    'mestre maçom',
    'grau maçônico',
    'oriente',
    'simbolismo maçônico',
    'ritual maçônico',
  ],
  authors: [{ name: 'Oriente' }],
  creator: 'Oriente',
  publisher: 'Oriente',
  category: 'news',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Mason Daily',
    title: 'Mason Daily — O Jornal da Maçonaria',
    description:
      'Conhecimento maçônico curado por grau. Notícias, reflexões e conteúdo exclusivo — de irmão para irmão.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mason Daily — O Jornal da Maçonaria',
    description:
      'Conhecimento maçônico curado por grau. Notícias, reflexões e conteúdo exclusivo — de irmão para irmão.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#080806',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Mason Daily',
              alternateName: 'O Jornal da Maçonaria',
              url: siteUrl,
              inLanguage: 'pt-BR',
              publisher: {
                '@type': 'Organization',
                name: 'Oriente',
                url: siteUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/icon.svg`,
                },
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
