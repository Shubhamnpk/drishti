/**
 * Canonical origin for the whole site. Every canonical tag, sitemap entry and
 * social URL is built from this, so it must be the domain visitors actually
 * land on. Override with NEXT_PUBLIC_SITE_URL for previews and staging builds.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drishti.bitnepal.net').replace(/\/+$/, '')

export const SITE_NAME = 'Drishti'

export const SITE_TAGLINE = 'Nepal public data and accountability'
