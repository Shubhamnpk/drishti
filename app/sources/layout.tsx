import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal public data sources and evidence registry',
  description: 'Review the government, multilateral and open data sources behind Drishti’s Nepal public accountability records.',
  path: '/sources',
})

export default function SourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
