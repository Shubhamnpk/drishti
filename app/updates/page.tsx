import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { GovernmentUpdatesFeed } from '@/components/government-updates-feed'
import { fetchNepalGovUpdates } from '@/lib/nepal-gov-updates'

export const metadata: Metadata = {
  title: 'Gov News',
  description: 'Recent updates published on the Government of Nepal portal, with department filters, search and source attachments.',
  alternates: { canonical: '/updates' },
}

export default async function GovernmentUpdatesPage() {
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
          <h1>Gov News</h1>
          <p>News, public information and notices published on nepal.gov.np. Browse the source records, departments and attachments in one place.</p>
        </div>
        <a className="gov-source-link" href="https://nepal.gov.np/" target="_blank" rel="noreferrer">Visit nepal.gov.np <span aria-hidden="true">↗</span></a>
      </div>
      <GovernmentUpdatesFeed initial={initial} initiallyUnavailable={unavailable} />
    </main>
  )
}
