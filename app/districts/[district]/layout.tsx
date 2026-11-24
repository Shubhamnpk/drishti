import type { Metadata } from 'next'
import { DISTRICTS } from '@/lib/geo-constants'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const { district: slug } = await params
  const district = DISTRICTS.find((item) => item.slug === slug)
  if (!district) return { title: 'District not found', robots: { index: false, follow: true } }
  return pageMetadata({
    title: `${district.name} District, ${district.province} Province`,
    description: `Explore ${district.name} District in ${district.province} Province, Nepal: census profile, local governments, area, weather, maps and nearby places.`,
    path: `/districts/${district.slug}`,
  })
}

export default function DistrictLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
