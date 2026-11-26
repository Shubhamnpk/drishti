import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { DocumentViewerProvider } from '@/components/document-viewer-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WebsiteStructuredData } from '@/components/website-structured-data'
import { OG_IMAGE } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Nepal Public Data & Accountability`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Explore Nepal public data in one place: government company finances, infrastructure progress, NEPSE, procurement, weather, disasters and official source records.',
  applicationName: SITE_NAME,
  category: 'public data',
  verification: {
    google: 'EFpFXOWm0uDbsHZn9Zx68YEIj2kVVUUNQ_idK3tzPr0',
  },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'en_NP',
    siteName: SITE_NAME,
    title: {
      default: `${SITE_NAME} · Nepal Public Data & Accountability`,
      template: `%s | ${SITE_NAME}`,
    },
    description: 'Explore Nepal public data, government company finances, infrastructure progress, markets and live environment feeds.',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: `${SITE_NAME} · Nepal Public Data & Accountability`,
      template: `%s | ${SITE_NAME}`,
    },
    description: 'Explore Nepal public data, government company finances, infrastructure progress, markets and live environment feeds.',
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f14' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <WebsiteStructuredData />
        <ThemeProvider>
          <DocumentViewerProvider>
            <div className="app-shell">
              <Header />
              {children}
              <Footer />
            </div>
          </DocumentViewerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
