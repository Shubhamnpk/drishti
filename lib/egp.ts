const EGP_API = 'https://bolpatra.gov.np/api/v1'

export type EgpTender = {
  id: string
  office_code?: string
  title: string
  office_name: string
  reference: string
  category: string
  category_name: string
  method: string
  location: string
  status: string
  deadline: string | null
  opens_at: string | null
  publish_at: string | null
}

type TenderPage = {
  count: number
  page: number
  page_size: number
  next: number | null
  results: EgpTender[]
}

export type EgpEvent = {
  id: string
  type: string
  kind: string
  at: string
  title: string
  reference: string
  office_name: string
  href: string
}

export type EgpPriceItem = {
  id: string
  number: string
  section?: string
  description: string
  unit?: string
  quantity?: string
  cpv_code?: string
  cpv_label?: string
  fixed_rate?: string
  provisional?: boolean
}

export type EgpDocument = {
  id: string
  title: string
  kind: string
  size?: number
  sha256?: string
  generated?: boolean
  url?: string
}

export type EgpAmendment = {
  id?: string
  amendment_number?: number
  title?: string
  description?: string
  reason?: string
  created_at?: string
  publish_at?: string
}

export type EgpTenderDetail = EgpTender & {
  office_id?: string
  office_code?: string
  office_address?: string
  fiscal_year?: string
  project_type?: string
  contract_type_name?: string
  envelope_mode?: string
  description?: string
  prebid_at?: string | null
  opening_stage?: string
  submission_ready?: boolean
  cancellation_note?: string
  financial_opens_at?: string | null
  amendments?: EgpAmendment[]
  documents?: EgpDocument[]
  price_schedule?: {
    kind?: string
    currency?: string
    vat_percent?: string
    items?: EgpPriceItem[]
  } | null
}

export type EgpNotice = {
  id: string
  type: string
  kind: string
  at: string
  title: string
  reference: string
  office_name: string
  amendment_number: number | null
  href: string
}

export type EgpSummary = {
  total: number
  open: number
  goods_published: number
  works_published: number
  approved_public_entities: number
  approved_bidders: number
  events: EgpEvent[]
  notices: EgpNotice[]
}

export type EgpFeed = {
  total: number
  tenders: EgpTender[]
  summary: EgpSummary | null
  updatedAt: string
  complete: boolean
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${EGP_API}${path}`, {
      headers: { Accept: 'application/json' },
      // The portal sends no-store. Cache a short snapshot on our side to avoid
      // fetching the same public listing for every page request.
      next: { revalidate: 1800 },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function fetchEgpTender(id: string): Promise<EgpTenderDetail | null> {
  return getJson<EgpTenderDetail>(`/tenders/${encodeURIComponent(id)}`)
}

/** Fetch the complete paginated live e-GP notice register and its summary. */
export async function fetchEgpFeed(): Promise<EgpFeed> {
  const [firstPage, summary] = await Promise.all([
    getJson<TenderPage>('/tenders?ordering=newest&page=1&status=ALL&page_size=100'),
    getJson<EgpSummary>('/tenders/summary'),
  ])

  if (!firstPage) {
    return { total: 0, tenders: [], summary, updatedAt: new Date().toISOString(), complete: false }
  }

  const pages = [firstPage]
  const pageSize = firstPage.page_size || firstPage.results.length || 100
  const pageCount = Math.ceil(firstPage.count / pageSize)
  let complete = true
  for (let start = 2; start <= pageCount; start += 5) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(5, pageCount - start + 1) }, (_, index) =>
        getJson<TenderPage>(`/tenders?ordering=newest&page=${start + index}&status=ALL&page_size=${pageSize}`),
      ),
    )
    if (batch.some(page => page === null)) complete = false
    pages.push(...batch.filter((page): page is TenderPage => page !== null))
  }

  const tenders = pages.flatMap(page => page.results)
  if (tenders.length < firstPage.count) complete = false
  return {
    total: firstPage.count,
    tenders,
    summary,
    updatedAt: new Date().toISOString(),
    complete,
  }
}

export function egpProjectUrl(id: string) {
  return `https://bolpatra.gov.np/projects/${encodeURIComponent(id)}`
}

/** Stable, collision-resistant local profile path for an e-GP procuring office. */
export function egpAgencySlug(name: string, officeCode?: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return officeCode ? `${base}-${officeCode.toLowerCase()}` : base
}

export function egpEventUrl(path: string) {
  return `https://bolpatra.gov.np${path.startsWith('/') ? path : `/${path}`}`
}
