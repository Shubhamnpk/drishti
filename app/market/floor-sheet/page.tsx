import type { Metadata } from 'next'
import { MarketFloorSheet } from '@/components/market-floor-sheet'
import { fetchNepseFloorSheetOverview, fetchNepseFloorSheetPage, fetchNepseTopBrokers } from '@/lib/nepse'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'NEPSE floor sheet',
  description: 'Every matched contract on the Nepal Stock Exchange: time, security, buyer, seller, quantity, rate and value, with filters by security and broker.',
  path: '/market/floor-sheet',
})

export const revalidate = 300

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function FloorSheetPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const pick = (key: string): string => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value) ?? ''
  }

  const symbol = pick('symbol').trim().toUpperCase()
  const broker = Number(pick('broker')) || 0
  const minAmount = Number(pick('min')) || 0
  const sortParam = pick('sort')
  const sort = sortParam === 'time' || sortParam === 'qty' ? sortParam : 'amount'
  const page = Math.max(1, Number(pick('page')) || 1)

  const [overview, sheet, brokers] = await Promise.all([
    fetchNepseFloorSheetOverview(),
    fetchNepseFloorSheetPage({ symbol, broker, minAmount, sort, page }),
    fetchNepseTopBrokers(),
  ])

  return (
    <MarketFloorSheet
      overview={overview}
      sheet={sheet}
      brokers={brokers}
      filters={{ symbol, broker, minAmount, sort }}
    />
  )
}
