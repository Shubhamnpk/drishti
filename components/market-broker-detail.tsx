'use client'

import Link from 'next/link'
import { Activity, ArrowDownRight, ArrowLeft, ArrowUpRight, Building2, ExternalLink, Landmark, MapPin, Phone, Star } from 'lucide-react'
import { formatNpr, formatNum } from '@/lib/currency'
import type { NepseBroker, NepseBrokerActivity } from '@/lib/nepse'

type Props = {
  broker: NepseBroker
  activity: NepseBrokerActivity | null
  rank: { byTurnover30d: number; of: number }
  marketSessionTurnover: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtDate(iso?: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : (iso ?? '')
}

function signed(value: number): string {
  return `${value >= 0 ? '+' : ''}${formatNpr(value)}`
}

function FlowList({ title, eyebrow, rows, side }: {
  title: string
  eyebrow: string
  rows: { symbol: string; companyName: string; amount: number; qty: number }[]
  side: 'buy' | 'sell'
}) {
  const max = Math.max(1, ...rows.map(row => row.amount))
  return (
    <section className="panel" style={{ padding: '1rem 1.1rem' }}>
      <p className="eyebrow" style={{ marginBottom: '.2rem' }}>{eyebrow}</p>
      <h2 style={{ margin: 0, fontSize: '.95rem' }}>{title}</h2>
      <div style={{ marginTop: '.55rem' }}>
        {rows.length === 0 && <p className="muted" style={{ marginTop: '.4rem' }}>No matched {side === 'buy' ? 'purchases' : 'sales'} in the latest session.</p>}
        {rows.map((row, index) => (
          <Link
            key={row.symbol}
            href={`/market/${row.symbol}`}
            style={{ display: 'block', padding: '.45rem .1rem', borderTop: index ? '1px solid var(--border-light)' : 0, color: 'inherit', textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.66rem' }}>
              <strong>{row.symbol}</strong>
              <span>{formatNpr(row.amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', marginTop: '.1rem', color: 'var(--text-tertiary)', fontSize: '.56rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.companyName}</span>
              <span>{formatNum(row.qty)} shares</span>
            </div>
            <div style={{ height: 4, marginTop: '.3rem', borderRadius: 99, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${row.amount / max * 100}%`, background: side === 'buy' ? 'var(--accent)' : 'var(--danger)' }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function MarketBrokerDetail({ broker, activity, rank, marketSessionTurnover }: Props) {
  const sessionTurnover = activity ? activity.buyAmount + activity.sellAmount : broker.latestTurnover
  const sessionShare = activity?.shareOfMarket
    ?? (marketSessionTurnover > 0 ? broker.latestTurnover / marketSessionTurnover * 100 : 0)
  const bought = activity
    ? [...activity.symbols].sort((a, b) => b.buyAmount - a.buyAmount).filter(row => row.buyAmount > 0).slice(0, 5)
      .map(row => ({ symbol: row.symbol, companyName: row.companyName, amount: row.buyAmount, qty: row.buyQty }))
    : []
  const sold = activity
    ? [...activity.symbols].sort((a, b) => b.sellAmount - a.sellAmount).filter(row => row.sellAmount > 0).slice(0, 5)
      .map(row => ({ symbol: row.symbol, companyName: row.companyName, amount: row.sellAmount, qty: row.sellQty }))
    : []
  const netUp = (activity?.netAmount ?? 0) >= 0
  const buyShare = activity?.buyShare ?? 50
  const sellShare = activity?.sellShare ?? 50

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '1rem 0 .8rem', fontSize: '.68rem', color: 'var(--text-tertiary)' }}>
        <Link href="/market" aria-label="Back to market" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: 'inherit', textDecoration: 'none' }}><ArrowLeft size={14} /> Market</Link>
        <span>/</span>
        <Link href="/market/brokers" style={{ color: 'inherit', textDecoration: 'none' }}>Brokers</Link>
        <span>/</span>
        <span>#{broker.memberCode}</span>
      </div>

      <div className="stock-hero panel">
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
            <span className="stock-sector-pill">Broker #{broker.memberCode}</span>
            {broker.membershipType && <span className="stock-meta-chip">{broker.membershipType}</span>}
            {broker.isDealer && <span className="stock-meta-chip">Dealer</span>}
            {broker.branchCount > 0 && <span className="stock-meta-chip">{broker.branchCount} {broker.branchCount === 1 ? 'branch' : 'branches'}</span>}
          </div>

          <h1 style={{ margin: '.5rem 0 0', fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', letterSpacing: '-.045em', lineHeight: 1.05 }}>{broker.memberName}</h1>
          <p style={{ margin: '.25rem 0 0', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
            NEPSE member broker {broker.memberCode}
            {broker.districts.length ? ` · ${broker.districts.join(', ')}` : ''}
          </p>
          <p className="muted" style={{ marginTop: '.32rem' }}>
            Latest session {activity ? fmtDate(activity.date) : 'N/A'} · ranked #{rank.byTurnover30d} of {rank.of} active members by 30-day turnover
          </p>

          <div className="stock-day-grid">
            {[
              { label: '30-day turnover', value: formatNpr(broker.turnover30d) },
              { label: 'Session value (gross)', value: formatNpr(sessionTurnover) },
              { label: 'Contracts today', value: activity ? formatNum(activity.contracts) : 'N/A' },
              { label: 'Coverage', value: broker.districts.length ? `${broker.districts.length} ${broker.districts.length === 1 ? 'district' : 'districts'}` : 'N/A' },
            ].map(item => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="stock-hero-price">
          <span className="stock-card-label">30-day turnover</span>
          <strong>{formatNpr(broker.turnover30d)}</strong>
          <span className="positive">
            <ArrowUpRight size={15} /> #{rank.byTurnover30d} of {rank.of}
          </span>
          <small>
            Session market share <b>{sessionShare ? `${sessionShare.toFixed(2)}%` : 'N/A'}</b>
          </small>
        </div>
      </div>

      <div className="stock-chart-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Latest session</p>
              <h3>Buy and sell flow</h3>
              <p className="muted">Matched floor-sheet contracts on {activity ? fmtDate(activity.date) : 'the latest trading day'}.</p>
            </div>
            <Activity size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {activity ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', marginTop: '.85rem', fontSize: '.6rem' }}>
                <span className="positive">Buy {buyShare.toFixed(1)}%</span>
                <span className="negative">Sell {sellShare.toFixed(1)}%</span>
              </div>
              <div
                role="img"
                aria-label={`${buyShare.toFixed(1)}% bought, ${sellShare.toFixed(1)}% sold`}
                style={{ display: 'flex', height: 10, marginTop: '.35rem', overflow: 'hidden', borderRadius: 99, background: 'var(--bg-sunken)' }}
              >
                <span style={{ width: `${buyShare}%`, background: 'var(--accent)' }} />
                <span style={{ width: `${sellShare}%`, background: 'var(--danger)' }} />
              </div>

              <div className="stock-fin-stats" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                <div><span>Bought</span><strong>{formatNpr(activity.buyAmount)}</strong></div>
                <div><span>Sold</span><strong>{formatNpr(activity.sellAmount)}</strong></div>
                <div><span>Net</span><strong className={netUp ? 'positive' : 'negative'}>{signed(activity.netAmount)}</strong></div>
                <div><span>Contracts</span><strong>{formatNum(activity.contracts)}</strong></div>
              </div>

              <div className="stock-snapshot" style={{ marginTop: '.9rem' }}>
                {[
                  { icon: <ArrowUpRight size={13} />, label: 'Shares bought', value: formatNum(activity.buyQty) },
                  { icon: <ArrowDownRight size={13} />, label: 'Shares sold', value: formatNum(activity.sellQty) },
                  { icon: <Landmark size={13} />, label: 'Market share', value: `${activity.shareOfMarket.toFixed(2)}%` },
                  { icon: <Building2 size={13} />, label: 'Symbols traded', value: formatNum(activity.symbols.length) },
                  { icon: <Activity size={13} />, label: 'Session rank', value: activity.sessionRank ? `#${activity.sessionRank.byTurnover} of ${activity.sessionRank.of}` : 'N/A' },
                ].map(row => (
                  <div key={row.label} className="stock-snapshot-row">
                    <span>{row.icon}{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted" style={{ marginTop: '.8rem' }}>
              The latest floor sheet has no matched contract for this broker. Turnover figures above still come from the mirror.
            </p>
          )}
        </div>

        <div className="panel stock-about-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Member</p>
              <h3>Broker profile</h3>
            </div>
            <Building2 size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginTop: '.75rem' }}>
            {broker.imageUrl
              ? <img src={broker.imageUrl} alt={`${broker.memberName} logo`} width={48} height={48} loading="lazy" style={{ borderRadius: 10, background: 'var(--bg-sunken)', objectFit: 'contain', padding: 4 }} />
              : <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 10, background: 'var(--bg-sunken)', fontWeight: 750, color: 'var(--accent)' }}>{broker.memberName.slice(0, 2).toUpperCase()}</span>}
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '.72rem' }}>{broker.memberName}</strong>
              {broker.rating ? (
                <span className="broker-rating" style={{ marginTop: '.15rem' }}>
                  <Star size={11} aria-hidden />
                  <strong>{broker.rating.averageRating.toFixed(2)}</strong>
                  <span className="muted">from {broker.rating.totalRatings} ratings</span>
                </span>
              ) : <span className="muted" style={{ fontSize: '.58rem' }}>No member rating yet</span>}
            </div>
          </div>

          <div className="stock-snapshot">
            {[
              { icon: <Building2 size={13} />, label: 'Membership', value: broker.membershipType || 'N/A' },
              { icon: <MapPin size={13} />, label: 'Districts', value: broker.districts.length ? broker.districts.join(', ') : 'N/A' },
              { icon: <Landmark size={13} />, label: 'Branches', value: broker.branchCount ? formatNum(broker.branchCount) : 'N/A' },
              { icon: <Phone size={13} />, label: 'Phone', value: broker.phone || 'N/A' },
              { icon: <Star size={13} />, label: 'Share transfer', value: broker.rating?.averageShareTransferDays != null ? `${broker.rating.averageShareTransferDays.toFixed(1)} days` : 'N/A' },
              { icon: <Star size={13} />, label: 'Cash deposit', value: broker.rating?.averageCashDepositDays != null ? `${broker.rating.averageCashDepositDays.toFixed(1)} days` : 'N/A' },
            ].map(row => (
              <div key={row.label} className="stock-snapshot-row">
                <span>{row.icon}{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <div className="stock-about-foot">
            {broker.tmsLink ? (
              <a href={`https://${broker.tmsLink}`} target="_blank" rel="noreferrer" className="text-button" style={{ paddingLeft: 0 }}>
                Trading terminal <ExternalLink size={11} />
              </a>
            ) : <span />}
            <a href="https://www.nepalstock.com" target="_blank" rel="noreferrer" className="text-button" style={{ paddingRight: 0 }}>
              Official NEPSE <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      <div className="lower-grid" style={{ marginBottom: '.75rem' }}>
        <FlowList title="Bought most" eyebrow="Top purchases" rows={bought} side="buy" />
        <FlowList title="Sold most" eyebrow="Top sales" rows={sold} side="sell" />
      </div>

      {activity && activity.largest.length > 0 && (
        <div className="panel" style={{ marginBottom: '.75rem' }}>
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Biggest contracts</p>
              <h3>Largest matched tickets</h3>
              <p className="muted">The broker&rsquo;s eight largest contracts on {fmtDate(activity.date)}.</p>
            </div>
            <Link href={`/market/floor-sheet?broker=${broker.memberCode}`} className="text-button" style={{ padding: 0, fontSize: '.6rem' }}>
              Full floor sheet <ArrowUpRight size={11} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="stock-data-table">
              <thead>
                <tr><th>Time</th><th>Symbol</th><th>Side</th><th>Counterparty</th><th>Shares</th><th>Rate</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {activity.largest.map((trade, index) => (
                  <tr key={`${trade.time}-${index}`}>
                    <td>{trade.time}</td>
                    <td><Link href={`/market/${trade.symbol}`} className="market-symbol-link" style={{ fontWeight: 700 }}>{trade.symbol}</Link></td>
                    <td><strong className={trade.side === 'buy' ? 'positive' : 'negative'}>{trade.side === 'buy' ? 'Buy' : 'Sell'}</strong></td>
                    <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{trade.counterparty}</td>
                    <td>{formatNum(trade.qty)}</td>
                    <td>{formatNpr(trade.rate)}</td>
                    <td>{formatNpr(trade.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="muted" style={{ margin: '.8rem 0 0', fontSize: '.6rem', lineHeight: 1.6 }}>
        Source: YONepse mirror of NEPSE (floor sheet, member list) and ShareHub member profiles, refreshed hourly. Buy and sell values are matched floor-sheet contracts for the latest trading day and can lag the official close. Informational only, not investment advice.
      </p>
    </div>
  )
}
