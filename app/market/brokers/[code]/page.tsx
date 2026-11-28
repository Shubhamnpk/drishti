import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketBrokerDetail } from '@/components/market-broker-detail'
import { fetchNepseBrokerActivity, fetchNepseTopBrokers } from '@/lib/nepse'
import { formatNpr, formatNprOrNA } from '@/lib/currency'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ code: string }> }

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = Number((await params).code)
  const brokers = await fetchNepseTopBrokers()
  const broker = brokers.find(item => item.memberCode === code)
  if (!broker) return { title: 'Broker not found' }
  return pageMetadata({
    title: `Broker ${broker.memberCode}: ${broker.memberName}`,
    description: `${broker.memberName}, NEPSE member broker ${broker.memberCode}. ${formatNprOrNA(formatNpr(broker.turnover30d))} traded over 30 days, latest session buy and sell flow, branches and contact details.`,
    path: `/market/brokers/${broker.memberCode}`,
    // ~90 broker pages churn with every session and are thin on their own.
    // Reachable for people, kept out of the index like the symbol pages.
    noindex: true,
  })
}

export default async function BrokerPage({ params }: Props) {
  const code = Number((await params).code)
  if (!Number.isFinite(code) || code <= 0) notFound()

  const brokers = await fetchNepseTopBrokers()
  const broker = brokers.find(item => item.memberCode === code)
  if (!broker) notFound()

  const activity = await fetchNepseBrokerActivity(broker.memberCode)
  const rank = brokers.findIndex(item => item.memberCode === broker.memberCode) + 1

  return (
    <MarketBrokerDetail
      broker={broker}
      activity={activity}
      rank={{ byTurnover30d: rank, of: brokers.length }}
      marketSessionTurnover={brokers.reduce((sum, item) => sum + item.latestTurnover, 0)}
    />
  )
}
