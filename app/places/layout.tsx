import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal provinces, districts and local units',
  description: 'Browse profiles and public data for Nepal’s seven provinces, 77 districts and 753 local units.',
  path: '/places',
})

export default function PlacesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
