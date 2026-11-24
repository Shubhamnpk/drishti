import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal weather, air quality and environmental alerts',
  description: 'Monitor Nepal weather forecasts, air quality, river conditions, earthquakes and disaster alerts from public feeds.',
  path: '/environment',
})

export default function EnvironmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
