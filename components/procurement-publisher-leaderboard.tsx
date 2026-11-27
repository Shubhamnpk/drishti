'use client'

import { useState } from 'react'
import Link from 'next/link'

export type ProcurementPublisher = {
  name: string
  count: number
  slug: string
}

const RANK_LIMITS = [10, 25, 50, 100] as const

export function ProcurementPublisherLeaderboard({
  publishers,
  totalPublishers,
  sampledNotices,
  totalNotices,
  complete,
}: {
  publishers: ProcurementPublisher[]
  totalPublishers: number
  sampledNotices: number
  totalNotices: number
  complete: boolean
}) {
  const [limit, setLimit] = useState<(typeof RANK_LIMITS)[number]>(10)
  const visible = publishers.slice(0, limit)
  const maxCount = publishers[0]?.count ?? 1

  return (
    <section className="panel procurement-publisher-panel" aria-labelledby="procurement-publishers-title">
      <header className="procurement-publisher-header">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>LIVE E-GP · PUBLISHER RANKING</p>
          <h2 id="procurement-publishers-title">Top tender publishers</h2>
          <p className="muted">Ranked across {complete ? 'all' : 'the fetched'} {sampledNotices.toLocaleString()} notices returned by the e-GP register.</p>
        </div>
        <label className="procurement-rank-limit">
          <span>Show ranks</span>
          <select value={limit} onChange={event => setLimit(Number(event.target.value) as (typeof RANK_LIMITS)[number])}>
            {RANK_LIMITS.map(count => <option key={count} value={count}>Top {count}</option>)}
          </select>
        </label>
      </header>

      {visible.length ? (
        <ol className="procurement-publisher-list" aria-label={`Top ${visible.length} tender publishers`}>
          {visible.map((publisher, index) => (
            <li key={publisher.slug}>
              <span className={`procurement-publisher-rank${index < 3 ? ' is-leader' : ''}`}>{index + 1}</span>
              <div className="procurement-publisher-main">
                <div className="procurement-publisher-label">
                  <Link href={`/procurement/agencies/${publisher.slug}`} title={`Open ${publisher.name} agency profile`}>{publisher.name}</Link>
                  <span>{publisher.count.toLocaleString()} {publisher.count === 1 ? 'notice' : 'notices'}</span>
                </div>
                <span className="procurement-publisher-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(3, (publisher.count / maxCount) * 100)}%` }} />
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted procurement-publishers-empty">Publisher rankings will appear when live e-GP notices are available.</p>
      )}

      <footer className="procurement-publisher-footnote">
        <span>Ranks 1–{visible.length} of {totalPublishers.toLocaleString()} offices with notices</span>
        <span>Portal total: {totalNotices.toLocaleString()} notices</span>
      </footer>
    </section>
  )
}
