import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Government Agencies Directory · Nepal Public Offices & Services',
  description:
    'Search and explore all government agencies across Nepal: federal ministries, constitutional bodies, provincial ministries, 77 district administration offices (DAO, DPO, courts, land revenue), and 753 municipal local governments.',
  path: '/agencies',
})

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return children
}
