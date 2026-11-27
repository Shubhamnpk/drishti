import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { GovernmentUpdatesFeed } from '@/components/government-updates-feed'
import { fetchNepalGovUpdates } from '@/lib/nepal-gov-updates'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal Government News',
  description: 'Recent news, public information and notices published on the Government of Nepal portal, with search, department filters and source attachments.',
  path: '/news',
})

export default async function NewsPage() {
  let initial = { items: [], nextCursor: null } as Awaited<ReturnType<typeof fetchNepalGovUpdates>>
  let unavailable = false
  try {
    initial = await fetchNepalGovUpdates()
  } catch {
    unavailable = true
  }

  return (
    <main id="main-content" className="content-wrap gov-updates-page">
      <div className="gov-updates-hero">
        <div>
          <div className="eyebrow"><Newspaper size={14} /> GOVERNMENT OF NEPAL PORTAL</div>
          <h1>GOV News</h1>
          <p>Official news, public information and notices from Nepal’s government portal, gathered in one searchable feed.</p>
        </div>
        <a className="gov-source-link" href="https://nepal.gov.np/" target="_blank" rel="noreferrer">Visit nepal.gov.np <span aria-hidden="true">↗</span></a>
      </div>
      <GovernmentUpdatesFeed initial={initial} initiallyUnavailable={unavailable} />
    </main>
  )
}
