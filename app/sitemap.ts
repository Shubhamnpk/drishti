import type { MetadataRoute } from 'next'
import { companies, projects, slugify } from '@/lib/data'
import { DISTRICTS, LOCAL_UNITS, PROVINCES } from '@/lib/geo-constants'
import { fetchNepseSectorMap } from '@/lib/nepse'
import { SITE_URL } from '@/lib/site'

/** Live feeds move, so the sitemap is refreshed a few times a day. */
export const revalidate = 21600

type Entry = MetadataRoute.Sitemap[number]

function entry(path: string, priority: number, changeFrequency: Entry['changeFrequency'], lastModified?: Date): Entry {
  return {
    url: `${SITE_URL}${path}`,
    priority,
    changeFrequency,
    ...(lastModified ? { lastModified } : {}),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const core = [
    '/', '/companies', '/projects', '/economy', '/market', '/market/brokers', '/market/floor-sheet', '/places', '/map',
    '/procurement', '/datasets', '/sources', '/environment', '/disasters', '/calendar', '/releases', '/about', '/news',
  ].map((path) => entry(path, path === '/' ? 1 : 0.8, 'daily', now))

  // Include every local unit so search crawlers can discover the complete places directory.
  const places = [
    ...PROVINCES.map(({ slug }) => entry(`/provinces/${slug}`, 0.7, 'weekly')),
    ...DISTRICTS.map(({ slug }) => entry(`/districts/${slug}`, 0.6, 'weekly')),
    ...LOCAL_UNITS.flatMap((unit) => {
      const district = DISTRICTS.find((item) => item.name === unit.district)
      return district ? [entry(`/districts/${district.slug}/${unit.slug}`, 0.5, 'monthly')] : []
    }),
  ]

  const entities = [
    ...companies.map(({ name }) => entry(`/companies/${slugify(name)}`, 0.6, 'monthly')),
    ...projects.map(({ name }) => entry(`/projects/${slugify(name)}`, 0.6, 'monthly')),
  ]

  // Live families are fetched defensively: one dead upstream must never break
  // the whole sitemap, it just drops that family for this build.
  //
  // Deliberately NOT listed: individual NEPSE symbols, procurement agencies and
  // DHM weather stations. That is ~500 extra URLs whose pages churn daily, are They stay reachable from
  // /market, /procurement and /environment for people, but carry noindex so
  // crawlers leave them alone.
  const [sectors] = await Promise.allSettled([fetchNepseSectorMap()])

  const market: Entry[] = []
  if (sectors.status === 'fulfilled') {
    for (const sector of new Set(Object.values(sectors.value))) {
      market.push(entry(`/market/sector/${encodeURIComponent(sector)}`, 0.5, 'daily', now))
    }
  }

  return [...core, ...places, ...entities, ...market]
}
