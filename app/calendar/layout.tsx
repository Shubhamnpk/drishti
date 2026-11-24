import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal public calendar, holidays and market dates',
  description: 'Browse Nepal public holidays, fiscal dates and market events in the Bikram Sambat and Gregorian calendars.',
  path: '/calendar',
})

export default function CalendarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
