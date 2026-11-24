import type { Metadata } from 'next'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'

/** Shared 1200x630 social card, generated from the site photo. */
export const OG_IMAGE = {
  url: '/og/drishti.jpg',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}: ${SITE_TAGLINE}`,
}

type PageMetadataInput = {
  title: string
  description: string
  /** Canonical path for this page, always starting with a slash. */
  path: string
  noindex?: boolean
}

/** Absolute URL for a site path. Used by metadata and structured data. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Collapse whitespace and cut on a word boundary so a description never ends
 * mid-word. The old `.slice(0, 140)` calls could split the Nepali "रु" glyph
 * and leave a stray "र" in the head.
 */
export function truncate(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${body.replace(/[\s,;:.\u2013\u2014/|]+$/, '')}\u2026`
}

/**
 * Build a complete metadata block for a page: title, description, canonical,
 * Open Graph and Twitter. Next.js inherits openGraph from the root layout
 * wholesale unless a segment sets it, which is why every page used to share the
 * homepage's social title. This helper sets all of it explicitly.
 */
export function pageMetadata({ title, description, path, noindex = false }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const summary = truncate(description)

  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      locale: 'en_NP',
      // The root layout's openGraph.title template appends " | Drishti", so
      // pass the plain title here and let Next apply the brand once.
      title,
      description: summary,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: summary,
      images: [OG_IMAGE.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
