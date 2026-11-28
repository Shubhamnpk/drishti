'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Building2, Compass, Database, FileText, Landmark, MapPin,
  Search, TrendingUp, X, ArrowUpRight, ChevronRight,
} from 'lucide-react'
import { companies, projects, companySlug, projectSlug, sources } from '@/lib/data'
import { DISTRICTS, LOCAL_UNITS, PROVINCES } from '@/lib/geo-constants'
import { FEDERAL_AGENCIES, generateDistrictAgencies, generateProvincialAgencies } from '@/lib/government-agencies'

type Kind = 'company' | 'project' | 'province' | 'district' | 'palika' | 'stock' | 'dataset' | 'source' | 'agency'
type FilterKind = Kind | 'all'

type Hit = {
  id: string
  kind: Kind
  label: string
  sub: string
  href: string
  terms?: string
  external?: boolean
  stock?: { price: string; change: string; turnover: string; positive: boolean }
}

const KIND_ICON: Record<Kind, React.ReactNode> = {
  company:  <Building2  size={13} />,
  project:  <Compass    size={13} />,
  province: <Landmark   size={13} />,
  district: <MapPin     size={13} />,
  palika:   <MapPin     size={13} />,
  stock:    <TrendingUp size={13} />,
  dataset:  <Database   size={13} />,
  source:   <FileText   size={13} />,
  agency:   <Landmark   size={13} />,
}

const KIND_LABEL: Record<Kind, string> = {
  company:  'Company',
  project:  'Project',
  province: 'Province',
  district: 'District',
  palika:   'Local unit',
  stock:    'NEPSE',
  dataset:  'Dataset',
  source:   'Source',
  agency:   'Agency',
}

const KIND_PLURAL: Record<Kind, string> = {
  company:  'Companies',
  project:  'Projects',
  province: 'Provinces',
  district: 'Districts',
  palika:   'Local units',
  stock:    'Stocks',
  dataset:  'Datasets',
  source:   'Sources',
  agency:   'Agencies',
}

const TABS: { key: FilterKind; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'agency',   label: 'Agencies' },
  { key: 'province', label: 'Provinces' },
  { key: 'district', label: 'Districts' },
  { key: 'palika',   label: 'Local units' },
  { key: 'stock',    label: 'Stocks' },
  { key: 'company',  label: 'Companies' },
  { key: 'project',  label: 'Projects' },
  { key: 'dataset',  label: 'Datasets' },
  { key: 'source',   label: 'Sources' },
]

const SUGGESTIONS: { label: string; kind: Kind | 'query' }[] = [
  { label: 'Kathmandu',  kind: 'district'  },
  { label: 'Pokhara',   kind: 'district'  },
  { label: 'NABIL',     kind: 'stock'     },
  { label: 'DAO',       kind: 'agency'    },
  { label: 'Police',    kind: 'agency'    },
  { label: 'NEA',       kind: 'company'   },
  { label: 'hydropower', kind: 'query'    },
  { label: 'census',    kind: 'query'     },
  { label: 'Mustang',   kind: 'district'  },
  { label: 'Bagmati',   kind: 'province'  },
]

const CAT_CARDS: [Kind, string, string, string][] = [
  ['agency',   'Government agencies', '/agencies',   'Ministries & statutory offices'],
  ['province', 'Provinces',           '/provinces',  `${PROVINCES.length} provinces`],
  ['district', 'Districts',           '/districts',  `${DISTRICTS.length} districts`],
  ['palika',   'Local units',         '/districts',  `${LOCAL_UNITS.length.toLocaleString()} units`],
  ['stock',    'Stocks',              '/market',     'NEPSE securities'],
  ['company',  'Companies',           '/companies',  'Public & private firms'],
  ['project',  'Projects',            '/projects',   'Development projects'],
]

function normalize(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function scoreHit(hit: Hit, query: string): number {
  const label      = normalize(hit.label)
  const terms      = normalize(`${hit.terms ?? ''} ${hit.sub}`)
  const searchable = `${label} ${terms}`
  if (label === query)                                                       return 130
  if (label.startsWith(query))                                               return 115
  if (label.split(' ').some(w => w.startsWith(query)))                      return 100
  if (label.includes(query))                                                 return 90
  const words = query.split(' ').filter(Boolean)
  if (words.length > 1 && words.every(w => searchable.includes(w)))         return 75
  if (terms.includes(query))                                                 return 65
  return 0
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="sp-mark">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="content-wrap"><p className="muted">Loading…</p></main>}>
      <SearchInner />
    </Suspense>
  )
}

function SearchInner() {
  const sp = useSearchParams()
  const [q, setQ]                     = useState(sp.get('q') ?? '')
  const [tab, setTab]                 = useState<FilterKind>('all')
  const [remoteHits, setRemoteHits]   = useState<Hit[]>([])
  const [searching, setSearching]     = useState(false)
  const [focused, setFocused]         = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* "/" to focus */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' &&
          document.activeElement !== inputRef.current &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* in-memory index */
  const index = useMemo(() => {
    const districtByName = new Map(DISTRICTS.map(d => [d.name, d]))
    const out: Hit[] = []
    for (const p of PROVINCES)
      out.push({ id: `province:${p.slug}`, kind: 'province', label: p.name, sub: 'Federal province of Nepal', href: `/provinces/${p.slug}` })
    for (const d of DISTRICTS)
      out.push({ id: `district:${d.slug}`, kind: 'district', label: d.name, sub: `${d.province} Province · District`, href: `/districts/${d.slug}` })
    for (const u of LOCAL_UNITS) {
      const district = districtByName.get(u.district)
      if (!district) continue
      out.push({
        id: `palika:${district.slug}:${u.slug}`,
        kind: 'palika',
        label: u.name,
        sub: `${u.district} · ${u.province} · ${u.kind.replace(/_/g, ' ')}`,
        terms: `${u.slug.replace(/-/g, ' ')} local unit municipality rural palika`,
        href: `/districts/${district.slug}/${u.slug}`,
      })
    }
    for (const c of companies)
      out.push({ id: `company:${companySlug(c)}`, kind: 'company', label: c.name, sub: c.sector, terms: `${c.ownership ?? ''} ${c.operatingStatus} ${c.note}`, href: `/companies/${companySlug(c)}` })
    for (const p of projects)
      out.push({ id: `project:${projectSlug(p)}`, kind: 'project', label: p.name, sub: `${p.location} · ${p.category} · ${p.status}`, terms: `${p.ministry} ${p.description ?? ''} ${p.source}`, href: `/projects/${projectSlug(p)}` })
    for (const s of sources)
      out.push({ id: `source:${s.title}:${s.url}`, kind: 'source', label: s.title, sub: `${s.publisher} · ${s.type} · ${s.date}`, href: s.url, terms: `${s.publisher} ${s.type} ${s.url}`, external: true })
    for (const ag of FEDERAL_AGENCIES) {
      out.push({
        id: `agency:${ag.id}`,
        kind: 'agency',
        label: `${ag.name}${ag.acronym ? ` (${ag.acronym})` : ''}`,
        sub: `${ag.categoryLabel} · ${ag.level} · ${ag.address}`,
        terms: `${ag.nameNe} ${ag.acronym ?? ''} ${ag.services.join(' ')} ${ag.description} government agency ministry`,
        href: `/agencies?q=${encodeURIComponent(ag.acronym || ag.name)}`,
      })
    }
    for (const prov of PROVINCES) {
      for (const ag of generateProvincialAgencies(prov.name)) {
        out.push({
          id: `agency:${ag.id}`,
          kind: 'agency',
          label: ag.name,
          sub: `${ag.categoryLabel} · ${ag.province} Province`,
          terms: `${ag.nameNe} ${ag.services.join(' ')} government office ministry provincial`,
          href: `/agencies?q=${encodeURIComponent(ag.name)}`,
        })
      }
    }
    for (const d of DISTRICTS) {
      out.push({
        id: `agency:${d.slug}-dao`,
        kind: 'agency',
        label: `District Administration Office (DAO), ${d.name}`,
        sub: `Civil administration & passport/citizenship · ${d.province}`,
        terms: `DAO CDO जिल्ला प्रशासन कार्यालय citizenship passport ${d.name}`,
        href: `/districts/${d.slug}`,
      })
      out.push({
        id: `agency:${d.slug}-dpo`,
        kind: 'agency',
        label: `District Police Office (DPO), ${d.name}`,
        sub: `Law enforcement & emergency 100 · ${d.province}`,
        terms: `DPO police प्रहरी 100 crime safety ${d.name}`,
        href: `/districts/${d.slug}`,
      })
    }
    return out
  }, [])

  /* debounced remote fetch */
  useEffect(() => {
    const query = q.trim()
    if (normalize(query).length < 2) { setRemoteHits([]); setSearching(false); return }
    const ctrl = new AbortController()
    setSearching(true)
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error('unavailable')
        const data = await res.json() as { hits?: Hit[] }
        setRemoteHits(data.hits ?? [])
      } catch { if (!ctrl.signal.aborted) setRemoteHits([]) }
      finally   { if (!ctrl.signal.aborted) setSearching(false) }
    }, 250)
    return () => { window.clearTimeout(timer); ctrl.abort() }
  }, [q])

  /* scored results */
  const results = useMemo(() => {
    const query = normalize(q)
    if (!query) return []
    const combined = new Map<string, Hit>()
    for (const hit of [...index, ...remoteHits]) {
      if (tab !== 'all' && hit.kind !== tab) continue
      if (scoreHit(hit, query) > 0) combined.set(hit.id, hit)
    }
    return [...combined.values()]
      .sort((a, b) => scoreHit(b, normalize(q)) - scoreHit(a, normalize(q)) || a.label.localeCompare(b.label))
      .slice(0, 80)
  }, [index, q, remoteHits, tab])

  /* per-kind counts */
  const counts = useMemo(() => {
    const query = normalize(q)
    if (!query) return {} as Record<FilterKind, number>
    const all = new Map<string, Hit>()
    for (const hit of [...index, ...remoteHits])
      if (scoreHit(hit, query) > 0) all.set(hit.id, hit)
    const hits = [...all.values()]
    const rec: Record<string, number> = { all: hits.length }
    for (const h of hits) rec[h.kind] = (rec[h.kind] ?? 0) + 1
    return rec as Record<FilterKind, number>
  }, [index, q, remoteHits])

  /* grouped for "all" tab */
  const grouped = useMemo(() => {
    if (tab !== 'all') return null
    const groups: Partial<Record<Kind, Hit[]>> = {}
    for (const hit of results) {
      if (!groups[hit.kind]) groups[hit.kind] = []
      groups[hit.kind]!.push(hit)
    }
    return groups
  }, [results, tab])

  const query        = q.trim()
  const displayQuery = normalize(q)
  const handleClear  = useCallback(() => { setQ(''); inputRef.current?.focus() }, [])

  return (
    <main className="sp-root">

      {/* ── hero (desktop only) ── */}
      <div className="sp-hero content-wrap">
        <p className="eyebrow">Nepal data search</p>
        <h1 className="sp-hero-title">Find anything</h1>
        <p className="sp-hero-sub">
          Search across {PROVINCES.length} provinces, {DISTRICTS.length} districts,{' '}
          {LOCAL_UNITS.length.toLocaleString()} local units, NEPSE securities, companies, projects, datasets and source records.
        </p>
      </div>

      {/* ── sticky search bar ── */}
      <div className={`sp-bar${focused ? ' is-focused' : ''}`}>
        <div className="sp-bar-inner content-wrap">

          <label className="sp-input-wrap">
            <span className="sp-input-icon">
              {searching
                ? <span className="sp-spinner" aria-hidden="true" />
                : <Search size={18} />}
            </span>
            <input
              ref={inputRef}
              className="sp-input"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label="Search Nepal data"
              placeholder="Search provinces, districts, stocks, companies…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {q ? (
              <button type="button" className="sp-clear" onClick={handleClear} aria-label="Clear">
                <X size={14} />
              </button>
            ) : (
              <kbd className="sp-kbd" aria-hidden="true">/</kbd>
            )}
          </label>

          <div className="sp-tabs" role="tablist" aria-label="Filter results">
            {TABS.map(item => {
              const count = counts[item.key]
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  className={`sp-tab${tab === item.key ? ' is-active' : ''}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                  {query && count != null && count > 0 && (
                    <span className="sp-tab-badge">{count > 99 ? '99+' : count}</span>
                  )}
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* ── body ── */}
      <div className="content-wrap sp-body">
        {!query ? (

          /* landing */
          <div className="sp-landing">
            <p className="sp-section-label">Popular searches</p>
            <div className="sp-chips">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  type="button"
                  className={`sp-chip sp-chip-${s.kind}`}
                  onClick={() => setQ(s.label)}
                >
                  <span className="sp-chip-icon">{KIND_ICON[s.kind as Kind] ?? <Search size={12} />}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <p className="sp-section-label" style={{ marginTop: '1.8rem' }}>Browse by category</p>
            <div className="sp-cats">
              {CAT_CARDS.map(([kind, label, href, note]) => (
                <Link key={kind} href={href} className={`sp-cat sp-cat-${kind}`}>
                  <span className="sp-cat-icon">{KIND_ICON[kind]}</span>
                  <span className="sp-cat-body">
                    <strong>{label}</strong>
                    <small>{note}</small>
                  </span>
                  <ChevronRight size={14} className="sp-cat-arrow" />
                </Link>
              ))}
            </div>
          </div>

        ) : (

          /* results */
          <div className="sp-results-wrap">

            {/* meta bar */}
            <div className="sp-meta">
              <span className="sp-meta-text">
                {searching ? (
                  <span className="sp-meta-searching">Searching…</span>
                ) : (
                  <>
                    <strong>{results.length}</strong>
                    {' '}result{results.length !== 1 ? 's' : ''} for{' '}
                    <span className="sp-meta-query">&ldquo;{query}&rdquo;</span>
                  </>
                )}
              </span>
              {tab !== 'all' && !searching && (
                <button type="button" className="sp-filter-clear" onClick={() => setTab('all')}>
                  × Clear filter
                </button>
              )}
            </div>

            {/* zero state */}
            {results.length === 0 ? (
              <div className="sp-empty">
                <div className="sp-empty-glyph" aria-hidden="true"><Search size={26} /></div>
                <p className="sp-empty-title">
                  {searching ? 'Searching…' : `No results for \u201c${query}\u201d`}
                </p>
                {!searching && (
                  <>
                    <p className="sp-empty-hint">Try a district name, NEPSE symbol, project keyword or palika.</p>
                    <div className="sp-chips sp-chips-sm">
                      {SUGGESTIONS.slice(0, 5).map(s => (
                        <button key={s.label} type="button" className="sp-chip sp-chip-query" onClick={() => setQ(s.label)}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : tab === 'all' && grouped ? (
              /* grouped */
              <div className="sp-groups">
                {(Object.entries(grouped) as [Kind, Hit[]][]).map(([kind, hits]) => (
                  <section key={kind} className="sp-group">
                    <header className="sp-group-head">
                      <span className={`sp-group-dot sp-dot-${kind}`} aria-hidden="true" />
                      <span className="sp-group-label">{KIND_PLURAL[kind]}</span>
                      <span className="sp-group-count">{hits.length}</span>
                    </header>
                    <ul className="sp-list">
                      {hits.map(hit => <HitRow key={hit.id} hit={hit} query={displayQuery} />)}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              /* flat */
              <ul className="sp-list">
                {results.map(hit => <HitRow key={hit.id} hit={hit} query={displayQuery} />)}
              </ul>
            )}

          </div>
        )}
      </div>
    </main>
  )
}

function HitRow({ hit, query }: { hit: Hit; query: string }) {
  const cls = `sp-hit sp-hit-${hit.kind}${hit.stock ? ' has-stock' : ''}${hit.external ? ' is-ext' : ''}`

  const inner = (
    <>
      <span className={`sp-kind kind-${hit.kind}`}>
        {KIND_ICON[hit.kind]}
        <span>{KIND_LABEL[hit.kind]}</span>
      </span>
      <span className="sp-hit-body">
        <strong className="sp-hit-label"><Highlight text={hit.label} query={query} /></strong>
        <small className="sp-hit-sub">{hit.sub}</small>
      </span>
      {hit.stock ? (
        <span className="sp-stock" aria-label={`Price ${hit.stock.price}, change ${hit.stock.change}`}>
          <strong className="sp-stock-price">{hit.stock.price}</strong>
          <span className={hit.stock.positive ? 'sp-pos' : 'sp-neg'}>{hit.stock.change}</span>
          <small className="sp-stock-vol">{hit.stock.turnover}</small>
        </span>
      ) : (
        <span className="sp-hit-caret" aria-hidden="true">
          {hit.external ? <ArrowUpRight size={14} /> : <ChevronRight size={14} />}
        </span>
      )}
    </>
  )

  return (
    <li>
      {hit.external
        ? <a href={hit.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
        : <Link href={hit.href} className={cls}>{inner}</Link>}
    </li>
  )
}
