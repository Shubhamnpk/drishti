import type { Metadata } from 'next'
import { fetchDhmForecast } from '@/lib/dhm'
import { slugify } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 7200

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * The detail page is a client component, so its metadata lives here. These
 * pages are kept out of the index on purpose: the station list churns and each
 * render is expensive on the small VM. `/environment` is the indexed page.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const forecast = await fetchDhmForecast().catch(() => null)
  const station = (forecast?.stations ?? []).find((item) => slugify(item.name) === slug)

  if (!station) {
    return pageMetadata({
      title: `${titleCase(slug)} weather`,
      description: 'Live weather, air quality and hazard information for places across Nepal.',
      path: `/environment/${slug}`,
      noindex: true,
    })
  }

  return pageMetadata({
    title: `${station.name} weather, air quality and river levels`,
    description: `Live weather forecast for ${station.name}, Nepal: temperatures, rainfall, river levels, air quality and nearby earthquake and hazard alerts.`,
    path: `/environment/${slug}`,
    noindex: true,
  })
}

export default function EnvironmentStationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
