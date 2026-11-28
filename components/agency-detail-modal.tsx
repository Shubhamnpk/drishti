'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react'
import type { AgencyCategory, GovernmentAgency } from '@/lib/government-agencies'
import { findDistrict, findProvinceByName } from '@/lib/places'

type AgencyDetailModalProps = {
  agency: GovernmentAgency | null
  onClose: () => void
}

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ministry: <Landmark size={20} />,
  constitutional: <Landmark size={20} />,
  administration: <Building2 size={20} />,
  security: <ShieldCheck size={20} />,
  judiciary: <Scale size={20} />,
  revenue: <Building2 size={20} />,
  health: <Stethoscope size={20} />,
  infrastructure: <Building2 size={20} />,
  local_government: <Building2 size={20} />,
  utility: <Building2 size={20} />,
}

export function getCategoryAccent(category: AgencyCategory | string) {
  switch (category) {
    case 'ministry':
      return { bg: 'color-mix(in srgb, #0ea5e9 14%, transparent)', color: '#0284c7', border: '#38bdf8' }
    case 'constitutional':
      return { bg: 'color-mix(in srgb, #8b5cf6 14%, transparent)', color: '#7c3aed', border: '#a78bfa' }
    case 'security':
      return { bg: 'color-mix(in srgb, #3b82f6 14%, transparent)', color: '#2563eb', border: '#60a5fa' }
    case 'judiciary':
      return { bg: 'color-mix(in srgb, #6366f1 14%, transparent)', color: '#4f46e5', border: '#818cf8' }
    case 'revenue':
      return { bg: 'color-mix(in srgb, #10b981 14%, transparent)', color: '#059669', border: '#34d399' }
    case 'health':
      return { bg: 'color-mix(in srgb, #f43f5e 14%, transparent)', color: '#e11d48', border: '#fb7185' }
    case 'local_government':
      return { bg: 'color-mix(in srgb, #f59e0b 14%, transparent)', color: '#d97706', border: '#fbbf24' }
    case 'infrastructure':
      return { bg: 'color-mix(in srgb, #14b8a6 14%, transparent)', color: '#0d9488', border: '#2dd4bf' }
    default:
      return { bg: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)', border: 'var(--accent)' }
  }
}

export function AgencyDetailModal({ agency, onClose }: AgencyDetailModalProps) {
  useEffect(() => {
    if (!agency) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [agency, onClose])

  if (!agency) return null

  const accent = getCategoryAccent(agency.category)
  const provSlug = agency.province ? findProvinceByName(agency.province)?.slug : undefined
  const distSlug = agency.district ? findDistrict(agency.district)?.slug : undefined
  const palikaSlug = agency.palika ? agency.palika.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined

  return (
    <div
      className="drawer-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agency-drawer-title"
    >
      <aside
        className="detail-drawer"
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(500px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          padding: '1.75rem 1.5rem',
        }}
      >
        {/* Close Button */}
        <button
          className="drawer-close"
          onClick={onClose}
          aria-label="Close details"
          type="button"
        >
          <X size={16} />
        </button>

        {/* Header with Cute Anchor Icon */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: accent.bg,
              color: accent.color,
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {CATEGORY_ICONS[agency.category] ?? <Building2 size={24} />}
          </div>

          <div style={{ minWidth: 0, flex: 1, paddingRight: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.3rem' }}>
              <span
                style={{
                  fontSize: '.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '.15rem .5rem',
                  borderRadius: 999,
                  background: accent.bg,
                  color: accent.color,
                  letterSpacing: '.04em',
                }}
              >
                {agency.level}
              </span>
              <span
                style={{
                  fontSize: '.62rem',
                  fontWeight: 650,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                }}
              >
                {agency.categoryLabel}
              </span>
              {agency.acronym && (
                <span
                  style={{
                    fontSize: '.62rem',
                    fontWeight: 800,
                    padding: '.12rem .4rem',
                    borderRadius: 6,
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent)',
                  }}
                >
                  {agency.acronym}
                </span>
              )}
            </div>

            <h2
              id="agency-drawer-title"
              style={{
                fontSize: '1.2rem',
                lineHeight: 1.25,
                fontWeight: 700,
                letterSpacing: '-.02em',
                margin: 0,
                color: 'var(--text)',
              }}
            >
              {agency.name}
            </h2>
            {agency.nameNe && (
              <p style={{ margin: '.25rem 0 0', fontSize: '.84rem', color: 'var(--text-secondary)' }}>
                {agency.nameNe}
              </p>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
          {agency.phone && (
            <a
              href={`tel:${agency.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.45rem .85rem',
                borderRadius: 9,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                fontSize: '.72rem',
                fontWeight: 650,
                textDecoration: 'none',
              }}
            >
              <Phone size={13} /> Call {agency.phone}
            </a>
          )}
          {agency.website && (agency.website.startsWith('http://') || agency.website.startsWith('https://')) && (
            <a
              href={agency.website}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.45rem .85rem',
                borderRadius: 9,
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '.72rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Globe size={13} /> Official website <ExternalLink size={11} />
            </a>
          )}
          {agency.email && (
            <a
              href={`mailto:${agency.email}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.45rem .85rem',
                borderRadius: 9,
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '.72rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Mail size={13} /> Email
            </a>
          )}
          {agency.mapUrl && (
            <a
              href={agency.mapUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.45rem .85rem',
                borderRadius: 9,
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '.72rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <MapPin size={13} /> Map <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Citizen Services Provided */}
        {agency.services && agency.services.length > 0 && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h4
              style={{
                margin: '0 0 .6rem',
                fontSize: '.72rem',
                fontWeight: 700,
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '.35rem',
              }}
            >
              <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} /> Services for citizens
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.4rem' }}>
              {agency.services.map(svc => (
                <div
                  key={svc}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '.4rem',
                    fontSize: '.72rem',
                    color: 'var(--text)',
                    lineHeight: 1.35,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: accent.color,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <span>{svc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description / Role */}
        <div>
          <h4
            style={{
              margin: '0 0 .35rem',
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            About this agency
          </h4>
          <p style={{ margin: 0, fontSize: '.78rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {agency.description}
          </p>
        </div>

        {/* Location & Jurisdiction */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '.9rem' }}>
          <h4
            style={{
              margin: '0 0 .45rem',
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Location &amp; Jurisdiction
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: 'var(--text)' }}>
              <MapPin size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>{agency.address}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
              {distSlug && (
                <Link
                  href={`/districts/${distSlug}`}
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    fontSize: '.7rem',
                    color: 'var(--accent)',
                    fontWeight: 650,
                    textDecoration: 'none',
                  }}
                >
                  {agency.district} District Profile <ArrowRight size={11} />
                </Link>
              )}
              {provSlug && (
                <Link
                  href={`/provinces/${provSlug}`}
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    fontSize: '.7rem',
                    color: 'var(--accent)',
                    fontWeight: 650,
                    textDecoration: 'none',
                  }}
                >
                  {agency.province} Province Profile <ArrowRight size={11} />
                </Link>
              )}
              {agency.palika && distSlug && palikaSlug && (
                <Link
                  href={`/districts/${distSlug}/${palikaSlug}`}
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    fontSize: '.7rem',
                    color: 'var(--accent)',
                    fontWeight: 650,
                    textDecoration: 'none',
                  }}
                >
                  {agency.palika} Local Unit <ArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
