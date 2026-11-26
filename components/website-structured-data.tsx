import { SITE_NAME, SITE_URL } from '@/lib/site'

const websiteData = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: 'Drishti Nepal',
  description: 'Open public data and civic intelligence for Nepal.',
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

const organizationData = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icon-512.png`,
    caption: `${SITE_NAME} logo`,
  },
  description:
    'Drishti is an open public data and civic intelligence platform that brings Nepal government records, infrastructure, market and environment data into one place, with every figure traced back to its source.',
  sameAs: ['https://github.com/Shubhamnpk/drishti'],
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [websiteData, organizationData],
}

export function WebsiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
    />
  )
}
