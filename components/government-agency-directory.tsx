'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  Search,
} from 'lucide-react'
import type { AgencyCategory, GovernmentAgency } from '@/lib/government-agencies'
import {
  AgencyDetailModal,
  CATEGORY_ICONS,
  getCategoryAccent,
} from './agency-detail-modal'

export type Office = GovernmentAgency

export function GovernmentAgencyDirectory({
  scope,
  place,
  districtName,
}: {
  scope: 'district' | 'province' | 'palika'
  place: string
  districtName?: string
}) {
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeAgency, setActiveAgency] = useState<Office | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setUnavailable(false)

    let url = `/api/government-agencies?scope=${scope}&name=${encodeURIComponent(place)}`
    if (districtName) {
      url += `&district=${encodeURIComponent(districtName)}`
    }

    fetch(url, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load offices')
        return response.json() as Promise<{ offices: Office[]; unavailable?: boolean }>
      })
      .then(data => {
        setOffices(data.offices ?? [])
        setUnavailable(Boolean(data.unavailable))
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOffices([])
          setUnavailable(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [scope, place, districtName])

  // Extract available categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const o of offices) {
      if (o.category) set.add(o.category)
    }
    return ['all', ...Array.from(set)]
  }, [offices])

  // Filtered offices
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return offices.filter(office => {
      const matchesCat = selectedCategory === 'all' || office.category === selectedCategory
      if (!matchesCat) return false
      if (!q) return true

      const searchTerms = [
        office.name,
        office.nameNe ?? '',
        office.acronym ?? '',
        office.category,
        office.address,
        ...(office.services ?? []),
        office.description ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return searchTerms.includes(q)
    })
  }, [offices, selectedCategory, query])

  const scopeLabel =
    scope === 'province'
      ? `${place} Province`
      : scope === 'district'
        ? `${place} District`
        : `${place}${districtName ? `, ${districtName}` : ''}`

  return (
    <>
      <section className="panel gov-agency-directory" aria-labelledby="gov-agency-title">
        <div className="panel-head gov-agency-head">
          <div>
            <span className="gov-agency-kicker">
              <Building2 size={13} /> Public Offices &amp; Services
            </span>
            <h3 id="gov-agency-title">Government agencies</h3>
            <p>Official statutory offices and public administration in {scopeLabel}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span className="gov-agency-count">
              {loading ? 'Loading…' : `${offices.length.toLocaleString()} offices`}
            </span>
            <Link
              href="/agencies"
              className="text-button"
              style={{ fontSize: '.72rem', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
            >
              National directory <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', margin: '.8rem 0 .5rem' }}>
          <label className="gov-agency-search" style={{ margin: 0, flex: '1 1 220px' }}>
            <Search size={14} aria-hidden="true" />
            <span className="sr-only">Filter government offices</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search office or service…"
            />
          </label>

          {categories.length > 2 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
              {categories.map(cat => {
                const label =
                  cat === 'all'
                    ? 'All'
                    : cat === 'administration'
                      ? 'Admin'
                      : cat === 'security'
                        ? 'Police'
                        : cat === 'judiciary'
                          ? 'Courts'
                          : cat === 'revenue'
                            ? 'Revenue'
                            : cat === 'health'
                              ? 'Health'
                              : cat === 'local_government'
                                ? 'Palika'
                                : cat.replaceAll('_', ' ')

                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '.25rem .55rem',
                      borderRadius: 8,
                      fontSize: '.66rem',
                      fontWeight: active ? 700 : 500,
                      border: '1px solid',
                      borderColor: active ? 'var(--accent)' : 'var(--border)',
                      background: active ? 'var(--accent-light)' : 'var(--bg-sunken)',
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {loading ? (
          <p className="gov-agency-state">Loading public offices…</p>
        ) : unavailable && offices.length === 0 ? (
          <p className="gov-agency-state">The office directory is temporarily unavailable. Please try again later.</p>
        ) : filtered.length ? (
          /* Cute, Simple, Elegant Cards Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: '.55rem',
              marginTop: '.6rem',
            }}
          >
            {filtered.map(office => {
              const accent = getCategoryAccent(office.category)
              return (
                <button
                  key={office.id}
                  type="button"
                  onClick={() => setActiveAgency(office)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.75rem',
                    padding: '.7rem .85rem',
                    borderRadius: 12,
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-elevated)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all .15s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.borderColor = accent.border
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                  }}
                >
                  {/* Cute Icon as Main Anchor */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      display: 'grid',
                      placeItems: 'center',
                      background: accent.bg,
                      color: accent.color,
                      flexShrink: 0,
                    }}
                  >
                    {CATEGORY_ICONS[office.category] ?? <Building2 size={20} />}
                  </div>

                  {/* Title and Subtitle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.15rem' }}>
                      <span
                        style={{
                          fontSize: '.54rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: accent.color,
                        }}
                      >
                        {office.categoryLabel || office.category.replaceAll('_', ' ')}
                      </span>
                      {office.acronym && (
                        <span
                          style={{
                            fontSize: '.55rem',
                            fontWeight: 750,
                            padding: '.05rem .3rem',
                            borderRadius: 4,
                            background: 'var(--bg-sunken)',
                            color: 'var(--accent)',
                          }}
                        >
                          {office.acronym}
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '.78rem',
                        fontWeight: 650,
                        lineHeight: 1.3,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {office.name}
                    </h4>

                    {office.nameNe && office.nameNe !== office.name ? (
                      <p
                        style={{
                          margin: '.1rem 0 0',
                          fontSize: '.66rem',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {office.nameNe}
                      </p>
                    ) : (
                      <p
                        style={{
                          margin: '.1rem 0 0',
                          fontSize: '.65rem',
                          color: 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.25rem',
                        }}
                      >
                        <MapPin size={10} /> {office.address.split(',')[0]}
                      </p>
                    )}
                  </div>

                  <ChevronRight size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        ) : (
          <p className="gov-agency-state">
            {query || selectedCategory !== 'all'
              ? 'No offices match your search.'
              : 'No mapped offices for this area yet.'}
          </p>
        )}
      </section>

      {/* Side Panel / Modal for Details */}
      <AgencyDetailModal
        agency={activeAgency}
        onClose={() => setActiveAgency(null)}
      />
    </>
  )
}
