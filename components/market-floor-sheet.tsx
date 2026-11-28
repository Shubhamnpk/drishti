import Link from 'next/link'
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, Clock, Landmark, Layers, ReceiptText, Search } from 'lucide-react'
import { TableShell } from '@/components/data-table'
import { formatNpr, formatNum } from '@/lib/currency'
import type { NepseBroker, NepseFloorSheetOverview, NepseFloorSheetPage } from '@/lib/nepse'

type Filters = { symbol: string; broker: number; minAmount: number; sort: string }

type Props = {
  overview: NepseFloorSheetOverview | null
  sheet: NepseFloorSheetPage | null
  brokers: NepseBroker[]
  filters: Filters
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const MIN_AMOUNTS = [
  { value: 0, label: 'Any size' },
  { value: 100_000, label: 'Above 1 lakh' },
  { value: 1_000_000, label: 'Above 10 lakh' },
  { value: 10_000_000, label: 'Above 1 crore' },
  { value: 100_000_000, label: 'Above 10 crore' },
]

const SORTS = [
  { value: 'amount', label: 'Largest value first' },
  { value: 'time', label: 'Latest first' },
  { value: 'qty', label: 'Largest quantity first' },
]

function fmtDate(iso?: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : (iso ?? '')
}

function hrefFor(filters: Filters, overrides: Record<string, string | number | undefined> = {}): string {
  const params = new URLSearchParams()
  const values: Record<string, string | number | undefined> = {
    symbol: filters.symbol || undefined,
    broker: filters.broker || undefined,
    min: filters.minAmount || undefined,
    sort: filters.sort === 'amount' ? undefined : filters.sort,
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '' || value === 0) continue
    params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `/market/floor-sheet?${query}` : '/market/floor-sheet'
}

export function MarketFloorSheet({ overview, sheet, brokers, filters }: Props) {
  const hasFilters = Boolean(filters.symbol || filters.broker || filters.minAmount)
  const inputStyle = {
    padding: '.45rem .6rem',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '.68rem',
  } as const
  const labelStyle = {
    display: 'grid',
    gap: '.25rem',
    fontSize: '.54rem',
    fontWeight: 700,
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    color: 'var(--text-tertiary)',
  } as const

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '1rem 0 .8rem', fontSize: '.68rem', color: 'var(--text-tertiary)' }}>
        <Link href="/market" aria-label="Back to market" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: 'inherit', textDecoration: 'none' }}><ArrowLeft size={14} /> Market</Link>
        <span>/</span>
        <span>Floor sheet</span>
      </div>

      <section className="sector-hero">
        <div className="sector-hero-title">
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>NEPSE trading session</p>
            <h1>Floor sheet</h1>
            <p className="muted">
              {overview
                ? `${fmtDate(overview.date)} · ${formatNum(overview.contracts)} matched contracts · ${formatNum(overview.symbolCount)} securities · ${formatNum(overview.brokerCount)} brokers`
                : 'The latest matched contracts are unavailable right now.'}
            </p>
          </div>
          <div className="sector-hero-move">
            <span className="eyebrow">Traded value</span>
            <strong>{overview ? formatNpr(overview.amount) : 'N/A'}</strong>
          </div>
        </div>
        <div className="sector-quick-stats">
          <div><span>Contracts</span><strong>{overview ? formatNum(overview.contracts) : 'N/A'}</strong></div>
          <div><span>Shares</span><strong>{overview ? formatNum(overview.qty) : 'N/A'}</strong></div>
          <div><span>Average ticket</span><strong>{overview ? formatNpr(overview.averageTicket) : 'N/A'}</strong></div>
          <div><span>Largest contract</span><strong>{overview ? formatNpr(overview.largest) : 'N/A'}</strong></div>
        </div>
      </section>

      {overview && (
        <div className="lower-grid-3" style={{ marginBottom: '.75rem' }}>
          <section className="panel" style={{ padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.55rem' }}>
              <Clock size={15} style={{ color: 'var(--text-tertiary)' }} />
              <h2 style={{ margin: 0, fontSize: '.95rem' }}>Trading rhythm</h2>
            </div>
            <p className="muted" style={{ marginTop: 0, fontSize: '.6rem' }}>Contracts matched in each hour of the session.</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 130, marginTop: '.6rem', borderBottom: '1px solid var(--border-light)', paddingBottom: 1 }}>
              {overview.hours.map(hour => {
                const peak = Math.max(1, ...overview.hours.map(item => item.contracts))
                return (
                  <div key={hour.hour} style={{ flex: 1, minWidth: 0, textAlign: 'center' }} title={`${hour.hour} · ${formatNum(hour.contracts)} contracts · ${formatNpr(hour.amount)}`}>
                    <div style={{ height: `${Math.max(4, hour.contracts / peak * 100)}%`, minHeight: 4, borderRadius: '3px 3px 0 0', background: 'color-mix(in oklab, var(--accent) 55%, var(--bg-sunken))' }} />
                    <span style={{ display: 'block', marginTop: '.25rem', fontSize: '.5rem', color: 'var(--text-tertiary)' }}>{hour.hour.slice(0, 2)}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.4rem', fontSize: '.55rem', color: 'var(--text-tertiary)' }}>
              <span>Open 11:00</span>
              <span>Close 15:00</span>
            </div>
          </section>

          <section className="panel" style={{ padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.55rem' }}>
              <Layers size={15} style={{ color: 'var(--accent)' }} />
              <h2 style={{ margin: 0, fontSize: '.95rem' }}>Most traded securities</h2>
            </div>
            {overview.symbols.slice(0, 8).map((row, index) => {
              const peak = Math.max(1, overview.symbols[0]?.amount ?? 0)
              return (
                <Link key={row.symbol} href={`/market/${row.symbol}`} style={{ display: 'block', padding: '.4rem .1rem', borderTop: index ? '1px solid var(--border-light)' : 0, color: 'inherit', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.64rem' }}>
                    <strong>{row.symbol}</strong>
                    <span>{formatNpr(row.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', marginTop: '.1rem', color: 'var(--text-tertiary)', fontSize: '.55rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.companyName}</span>
                    <span>{formatNum(row.contracts)} trades</span>
                  </div>
                  <div style={{ height: 3, marginTop: '.25rem', borderRadius: 99, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${row.amount / peak * 100}%`, background: 'var(--accent)' }} />
                  </div>
                </Link>
              )
            })}
          </section>

          <section className="panel" style={{ padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.55rem' }}>
              <Landmark size={15} style={{ color: 'var(--text-tertiary)' }} />
              <h2 style={{ margin: 0, fontSize: '.95rem' }}>Busiest members</h2>
            </div>
            {overview.members.slice(0, 8).map((row, index) => {
              const peak = Math.max(1, overview.members[0]?.amount ?? 0)
              return (
                <Link key={row.code} href={`/market/brokers/${row.code}`} style={{ display: 'block', padding: '.4rem .1rem', borderTop: index ? '1px solid var(--border-light)' : 0, color: 'inherit', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.64rem' }}>
                    <strong style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</strong>
                    <span>{formatNpr(row.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', marginTop: '.1rem', fontSize: '.55rem' }}>
                    <span className="positive">Buy {formatNpr(row.buyAmount)}</span>
                    <span className="negative">Sell {formatNpr(row.sellAmount)}</span>
                  </div>
                  <div style={{ height: 3, marginTop: '.25rem', borderRadius: 99, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${row.amount / peak * 100}%`, background: 'var(--text-secondary)' }} />
                  </div>
                </Link>
              )
            })}
          </section>
        </div>
      )}

      <section className="panel" id="contracts" style={{ scrollMarginTop: 90 }}>
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '.7rem' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Contract explorer</p>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Every matched trade</h2>
            <p className="muted">Filter by security, broker or ticket size. Amounts are the matched value of each contract.</p>
          </div>
          {hasFilters && (
            <Link href="/market/floor-sheet" className="text-button" style={{ padding: 0 }}>
              Clear filters
            </Link>
          )}
        </div>

        <form method="get" action="/market/floor-sheet" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '.6rem', marginTop: '.8rem' }}>
          <label style={labelStyle}>
            Security
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={12} style={{ position: 'absolute', left: '.5rem', color: 'var(--text-tertiary)' }} />
              <input name="symbol" defaultValue={filters.symbol} placeholder="e.g. NABIL" aria-label="Filter by security symbol" style={{ ...inputStyle, paddingLeft: '1.7rem', width: 150 }} />
            </span>
          </label>
          <label style={labelStyle}>
            Broker
            <select name="broker" defaultValue={filters.broker || ''} aria-label="Filter by broker" style={{ ...inputStyle, maxWidth: 260 }}>
              <option value="">Any broker</option>
              {brokers.map(broker => (
                <option key={broker.memberCode} value={broker.memberCode}>{broker.memberName} (#{broker.memberCode})</option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Ticket size
            <select name="min" defaultValue={filters.minAmount || 0} aria-label="Filter by minimum contract value" style={inputStyle}>
              {MIN_AMOUNTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Sort
            <select name="sort" defaultValue={filters.sort} aria-label="Sort contracts" style={inputStyle}>
              {SORTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <button
            type="submit"
            style={{ padding: '.5rem .9rem', border: 0, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: '.66rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Apply
          </button>
        </form>

        {sheet ? (
          <>
            <TableShell minWidth={980}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col" className="is-left">Time</th>
                    <th scope="col" className="is-left">Security</th>
                    <th scope="col" className="is-left">Buyer</th>
                    <th scope="col" className="is-left">Seller</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Rate</th>
                    <th scope="col">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.contracts.map((contract, index) => (
                    <tr key={`${contract.time}-${contract.symbol}-${index}`}>
                      <td className="is-left" style={{ color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{contract.time}</td>
                      <td className="is-left">
                        <Link href={`/market/${contract.symbol}`} className="market-symbol-link" style={{ fontWeight: 700 }}>{contract.symbol}</Link>
                        <span className="data-table-sub" style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contract.companyName}</span>
                      </td>
                      <td className="is-left">
                        <Link href={`/market/brokers/${contract.buyer}`} className="market-company-link">{contract.buyerName}</Link>
                      </td>
                      <td className="is-left">
                        <Link href={`/market/brokers/${contract.seller}`} className="market-company-link">{contract.sellerName}</Link>
                      </td>
                      <td>{formatNum(contract.qty)}</td>
                      <td>{formatNpr(contract.rate)}</td>
                      <td><strong>{formatNpr(contract.amount)}</strong></td>
                    </tr>
                  ))}
                  {sheet.contracts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="data-table-empty">
                        No contracts match these filters. Try a different symbol, broker or ticket size.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableShell>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap', marginTop: '.7rem', fontSize: '.6rem', color: 'var(--text-tertiary)' }}>
              <span>
                {sheet.matched
                  ? `Showing ${formatNum((sheet.page - 1) * sheet.pageSize + 1)} to ${formatNum(Math.min(sheet.page * sheet.pageSize, sheet.matched))} of ${formatNum(sheet.matched)} contracts · ${formatNpr(sheet.matchedAmount)} matched value`
                  : 'No matching contracts'}
                {sheet.matched ? ` · ${formatNum(sheet.total)} in the session` : ''}
              </span>
              {sheet.pages > 1 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                  {sheet.page > 1
                    ? <Link href={hrefFor(filters, { page: sheet.page - 1 })} className="text-button" style={{ padding: 0 }}><ArrowLeft size={12} /> Prev</Link>
                    : <span style={{ opacity: .4 }}><ArrowLeft size={12} /> Prev</span>}
                  <span>Page {sheet.page} of {formatNum(sheet.pages)}</span>
                  {sheet.page < sheet.pages
                    ? <Link href={hrefFor(filters, { page: sheet.page + 1 })} className="text-button" style={{ padding: 0 }}>Next <ArrowRight size={12} /></Link>
                    : <span style={{ opacity: .4 }}>Next <ArrowRight size={12} /></span>}
                </span>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 160, color: 'var(--text-tertiary)', fontSize: '.72rem', marginTop: '.8rem' }}>
            <ReceiptText size={20} />
            <p style={{ marginTop: '.5rem' }}>The floor sheet is unavailable right now. The mirror may still be publishing the session.</p>
          </div>
        )}
      </section>

      <div className="panel" style={{ marginTop: '.75rem' }}>
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Follow the money</p>
            <h3>Read the session deeper</h3>
          </div>
          <Activity size={16} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <div className="grid-auto" style={{ marginTop: '.7rem' }}>
          {[
            { href: '/market/brokers', title: 'Broker directory', text: '30-day turnover, session flow and ratings for every member' },
            { href: '/market', title: 'Market board', text: 'Prices, the sector heatmap and the day\u2019s movers' },
            { href: '/market/sector/Hydro%20Power', title: 'Hydropower sector', text: 'How the biggest group traded this session' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'block', padding: '.7rem .8rem', borderRadius: 10, background: 'var(--bg-sunken)', color: 'inherit', textDecoration: 'none' }}>
              <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.4rem', fontSize: '.7rem' }}>
                {item.title} <ArrowUpRight size={12} />
              </strong>
              <span style={{ display: 'block', marginTop: '.2rem', color: 'var(--text-secondary)', fontSize: '.6rem', lineHeight: 1.5 }}>{item.text}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="muted" style={{ margin: '.8rem 0 0', fontSize: '.6rem', lineHeight: 1.6 }}>
        Source: YONepse mirror of NEPSE floor sheets, refreshed hourly. Covers the latest trading session only. A contract is one matched order; the same broker can appear on both sides of different contracts. Informational only, not investment advice.
      </p>
    </div>
  )
}
