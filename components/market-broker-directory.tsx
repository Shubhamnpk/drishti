'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Building2, Landmark, MapPin, Search, Star } from 'lucide-react'
import { DataTable, useTableSort, type DataTableColumn } from '@/components/data-table'
import { formatNpr, formatNum } from '@/lib/currency'
import { sortRows, type SortKind } from '@/lib/table-sort'
import type { NepseBroker } from '@/lib/nepse'

type SortKey = 'broker' | 'turnover30d' | 'session' | 'branches' | 'coverage' | 'rating'

const SORT_KINDS: Record<SortKey, SortKind> = {
  broker: 'text',
  turnover30d: 'number',
  session: 'number',
  branches: 'number',
  coverage: 'text',
  rating: 'number',
}

const SORT_ACCESSORS: Record<SortKey, (broker: NepseBroker) => string | number | null | undefined> = {
  broker: broker => broker.memberName,
  turnover30d: broker => broker.turnover30d,
  session: broker => broker.latestTurnover,
  branches: broker => broker.branchCount,
  coverage: broker => broker.districts.join(', '),
  rating: broker => broker.rating?.averageRating ?? null,
}

export function MarketBrokerDirectory({ brokers }: { brokers: NepseBroker[] }) {
  const [query, setQuery] = useState('')
  const { sort, toggleSort } = useTableSort<SortKey>({ key: 'turnover30d', dir: -1 }, SORT_KINDS)

  const total30d = brokers.reduce((sum, broker) => sum + broker.turnover30d, 0)
  const totalSession = brokers.reduce((sum, broker) => sum + broker.latestTurnover, 0)
  const branches = brokers.reduce((sum, broker) => sum + broker.branchCount, 0)
  const districts = new Set(brokers.flatMap(broker => broker.districts))
  const dealers = brokers.filter(broker => broker.isDealer).length
  const rated = brokers.filter(broker => broker.rating)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = brokers.filter(broker => {
      if (!needle) return true
      return broker.memberName.toLowerCase().includes(needle)
        || String(broker.memberCode).includes(needle)
        || broker.districts.some(district => district.toLowerCase().includes(needle))
    })
    return sortRows(filtered, sort, SORT_ACCESSORS)
  }, [brokers, query, sort])

  const columns: DataTableColumn<NepseBroker, SortKey>[] = [
    {
      key: 'broker',
      label: 'Broker',
      align: 'left',
      render: broker => (
        <Link href={`/market/brokers/${broker.memberCode}`} className="market-company-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
          <strong style={{ color: 'var(--text)' }}>{broker.memberName}</strong>
          <span className="stock-meta-chip">#{broker.memberCode}</span>
        </Link>
      ),
    },
    {
      key: 'turnover30d',
      label: '30-day turnover',
      render: broker => (
        <span>
          <strong>{formatNpr(broker.turnover30d)}</strong>
          <span className="data-table-sub">{total30d > 0 ? `${(broker.turnover30d / total30d * 100).toFixed(1)}% of ranked` : ''}</span>
        </span>
      ),
    },
    {
      key: 'session',
      label: 'Session (gross)',
      render: broker => (
        <span>
          {formatNpr(broker.latestTurnover)}
          <span className="data-table-sub">{totalSession > 0 ? `${(broker.latestTurnover / totalSession * 100).toFixed(1)}% of gross` : ''}</span>
        </span>
      ),
    },
    {
      key: 'branches',
      label: 'Branches',
      render: broker => broker.branchCount || 'N/A',
    },
    {
      key: 'coverage',
      label: 'Coverage',
      align: 'left',
      render: broker => broker.districts.length
        ? <span className="broker-districts">{broker.districts.join(', ')}</span>
        : <span className="muted">Not listed</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: broker => broker.rating
        ? (
          <span className="broker-rating">
            <Star size={11} aria-hidden />
            <strong>{broker.rating.averageRating.toFixed(1)}</strong>
            <span className="muted">({broker.rating.totalRatings})</span>
          </span>
        )
        : <span className="muted">N/A</span>,
    },
  ]

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '1rem 0 .8rem', fontSize: '.68rem', color: 'var(--text-tertiary)' }}>
        <Link href="/market" aria-label="Back to market" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: 'inherit', textDecoration: 'none' }}><ArrowLeft size={14} /> Market</Link>
        <span>/</span>
        <span>Brokers</span>
      </div>

      <section className="sector-hero">
        <div className="sector-hero-title">
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>NEPSE member brokers</p>
            <h1>Broker directory</h1>
            <p className="muted">
              {brokers.length} active members · {formatNpr(total30d)} traded over 30 days · {formatNum(branches)} branches across {districts.size} districts
            </p>
          </div>
          <div className="sector-hero-move">
            <span className="eyebrow">Latest session (gross)</span>
            <strong>{formatNpr(totalSession)}</strong>
          </div>
        </div>
        <div className="sector-quick-stats">
          <div><span>Active brokers</span><strong>{brokers.length}</strong></div>
          <div><span>Dealers</span><strong>{dealers}</strong></div>
          <div><span>Rated members</span><strong>{rated.length ? `${rated.length} · ${(rated.reduce((sum, broker) => sum + (broker.rating?.averageRating ?? 0), 0) / rated.length).toFixed(2)} avg` : 'N/A'}</strong></div>
        </div>
      </section>

      <section className="panel" id="brokers">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '.7rem' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Leaderboard</p>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>All active member brokers</h2>
            <p className="muted">Ranked by reported 30-day turnover. Open any broker for its latest session buy and sell flow.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', border: '1px solid var(--border)', borderRadius: 8, padding: '.45rem .6rem', background: 'var(--bg)' }}>
            <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Name, code or district"
              aria-label="Search brokers"
              style={{ width: 190, border: 0, outline: 0, background: 'transparent', fontSize: '.68rem' }}
            />
          </label>
        </div>

        <DataTable
          rows={rows}
          columns={columns}
          sort={sort}
          onSort={toggleSort}
          rowKey={broker => String(broker.memberCode)}
          minWidth={980}
          showIndex
          empty="No brokers match this search."
        />

        <p className="muted" style={{ margin: '.65rem 0 0', fontSize: '.6rem' }}>
          {rows.length} of {brokers.length} brokers · turnover is the mirror&rsquo;s reported 30-day figure. Session figures count the buy and sell sides separately, so they run roughly twice the market&rsquo;s one-sided turnover.
        </p>
      </section>

      <div className="lower-grid" style={{ marginTop: '.75rem' }}>
        <section className="panel" style={{ padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.55rem' }}>
            <Landmark size={15} style={{ color: 'var(--text-tertiary)' }} />
            <h2 style={{ margin: 0, fontSize: '.95rem' }}>Concentration</h2>
          </div>
          <div style={{ display: 'grid', gap: '.55rem', fontSize: '.68rem' }}>
            {[
              { label: 'Top 5 share of 30-day turnover', value: total30d ? `${(brokers.slice(0, 5).reduce((sum, broker) => sum + broker.turnover30d, 0) / total30d * 100).toFixed(1)}%` : 'N/A' },
              { label: 'Top 10 share of 30-day turnover', value: total30d ? `${(brokers.slice(0, 10).reduce((sum, broker) => sum + broker.turnover30d, 0) / total30d * 100).toFixed(1)}%` : 'N/A' },
              { label: 'Average 30-day turnover', value: brokers.length ? formatNpr(total30d / brokers.length) : 'N/A' },
              { label: 'Busiest member', value: brokers[0]?.memberName ?? 'N/A' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem' }}>
                <span className="muted">{item.label}</span>
                <strong style={{ textAlign: 'right' }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.55rem' }}>
            <MapPin size={15} style={{ color: 'var(--text-tertiary)' }} />
            <h2 style={{ margin: 0, fontSize: '.95rem' }}>Where members are based</h2>
          </div>
          <div style={{ display: 'grid', gap: '.4rem', fontSize: '.66rem' }}>
            {[...districts]
              .map(district => ({ district, count: brokers.filter(broker => broker.districts.includes(district)).length }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map(row => (
                <div key={row.district} className="broker-district-row">
                  <span>{row.district}</span>
                  <span className="broker-district-track"><i style={{ width: `${row.count / Math.max(1, brokers.length) * 100}%` }} /></span>
                  <strong>{row.count}</strong>
                </div>
              ))}
          </div>
          <p className="muted" style={{ margin: '.55rem 0 0', fontSize: '.58rem' }}>
            A member can operate in more than one district, so counts overlap.
          </p>
        </section>
      </div>

      <div className="panel" style={{ marginTop: '.75rem' }}>
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Going deeper</p>
            <h3>Browse by sector and security</h3>
          </div>
          <Building2 size={16} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <div className="grid-auto" style={{ marginTop: '.7rem' }}>
          {[
            { href: '/market', title: 'Market board', text: 'Every listed security, the heatmap and the day\u2019s movers' },
            { href: '/market/sector/Hydro%20Power', title: 'Hydropower sector', text: 'Constituents, breadth and turnover for the largest group' },
            { href: '/market/sector/Commercial%20Banks', title: 'Commercial banks', text: 'The bank constituents that move the index most' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: 'block', padding: '.7rem .8rem', borderRadius: 10, background: 'var(--bg-sunken)', color: 'inherit', textDecoration: 'none' }}
            >
              <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.4rem', fontSize: '.7rem' }}>
                {item.title} <ArrowUpRight size={12} />
              </strong>
              <span style={{ display: 'block', marginTop: '.2rem', color: 'var(--text-secondary)', fontSize: '.6rem', lineHeight: 1.5 }}>{item.text}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="muted" style={{ margin: '.8rem 0 0', fontSize: '.6rem', lineHeight: 1.6 }}>
        Source: YONepse mirror of NEPSE and ShareHub member profiles, refreshed hourly. Turnover figures are reported by the mirror and may lag the official close. Informational only, not investment advice.
      </p>
    </div>
  )
}
