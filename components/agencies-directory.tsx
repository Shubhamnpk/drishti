'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  CATEGORY_LABELS,
  FEDERAL_AGENCIES,
  generateDistrictAgencies,
  generatePalikaAgencies,
  generateProvincialAgencies,
  getAgencyStats,
  type AgencyLevel,
  type GovernmentAgency,
} from '@/lib/government-agencies'
import { DISTRICTS, LOCAL_UNITS, PROVINCES } from '@/lib/geo-constants'
import {
  AgencyDetailModal,
  CATEGORY_ICONS,
  getCategoryAccent,
} from './agency-detail-modal'

const QUICK_SEARCHES = [
  { label: 'Citizenship & Passport (DAO)', query: 'dao' },
  { label: 'Police 100', query: 'police' },
  { label: 'Courts & Justice', query: 'court' },
  { label: 'Land Revenue (Malpot)', query: 'malpot' },
  { label: 'Survey (Napi)', query: 'napi' },
  { label: 'Chief Minister', query: 'chief minister' },
  { label: 'Metropolitan Cities', query: 'metropolitan' },
  { label: 'Health & Hospitals', query: 'hospital' },
]

export function AgenciesDirectory() {
  const [query, setQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<AgencyLevel | 'all'>('all')
  const [selectedProvince, setSelectedProvince] = useState<string>('all')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState<number>(48)
  const [activeAgency, setActiveAgency] = useState<GovernmentAgency | null>(null)

  const stats = useMemo(() => getAgencyStats(), [])

  // Filter available districts by chosen province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'all') return DISTRICTS
    return DISTRICTS.filter(d => d.province === selectedProvince)
  }, [selectedProvince])

  // Compile pool based on high-level filters
  const allAgencies = useMemo(() => {
    const list: GovernmentAgency[] = []

    // 1. Federal
    if (selectedLevel === 'all' || selectedLevel === 'federal') {
      list.push(...FEDERAL_AGENCIES)
    }

    // 2. Provincial
    if (selectedLevel === 'all' || selectedLevel === 'provincial') {
      const provinces =
        selectedProvince === 'all'
          ? PROVINCES
          : PROVINCES.filter(p => p.name === selectedProvince)
      for (const prov of provinces) {
        list.push(...generateProvincialAgencies(prov.name))
      }
    }

    // 3. District
    if (selectedLevel === 'all' || selectedLevel === 'district') {
      let districts = DISTRICTS
      if (selectedDistrict !== 'all') {
        districts = DISTRICTS.filter(d => d.name === selectedDistrict)
      } else if (selectedProvince !== 'all') {
        districts = DISTRICTS.filter(d => d.province === selectedProvince)
      }
      for (const dist of districts) {
        list.push(...generateDistrictAgencies(dist))
      }
    }

    // 4. Local Governments / Palikas
    if (selectedLevel === 'all' || selectedLevel === 'palika') {
      let palikas = LOCAL_UNITS
      if (selectedDistrict !== 'all') {
        palikas = LOCAL_UNITS.filter(u => u.district === selectedDistrict)
      } else if (selectedProvince !== 'all') {
        palikas = LOCAL_UNITS.filter(u => u.province === selectedProvince)
      }
      for (const unit of palikas) {
        list.push(...generatePalikaAgencies(unit))
      }
    }

    return list
  }, [selectedLevel, selectedProvince, selectedDistrict])

  // Apply search query and category filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allAgencies.filter(agency => {
      if (selectedCategory !== 'all' && agency.category !== selectedCategory) {
        return false
      }
      if (selectedProvince !== 'all' && agency.province && agency.province !== selectedProvince) {
        return false
      }
      if (selectedDistrict !== 'all' && agency.district && agency.district !== selectedDistrict) {
        return false
      }

      if (!q) return true

      const haystack = [
        agency.name,
        agency.nameNe,
        agency.acronym ?? '',
        agency.category,
        agency.categoryLabel,
        agency.level,
        agency.province ?? '',
        agency.district ?? '',
        agency.palika ?? '',
        agency.address,
        ...(agency.services ?? []),
        agency.description,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [allAgencies, query, selectedCategory, selectedProvince, selectedDistrict])

  const displayed = useMemo(() => {
    return filtered.slice(0, visibleCount)
  }, [filtered, visibleCount])

  const resetFilters = () => {
    setQuery('')
    setSelectedLevel('all')
    setSelectedProvince('all')
    setSelectedDistrict('all')
    setSelectedCategory('all')
    setVisibleCount(48)
  }

  const hasActiveFilters =
    query !== '' ||
    selectedLevel !== 'all' ||
    selectedProvince !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedCategory !== 'all'

  return (
    <>
      <div className="content-wrap" style={{ paddingBottom: '3.5rem' }}>
        {/* Breadcrumbs */}
        <nav className="place-crumbs" aria-label="Breadcrumb" style={{ marginBottom: '.8rem' }}>
          <Link href="/"><Building2 size={13} /> Home</Link>
          <span>/</span>
          <Link href="/places">Places</Link>
          <span>/</span>
          <strong>Government Agencies</strong>
        </nav>

        {/* Hero Header */}
        <section className="place-hero" style={{ marginBottom: '1.2rem' }}>
          <div className="place-hero-copy">
            <p className="eyebrow">
              <Building2 size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> REPUBLIC OF NEPAL · STATUTORY DIRECTORY
            </p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', lineHeight: 1.15 }}>
              Government Agencies Directory
            </h1>
            <p className="place-ne" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              नेपाल सरकारका मन्त्रालय, विभाग, संवैधानिक निकाय, जिल्ला प्रशासन तथा स्थानीय सरकारहरू
            </p>
            <p className="lede" style={{ maxWidth: '800px', marginTop: '.35rem' }}>
              Click any agency to open its complete details, official contacts, citizen services, and jurisdiction profile.
            </p>

            <div className="place-hero-tags" style={{ marginTop: '.75rem' }}>
              <span className="place-tag">{stats.totalFederal} Federal Ministries &amp; Central Bodies</span>
              <span className="place-tag">{stats.totalProvinces} Provincial Assemblies</span>
              <span className="place-tag">{stats.totalDistricts} District Administrations</span>
              <span className="place-tag">{stats.totalPalikas.toLocaleString()} Municipal Governments</span>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="panel" style={{ padding: '1rem', marginBottom: '1.2rem' }}>
          {/* Main Search Input */}
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '.75rem' }}>
            <label className="gov-agency-search" style={{ margin: 0, width: '100%', maxWidth: 'none', flex: 1 }}>
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search government agencies</span>
              <input
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setVisibleCount(48)
                }}
                placeholder="Search by office name (English or नेपाली), acronym (DAO, DPO, MoF, NRB), citizen services or place…"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{ background: 'transparent', border: 0, color: 'var(--text-tertiary)', cursor: 'pointer', padding: '.2rem' }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          {/* Quick Search Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', alignItems: 'center', marginBottom: '.85rem' }}>
            <span style={{ fontSize: '.65rem', color: 'var(--text-tertiary)', fontWeight: 650, marginRight: '.2rem' }}>
              Quick searches:
            </span>
            {QUICK_SEARCHES.map(item => {
              const active = query.toLowerCase() === item.query
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setQuery(item.query)
                    setVisibleCount(48)
                  }}
                  style={{
                    fontSize: '.64rem',
                    padding: '.2rem .5rem',
                    borderRadius: 7,
                    border: '1px solid',
                    borderColor: active ? 'var(--accent)' : 'var(--border-light)',
                    background: active ? 'var(--accent-light)' : 'var(--bg-sunken)',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Secondary Dropdown Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 175px), 1fr))', gap: '.55rem', alignItems: 'center' }}>
            {/* Level Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '.2rem' }}>
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={e => {
                  setSelectedLevel(e.target.value as AgencyLevel | 'all')
                  setVisibleCount(48)
                }}
                style={{
                  width: '100%',
                  padding: '.38rem .55rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text)',
                  fontSize: '.72rem',
                }}
              >
                <option value="all">All Levels</option>
                <option value="federal">Federal Executive &amp; Central</option>
                <option value="provincial">Provincial Government</option>
                <option value="district">District Administration</option>
                <option value="palika">Local Governments (Palikas)</option>
              </select>
            </div>

            {/* Province Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '.2rem' }}>
                Province
              </label>
              <select
                value={selectedProvince}
                onChange={e => {
                  setSelectedProvince(e.target.value)
                  setSelectedDistrict('all')
                  setVisibleCount(48)
                }}
                style={{
                  width: '100%',
                  padding: '.38rem .55rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text)',
                  fontSize: '.72rem',
                }}
              >
                <option value="all">All 7 Provinces</option>
                {PROVINCES.map(p => (
                  <option key={p.slug} value={p.name}>
                    {p.name} Province
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '.2rem' }}>
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={e => {
                  setSelectedDistrict(e.target.value)
                  setVisibleCount(48)
                }}
                style={{
                  width: '100%',
                  padding: '.38rem .55rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text)',
                  fontSize: '.72rem',
                }}
              >
                <option value="all">
                  {selectedProvince === 'all' ? 'All 77 Districts' : `All in ${selectedProvince}`}
                </option>
                {availableDistricts.map(d => (
                  <option key={d.slug} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '.2rem' }}>
                Sector
              </label>
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value)
                  setVisibleCount(48)
                }}
                style={{
                  width: '100%',
                  padding: '.38rem .55rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text)',
                  fontSize: '.72rem',
                }}
              >
                <option value="all">All Sectors</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary & Reset */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.85rem', paddingTop: '.55rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '.4rem' }}>
            <span style={{ fontSize: '.7rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{displayed.length.toLocaleString()}</strong> of <strong>{filtered.length.toLocaleString()}</strong> agencies · Click any card for details
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.3rem',
                  fontSize: '.66rem',
                  padding: '.22rem .5rem',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-sunken)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
        </section>

        {/* Sweet, Simple, Elegant Cards Grid */}
        {displayed.length > 0 ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '.65rem',
              }}
            >
              {displayed.map(agency => {
                const accent = getCategoryAccent(agency.category)

                return (
                  <button
                    key={agency.id}
                    type="button"
                    onClick={() => setActiveAgency(agency)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.8rem',
                      padding: '.85rem .95rem',
                      borderRadius: 14,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-elevated)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all .16s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = accent.border
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }}
                  >
                    {/* Cute Icon as Main Anchor */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: accent.bg,
                        color: accent.color,
                        flexShrink: 0,
                      }}
                    >
                      {CATEGORY_ICONS[agency.category] ?? <Building2 size={21} />}
                    </div>

                    {/* Agency Info Summary */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.2rem' }}>
                        <span
                          style={{
                            fontSize: '.54rem',
                            fontWeight: 750,
                            textTransform: 'uppercase',
                            padding: '.12rem .4rem',
                            borderRadius: 999,
                            background: accent.bg,
                            color: accent.color,
                          }}
                        >
                          {agency.level}
                        </span>
                        {agency.acronym && (
                          <span
                            style={{
                              fontSize: '.55rem',
                              fontWeight: 800,
                              padding: '.06rem .32rem',
                              borderRadius: 4,
                              background: 'var(--bg-sunken)',
                              color: 'var(--accent)',
                            }}
                          >
                            {agency.acronym}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: '.82rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {agency.name}
                      </h3>

                      {agency.nameNe && agency.nameNe !== agency.name ? (
                        <p
                          style={{
                            margin: '.12rem 0 0',
                            fontSize: '.68rem',
                            color: 'var(--text-tertiary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {agency.nameNe}
                        </p>
                      ) : (
                        <p
                          style={{
                            margin: '.12rem 0 0',
                            fontSize: '.66rem',
                            color: 'var(--text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '.25rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <MapPin size={11} /> {agency.address}
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  </button>
                )
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < filtered.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.6rem' }}>
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + 48)}
                  style={{
                    padding: '.55rem 1.4rem',
                    borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '.75rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Load more offices ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="gov-agency-state" style={{ padding: '2.5rem 1rem' }}>
            <Building2 size={32} style={{ margin: '0 auto .6rem', color: 'var(--text-tertiary)', display: 'block' }} />
            <h3 style={{ fontSize: '.95rem', margin: '0 0 .3rem' }}>No government agencies match your search</h3>
            <p style={{ margin: '0 0 .8rem', color: 'var(--text-secondary)' }}>
              Try searching for &ldquo;DAO&rdquo;, &ldquo;Police&rdquo;, &ldquo;Court&rdquo;, &ldquo;Citizenship&rdquo;, or resetting your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: '.45rem .9rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-sunken)',
                color: 'var(--text)',
                fontSize: '.72rem',
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Side Panel / Modal Drawer */}
      <AgencyDetailModal
        agency={activeAgency}
        onClose={() => setActiveAgency(null)}
      />
    </>
  )
}
