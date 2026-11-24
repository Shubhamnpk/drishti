import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Search Nepal public data',
  description: 'Search Nepal provinces, districts, palikas, NEPSE stocks, public companies, infrastructure projects, open datasets and sources.',
  path: '/search',
  noindex: true,
})

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
