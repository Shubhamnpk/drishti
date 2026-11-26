'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, FolderKanban, Eye, ChevronRight, Map, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { StatusBadge } from '@/components/shared'
import { DetailDrawer } from '@/components/detail-drawer'
import { DistrictDrilldown } from '@/components/district-drilldown'
import { HydroAtlas } from '@/components/hydro-atlas'
import { projects, slugify, parseBudgetCr, utilizationPct, PROVINCES, PROJECT_FX_NOTE, PROJECT_FX_SOURCE } from '@/lib/data'
import { matchDistricts } from '@/lib/geo'
import { fetchWbProjectCount } from '@/lib/api'
import { formatNprText } from '@/lib/currency'

const NepalMapReal = dynamic(() => import('@/components/nepal-map-real').then(m => m.NepalMapReal), {
  ssr: false,
  loading: () => <div className="bg-sunken border border-line-light rounded-lg text-tertiary" style={{ padding: '2rem', textAlign: 'center', fontSize: '.78rem' }}>Loading map…</div>,
})
import type { Project } from '@/lib/types'

const STATUS_FILTERS = ['All', 'Completed', 'On track', 'At risk', 'Delayed'] as const
const CATEGORY_FILTERS = ['All', 'Hydropower', 'Power', 'Highway', 'Airport', 'Irrigation', 'Water', 'Heritage', 'Sports', 'Rail', 'Conservation'] as const
const SORTS = ['Newest', 'Budget: high to low', 'Budget: low to high', 'Progress: high to low', 'Progress: low to high', 'Name A-Z'] as const

export default function ProjectsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All')
  const [catFilter, setCatFilter] = useState<(typeof CATEGORY_FILTERS)[number]>('All')
  const [provinceFilter, setProvinceFilter] = useState<string>('All')
  const [districtFilter, setDistrictFilter] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Newest')
  const [selected, setSelected] = useState<Project | null>(null)
  const [quarter, setQuarter] = useState('Q1')
  const [wbCount, setWbCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchWbProjectCount().then(n => { if (!cancelled && n > 0) setWbCount(n) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const selectProvince = (p: string) => {
    setProvinceFilter(p)
    setDistrictFilter(null)
  }

  const provinceCounts = useMemo(() => {
    const c: Record<string, number> = { National: projects.filter(p => p.province === 'National').length }
    for (const pr of ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'] as const) {
      c[pr] = projects.filter(p => p.province === pr).length
    }
    return c
  }, [])

  const filtered = useMemo(() => {
    let out = projects.filter(
      x =>
        (statusFilter === 'All' || x.status === statusFilter) &&
        (catFilter === 'All' || x.category === catFilter) &&
        (provinceFilter === 'All' || x.province === provinceFilter) &&
        (districtFilter == null || matchDistricts(`${x.name} ${x.location} ${x.ministry}`).includes(districtFilter)) &&
        `${x.name} ${x.ministry} ${x.location} ${x.category}`.toLowerCase().includes(query.trim().toLowerCase())
    )
    if (sort === 'Budget: high to low' || sort === 'Budget: low to high') {
      out = [...out].sort((a, b) => {
        const av = parseBudgetCr(a.budget) ?? -1
        const bv = parseBudgetCr(b.budget) ?? -1
        return sort === 'Budget: high to low' ? bv - av : av - bv
      })
    } else if (sort === 'Progress: high to low' || sort === 'Progress: low to high') {
      out = [...out].sort((a, b) => {
        const av = a.progress ?? -1
        const bv = b.progress ?? -1
        return sort === 'Progress: high to low' ? bv - av : av - bv
      })
    } else if (sort === 'Name A-Z') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name))
    }
    return out
  }, [query, statusFilter, catFilter, provinceFilter, districtFilter, sort])

  const isConcreteProvince = (PROVINCES as readonly string[]).includes(provinceFilter)
  const provinceItems = useMemo(
    () => projects.filter(x => x.province === provinceFilter),
    [provinceFilter]
  )

  const counts = {
    total: projects.length,
    onTrack: projects.filter(p => p.status === 'On track').length,
    atRisk: projects.filter(p => p.status === 'At risk').length,
    delayed: projects.filter(p => p.status === 'Delayed').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  }
  const hasActiveFilters = Boolean(query.trim()) || statusFilter !== 'All' || catFilter !== 'All' || provinceFilter !== 'All' || districtFilter != null

  return (
    <div className="content-wrap">
      {/* ── Hero ── */}
      <header className="projects-header">
        <div><p className="eyebrow">PUBLIC INFRASTRUCTURE &middot; NEPAL</p><h1>National projects</h1><p className="projects-intro">Follow major public works, their reported progress, budgets and latest evidence.</p></div>
        <Link href="/map" className="projects-map-link"><Map size={16} /> Open national map <ChevronRight size={15} /></Link>
      </header>
      <section className="projects-summary" aria-label="Portfolio summary">
        <div><span>Projects tracked</span><strong>{counts.total}</strong><small>{wbCount ? '+ ' + wbCount + ' World Bank projects' : 'National portfolio'}</small></div>
        <div><span>On track</span><strong>{counts.onTrack}</strong><small>Current status</small></div>
        <div><span>Need attention</span><strong>{counts.atRisk + counts.delayed}</strong><small>{counts.atRisk} at risk &middot; {counts.delayed} delayed</small></div>
        <div><span>Completed</span><strong>{counts.completed}</strong><small>Reported complete</small></div>
      </section>
      <section id="tracker" className="projects-tracker" style={{ scrollMarginTop: 80 }}>
        <div className="section-heading"><div><p className="eyebrow">PROJECT DIRECTORY</p><h2>Explore the portfolio</h2></div><span className="projects-result-count" aria-live="polite">{filtered.length} of {projects.length} projects</span></div>
        <details className="projects-data-note">
          <summary>About project data and reporting dates</summary>
          <p>National Pride figures use the NPC cumulative progress report through FY 2082/83; other projects may use different reporting dates. {PROJECT_FX_NOTE} <a href={PROJECT_FX_SOURCE} target="_blank" rel="noreferrer">Rate source</a></p>
        </details>
        <div className="projects-toolbar">
          <label className="search projects-search">
            <Search size={16} aria-hidden="true" />
            <input aria-label="Search projects" placeholder="Search project, agency, location or sector" value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}
          </label>
          <select aria-label="Filter projects by sector" value={catFilter} onChange={e => setCatFilter(e.target.value as typeof catFilter)}>{CATEGORY_FILTERS.map(f => <option key={f} value={f}>{f === 'All' ? 'All sectors' : f}</option>)}</select>
          <select aria-label="Filter projects by province" value={provinceFilter} onChange={e => selectProvince(e.target.value)}><option value="All">All provinces</option><option value="National">National</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select>
          <select aria-label="Sort projects" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>{SORTS.map(s => <option key={s} value={s}>{s === 'Newest' ? 'Latest first' : s}</option>)}</select>
          <button type="button" className={showMap ? 'projects-map-toggle is-active' : 'projects-map-toggle'} onClick={() => setShowMap(v => !v)} aria-expanded={showMap}><Map size={15} /> {showMap ? 'Hide map' : 'Map'}</button>
        </div>
        <div className="projects-filter-row">
          <span className="projects-filter-label">Status</span>
          <div className="projects-status-filters" aria-label="Filter by status">
            {STATUS_FILTERS.map(f => <button key={f} type="button" aria-pressed={statusFilter === f} className={statusFilter === f ? 'selected' : ''} onClick={() => setStatusFilter(f)}>{f}<span>{f !== 'All' ? projects.filter(p => p.status === f).length : projects.length}</span></button>)}
          </div>
          {hasActiveFilters && <button type="button" className="projects-reset" onClick={() => { setQuery(''); setStatusFilter('All'); setCatFilter('All'); setSort('Newest'); selectProvince('All') }}>Clear filters <X size={13} /></button>}
        </div>
        {showMap && <div className="projects-map-panel"><NepalMapReal selected={provinceFilter} onSelect={selectProvince} counts={provinceCounts} /></div>}
        {isConcreteProvince && <DistrictDrilldown province={provinceFilter} items={provinceItems} selected={districtFilter} onSelect={setDistrictFilter} />}
        {filtered.length === 0 ? (
          <div
            className="bg-sunken rounded-lg border border-dashed border-line"
            style={{
              marginTop: '1.5rem',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem' }}>No projects match this filter.</p>
            <p className="muted" style={{ margin: '.3rem 0 0' }}>
              Try adjusting search, status, or category.
            </p>
            <button
              onClick={() => {
                setQuery('')
                setStatusFilter('All')
                setCatFilter('All')
                selectProvince('All')
              }}
              className="text-primary bg-card rounded-[6px] border border-primary"
              style={{
                marginTop: '.75rem',
                fontSize: '.72rem',
                fontWeight: 600,
                padding: '.4rem .75rem',
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {filtered.map(p => (
              <div
                key={p.name}
                style={{ position: 'relative' }}
              >
                <Link
                  href={`/projects/${slugify(p.name)}`}
                  className="project-card"
                  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
                >
                  <img src={p.image} alt={p.name} />
                  <div className="project-top">
                    <span className="project-sector"><FolderKanban size={13} /> {p.category}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="project-card-title">{p.name}</h3>
                  <p className="project-card-location">{p.location}{p.province && p.province !== 'National' ? ', ' + p.province : ''}</p>
                  <div className="project-progress">
                    <div><span>Reported progress</span><strong>{p.progress == null ? 'Not reported' : p.progress + '%'}</strong></div>
                    {p.progress != null && <div className="project-progress-track"><span style={{ width: Math.min(100, Math.max(0, p.progress)) + '%' }} /></div>}
                  </div>
                  <div className="project-card-metrics">
                    <div><span>Approved budget</span><strong>{formatNprText(p.budget)}</strong></div>
                    <div><span>Target</span><strong>{p.target}</strong></div>
                  </div>
                  <div className="project-card-updated">Updated {p.updated} - {p.ministry}</div>
                  <div className="text-primary" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '.7rem', fontSize: '.68rem', fontWeight: 600 }}>
                    View details <ChevronRight size={13} />
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label={`Quick view ${p.name}`}
                  title="Quick view"
                  onClick={e => {
                    e.preventDefault()
                    setSelected(p)
                  }}
                  className="project-quick-view"
                >
                  <Eye size={16} strokeWidth={2.4} />
                  <span>Quick view</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <HydroAtlas />

      {selected && (
        <DetailDrawer selected={selected} quarter={quarter} onQuarterChange={setQuarter} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
