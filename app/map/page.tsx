import type { Metadata } from 'next'
import { NationalMapLoader } from '@/components/national-map-loader'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal national map: infrastructure, hydropower and hazards',
  description: 'Full-screen interactive map of Nepal: public infrastructure projects, hydropower plants, earthquakes, weather stations, river flood levels and disaster incidents. Drill from province to district and palika.',
  path: '/map',
})

export default function MapPage() {
  return (
    <main className="atlas-page">
      <NationalMapLoader />
    </main>
  )
}
