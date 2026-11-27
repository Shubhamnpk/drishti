import type { Metadata } from 'next'
import { DISTRICTS } from '@/lib/geo-constants'
import { DISTRICT_SEO } from '@/lib/place-seo'
import { fetchWikiSummary } from '@/lib/places'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const { district: slug } = await params
  const district = DISTRICTS.find((item) => item.slug === slug)
  if (!district) return { title: 'District not found', robots: { index: false, follow: true } }
  const wiki = await fetchWikiSummary(`${district.name} District`, district.name)
  return pageMetadata({
    title: `${district.name} District, ${district.province} Province`,
    description:
      DISTRICT_SEO[district.slug] ??
      `Census profile, local governments, area, weather, maps and nearby places for ${district.name} District in ${district.province} Province, Nepal.`,
    path: `/districts/${district.slug}`,
    image: wiki?.image ?? undefined,
    imageAlt: wiki?.title ? `${wiki.title} in Nepal` : undefined,
  })
}

export default function DistrictLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
