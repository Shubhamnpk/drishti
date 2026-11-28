import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  MapPin,
  Construction,
  Building2,
  CloudSun,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { NotFoundInteractive } from '@/components/not-found-interactive'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Page Not Found (404) · पृष्ठ भेटिएन',
  description: 'The requested page or record could not be found in the Drishti Nepal public data index.',
  path: '/404',
  noindex: true,
})

const DIRECTORY_HUBS = [
  {
    href: '/market',
    title: 'NEPSE & Capital Market',
    desc: 'Real-time benchmark, live market board, sector heatmaps, listed equities and floor sheets.',
    tag: 'Live feed',
    category: 'market',
    icon: TrendingUp,
  },
  {
    href: '/places',
    title: 'Provinces & Districts',
    desc: 'Profiles for 7 provinces, 77 districts, and all 753 local units with 2021 Census data.',
    tag: '753 Local units',
    category: 'places',
    icon: MapPin,
  },
  {
    href: '/projects',
    title: 'Infrastructure Projects',
    desc: 'National pride projects, budgets, reported physical progress and contractor audit trails.',
    tag: 'Civic works',
    category: 'projects',
    icon: Construction,
  },
  {
    href: '/companies',
    title: 'Public Enterprises',
    desc: 'Financial health, annual net profits, balance sheets and state equity in public corporations.',
    tag: 'State enterprises',
    category: 'companies',
    icon: Building2,
  },
  {
    href: '/environment',
    title: 'Environment & Hazards',
    desc: 'DHM real-time river gauges, weather forecasts, air quality index, and USGS seismic alerts.',
    tag: 'Hourly feeds',
    category: 'environment',
    icon: CloudSun,
  },
  {
    href: '/sources',
    title: 'Official Sources Registry',
    desc: 'Directory of 40+ government ministries, Nepal Rastra Bank, World Bank, and open endpoints.',
    tag: 'Primary sources',
    category: 'sources',
    icon: FileText,
  },
]

export default function NotFound() {
  return (
    <main className="content-wrap not-found-page">
      {/* ─── Hero Row ─── */}
      <section className="not-found-hero">
        <div className="not-found-hero-copy">

          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-lede">
            The page or dataset you requested does not exist in Drishti&apos;s index. It may have
            been moved, updated to a newer reporting period, or is pending publication in official gazettes.
          </p>
          <NotFoundInteractive />
        </div>

        {/* ─── 404 Visual Showcase Card (Rich Color Palette) ─── */}
        <aside className="not-found-snapshot" aria-label="404 Record Not Found">
          <div className="not-found-snapshot-header">
            <span className="not-found-header-tag">STATUS CODE</span>
            <span className="not-found-code">UNRESOLVED</span>
          </div>

          <div className="not-found-numeral-hero">
            <span className="not-found-numeral">404</span>
            <span className="not-found-numeral-devanagari">४०४</span>
          </div>

          <div className="not-found-snapshot-footer">
            <span className="not-found-snapshot-stamp">DRISHTI · PUBLIC RECORD</span>
            <span className="not-found-status-dot-pulse" title="Ledger status active" />
          </div>
        </aside>
      </section>

      {/* ─── Directory Grid ─── */}
      <section className="not-found-directory" aria-label="Explore public data registers">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VERIFIED REGISTERS</p>
            <h2>Explore public records across Nepal</h2>
          </div>
          <Link href="/sources" className="text-button">
            <span>All sources</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="not-found-grid">
          {DIRECTORY_HUBS.map((hub) => {
            const Icon = hub.icon
            return (
              <Link
                key={hub.href}
                href={hub.href}
                className={`not-found-card panel card-theme-${hub.category}`}
              >
                <div className="not-found-card-head">
                  <div className={`not-found-card-icon icon-theme-${hub.category}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`not-found-card-tag tag-theme-${hub.category}`}>
                    {hub.tag}
                  </span>
                </div>
                <h3>{hub.title}</h3>
                <p className="muted">{hub.desc}</p>
                <div className="not-found-card-link">
                  <span>Open register</span>
                  <ArrowRight size={13} className="not-found-card-arrow" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Quiet Bottom Note ─── */}
      <div className="not-found-footer-note">
        <p>
          Looking for a specific official gazette or public filing? Trace verified endpoints in our{' '}
          <Link href="/sources">Sources Registry</Link> or view{' '}
          <Link href="/about">our data methodology</Link>.
        </p>
      </div>
    </main>
  )
}
