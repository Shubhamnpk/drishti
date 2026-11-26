import Link from 'next/link'
import { ArrowUpRight, Database, ExternalLink, FileArchive, Radio } from 'lucide-react'
import { LiveProcurementTable, ProcurementHighlights } from '@/components/live-procurement'
import { ProcurementTable } from '@/components/procurement-table'
import { ProcurementYearChart } from '@/components/procurement-chart'
import { fetchEgpFeed } from '@/lib/egp'
import { fetchOcdsTenders, summarizeOcds } from '@/lib/ocds'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Nepal government procurement',
  description: 'Live searchable Nepal government tender notices from the PPMO e-GP portal, with a separate historical OCDS archive.',
  path: '/procurement',
})

export default async function ProcurementPage() {
  const [live, historicalTenders] = await Promise.all([fetchEgpFeed(), fetchOcdsTenders()])
  const historical = summarizeOcds(historicalTenders)
  const liveSummary = live.summary
  const summaryCards = liveSummary ? [
    { label: 'Notices in portal', value: liveSummary.total, note: 'All statuses' },
    { label: 'Open notices', value: liveSummary.open, note: 'Accepting bids' },
    { label: 'Published opportunities', value: liveSummary.goods_published + liveSummary.works_published, note: `${liveSummary.goods_published.toLocaleString()} goods / ${liveSummary.works_published.toLocaleString()} works` },
    { label: 'Procurement network', value: liveSummary.approved_public_entities, note: `${liveSummary.approved_bidders.toLocaleString()} approved bidders` },
  ] : []

  return (
    <div className="content-wrap">
      <header className="projects-header procurement-header">
        <div>
          <p className="eyebrow"><Radio size={12} /> PUBLIC PROCUREMENT / NEPAL</p>
          <h1>Government tenders</h1>
          <p className="projects-intro">Explore current notices from the PPMO e-GP portal, follow deadlines and amendments, and inspect tender documents and schedules.</p>
        </div>
        <a href="https://bolpatra.gov.np/projects" target="_blank" rel="noreferrer" className="projects-map-link">Open official e-GP <ExternalLink size={14} /></a>
      </header>

      {summaryCards.length > 0 && <section className="projects-summary procurement-summary" aria-label="Live e-GP overview">
        {summaryCards.map(card => <div key={card.label}><span>{card.label}</span><strong>{card.value.toLocaleString()}</strong><small>{card.note}</small></div>)}
      </section>}
      {!live.tenders.length ? (
        <section className="panel" style={{ marginBottom: '.75rem' }}>
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem' }}>The live e-GP feed is temporarily unavailable.</p>
            <p className="muted" style={{ margin: '.3rem 0 0', fontSize: '.72rem' }}>The historical archive below remains available when its source can be reached.</p>
          </div>
        </section>
      ) : (
        <section className="panel" style={{ marginBottom: '.75rem' }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURRENT E-GP NOTICES</p>
              <h2>Search live tenders</h2>
            </div>
            <a href="https://bolpatra.gov.np/projects" target="_blank" rel="noreferrer" className="outline-button" style={{ textDecoration: 'none', fontSize: '.68rem' }}>
              Official e-GP portal <ExternalLink size={12} />
            </a>
          </div>
          <LiveProcurementTable tenders={live.tenders} total={live.total} updatedAt={live.updatedAt} />
        </section>
      )}

      {liveSummary && <ProcurementHighlights events={liveSummary.events} notices={liveSummary.notices} />}

      <details className="panel" style={{ marginBottom: '.75rem' }}>
        <summary style={{ cursor: 'pointer', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '.55rem', fontWeight: 650, fontSize: '.85rem' }}>
          <FileArchive size={16} className="text-primary" /> Historical OCDS archive (2016-2018)
          <span className="muted" style={{ fontWeight: 400, fontSize: '.68rem', marginLeft: 'auto' }}>{historical?.total.toLocaleString() ?? 0} processes</span>
        </summary>
        <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.1rem' }}>
          {historical ? (
            <>
              <p className="muted" style={{ margin: '0 0 .75rem', fontSize: '.7rem', lineHeight: 1.55 }}>
                This Open Contracting Partnership dataset is a historical snapshot and is not updated with current tenders. Its dates and totals are kept separate from the live e-GP feed.
              </p>
              <div className="grid-2">
                <div className="bg-card border border-line-light rounded-lg shadow-sm" style={{ padding: '1rem 1.1rem' }}>
                  <p className="eyebrow" style={{ margin: 0 }}>ARCHIVED PROCESSES BY YEAR</p>
                  <div style={{ marginTop: '.5rem' }}><ProcurementYearChart years={historical.years} /></div>
                </div>
                <div className="bg-card border border-line-light rounded-lg shadow-sm" style={{ padding: '1rem 1.1rem' }}>
                  <p className="eyebrow" style={{ margin: 0 }}>MOST ACTIVE BUYERS IN ARCHIVE</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginTop: '.6rem' }}>
                    {historical.topBuyers.slice(0, 6).map((buyer, index) => (
                      <div key={buyer.buyer} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.72rem' }}>
                        <span className="bg-sunken text-tertiary rounded-[6px]" style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', fontSize: '.62rem', fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{buyer.buyer}</span>
                        <strong className="text-primary">{buyer.count.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '.75rem' }}>
                <ProcurementTable tenders={historicalTenders} />
              </div>
              <a href="https://data.open-contracting.org/en/publication/36" target="_blank" rel="noreferrer" className="text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', fontSize: '.68rem', fontWeight: 600, marginTop: '.75rem' }}>
                Open historical source <ExternalLink size={12} />
              </a>
            </>
          ) : <p className="muted" style={{ margin: 0, fontSize: '.72rem' }}>The historical archive could not be reached.</p>}
        </div>
      </details>

      <div className="bg-card border border-line-light rounded-lg shadow-sm" style={{ padding: '.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
        <Database size={15} className="text-primary" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong style={{ fontSize: '.74rem' }}>Sources: PPMO e-GP and Open Contracting Partnership</strong>
          <p className="text-secondary" style={{ margin: '.1rem 0 0', fontSize: '.62rem' }}>
            Live listing and dates from the official portal; archived OCDS releases cover 2016-2018. Currency values are shown only when the source provides them.
          </p>
        </div>
        <a href="https://bolpatra.gov.np/" target="_blank" rel="noreferrer" className="text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', fontSize: '.7rem', fontWeight: 600 }}>
          e-GP <ExternalLink size={12} />
        </a>
        <Link href="/sources" className="text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', fontSize: '.7rem', fontWeight: 600 }}>
          All sources <ArrowUpRight size={12} />
        </Link>
      </div>
      <p className="text-tertiary" style={{ margin: '.5rem 0 0', fontSize: '.6rem' }}>
        Live source data is cached for up to 30 minutes. Deadlines display in Nepal time (NPT). Amounts are not included in the live listing endpoint.
      </p>
    </div>
  )
}
