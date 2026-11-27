import type { Metadata } from 'next'
import { PROVINCES } from '@/lib/geo-constants'
import { PROVINCE_SEO } from '@/lib/place-seo'
import { fetchWikiSummary } from '@/lib/places'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
  const { province: slug } = await params
  const province = PROVINCES.find((item) => item.slug === slug)
  if (!province) return { title: 'Province not found', robots: { index: false, follow: true } }
  const wiki = await fetchWikiSummary(`${province.name} Province`, province.name)
  return pageMetadata({
    title: `${province.name} Province profile and public data`,
    description:
      PROVINCE_SEO[province.slug] ??
      `District profiles, local units, population and census data, weather, maps and nearby places across ${province.name} Province, Nepal.`,
    path: `/provinces/${province.slug}`,
    image: wiki?.image ?? undefined,
    imageAlt: wiki?.title ? `${wiki.title} Province` : undefined,
  })
}

export default function ProvinceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
