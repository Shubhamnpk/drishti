import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal disaster incidents, relief and risk data',
  description: 'Explore official Nepal disaster incident records, reported damage, relief distributions and disaster risk data from BIPAD.',
  path: '/disasters',
})

export default function DisastersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
