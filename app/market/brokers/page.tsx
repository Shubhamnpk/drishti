import type { Metadata } from 'next'
import { MarketBrokerDirectory } from '@/components/market-broker-directory'
import { fetchNepseTopBrokers } from '@/lib/nepse'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'NEPSE broker directory',
  description: 'Every active NEPSE member broker ranked by 30-day turnover, with latest session activity, branch counts, coverage districts and member ratings.',
  path: '/market/brokers',
})

export const revalidate = 300

export default async function BrokersPage() {
  const brokers = await fetchNepseTopBrokers()
  return <MarketBrokerDirectory brokers={brokers} />
}
