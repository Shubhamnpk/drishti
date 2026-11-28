import { NextResponse } from 'next/server'
import { DISTRICTS, LOCAL_UNITS, PROVINCES } from '@/lib/geo-constants'
import { cdnCache } from '@/lib/cache'
import {
  getAgenciesByPlace,
  getAllCompiledAgencies,
  searchGovernmentAgencies,
  type GovernmentAgency,
  type AgencyCategory,
  type AgencyLevel,
} from '@/lib/government-agencies'

type OSMElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

const OVERPASS = 'https://overpass-api.de/api/interpreter'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const scope = (url.searchParams.get('scope') ?? 'all') as 'province' | 'district' | 'palika' | 'federal' | 'all'
  const name = url.searchParams.get('name')?.trim() ?? ''
  const districtParam = url.searchParams.get('district')?.trim() ?? ''
  const categoryParam = url.searchParams.get('category')?.trim() as AgencyCategory | undefined
  const levelParam = url.searchParams.get('level')?.trim() as AgencyLevel | undefined
  const queryParam = url.searchParams.get('q')?.trim() ?? ''
  const limitParam = parseInt(url.searchParams.get('limit') ?? '60', 10)

  // 1. If global search/filter without place scope
  if (scope === 'all' || (!name && queryParam)) {
    if (queryParam) {
      const results = searchGovernmentAgencies(queryParam, limitParam)
      return NextResponse.json(
        { offices: results, total: results.length, source: 'Drishti Government Directory' },
        { headers: cdnCache(3600) }
      )
    }

    const { agencies, total } = getAllCompiledAgencies({
      category: categoryParam,
      level: levelParam,
      limit: limitParam,
    })
    return NextResponse.json(
      { offices: agencies, total, source: 'Drishti Government Directory' },
      { headers: cdnCache(3600) }
    )
  }

  // 2. Place-scoped queries (province, district, palika)
  const compiledAgencies = getAgenciesByPlace(scope, name, districtParam)

  // Filter compiled by category or search query if requested
  let filtered = compiledAgencies
  if (categoryParam) {
    filtered = filtered.filter(a => a.category === categoryParam)
  }
  if (queryParam) {
    const q = queryParam.toLowerCase()
    filtered = filtered.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.nameNe.toLowerCase().includes(q) ||
        (a.acronym && a.acronym.toLowerCase().includes(q)) ||
        a.services.some(s => s.toLowerCase().includes(q))
    )
  }

  // 3. Attempt supplementary OpenStreetMap records if scope is province, district, or palika
  let osmOffices: GovernmentAgency[] = []
  try {
    let adminLevel = '5'
    let queryPlaceName = name

    if (scope === 'province') {
      const prov = PROVINCES.find(p => p.name.toLowerCase() === name.toLowerCase())
      if (prov) {
        adminLevel = '4'
        queryPlaceName = prov.name
      }
    } else if (scope === 'district') {
      const dist = DISTRICTS.find(d => d.name.toLowerCase() === name.toLowerCase())
      if (dist) {
        adminLevel = '5'
        queryPlaceName = dist.name
      }
    } else if (scope === 'palika') {
      adminLevel = '7'
      const unit = LOCAL_UNITS.find(u => u.name.toLowerCase() === name.toLowerCase())
      if (unit) {
        queryPlaceName = unit.name
      }
    }

    const query = `[out:json][timeout:5];area["ISO3166-1"="NP"]["admin_level"="2"]->.nepal;area(area.nepal)["boundary"="administrative"]["admin_level"="${adminLevel}"]["name"="${queryPlaceName}"]->.place;(nwr(area.place)["office"~"^(government|administrative)$",i];nwr(area.place)["government"];nwr(area.place)["amenity"~"^(townhall|police|courthouse|fire_station)$"];);out center tags 40;`

    const response = await fetch(`${OVERPASS}?data=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Drishti-Nepal-Accountability-Dashboard/1.0' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000), // 4 seconds max to never freeze the page
    })

    if (response.ok) {
      const payload = (await response.json()) as { elements?: OSMElement[] }
      osmOffices = (payload.elements ?? []).flatMap(element => {
        const tags = element.tags ?? {}
        const officeName = tags['name:en'] || tags.name || tags.official_name || tags.short_name
        const officeNameNe = tags['name:ne'] || tags['official_name:ne'] || ''
        const lat = element.lat ?? element.center?.lat
        const lon = element.lon ?? element.center?.lon
        if (!officeName || lat == null || lon == null) return []

        const tagCat = (tags.office || tags.government || tags.amenity || '').toLowerCase()
        let category: AgencyCategory = 'administration'
        if (tagCat.includes('police') || tagCat.includes('fire')) category = 'security'
        else if (tagCat.includes('court')) category = 'judiciary'
        else if (tagCat.includes('tax') || tagCat.includes('revenue')) category = 'revenue'
        else if (tagCat.includes('townhall') || tagCat.includes('ward')) category = 'local_government'

        return [
          {
            id: `osm-${element.type}-${element.id}`,
            name: officeName,
            nameNe: officeNameNe || officeName,
            category,
            categoryLabel: category.replaceAll('_', ' '),
            level: scope === 'province' ? 'provincial' : scope === 'district' ? 'district' : 'palika',
            address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:place'], tags['addr:city']]
              .filter(Boolean)
              .join(', ') || `${queryPlaceName}, Nepal`,
            phone: tags['contact:phone'] || tags.phone || '',
            website: tags['contact:website'] || tags.website || '',
            mapUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
            services: ['Public Local Services'],
            description: `Mapped public office located in ${queryPlaceName}.`,
            lat,
            lon,
          },
        ]
      })
    }
  } catch {
    // Overpass failed or timed out; gracefully proceed with compiled statutory agencies
  }

  // Merge and deduplicate by office name
  const existingNames = new Set(filtered.map(a => a.name.toLowerCase().trim()))
  const combined = [...filtered]

  for (const osm of osmOffices) {
    const normOsm = osm.name.toLowerCase().trim()
    const isDuplicate = Array.from(existingNames).some(
      n => n.includes(normOsm) || normOsm.includes(n)
    )
    if (!isDuplicate) {
      existingNames.add(normOsm)
      combined.push(osm)
    }
  }

  return NextResponse.json(
    {
      offices: combined,
      total: combined.length,
      source: 'Government of Nepal Statutory Directory & OpenStreetMap',
    },
    { headers: cdnCache(86400) }
  )
}
