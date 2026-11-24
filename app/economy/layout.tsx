import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal economy: GDP, inflation and public finance',
  description: 'Explore Nepal economic indicators from the World Bank and IMF, including GDP growth, inflation, trade, debt and forecasts.',
  path: '/economy',
})

export default function EconomyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
