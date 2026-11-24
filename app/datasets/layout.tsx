import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal open data catalog',
  description: 'Search public datasets about Nepal from Open Data Nepal and other documented sources.',
  path: '/datasets',
})

export default function DatasetsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
