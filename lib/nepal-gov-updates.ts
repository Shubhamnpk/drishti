export const NEPAL_GOV_UPDATES_API = 'https://nepal.gov.np/api'
export const NEPAL_GOV_UPDATES_SITE = 'https://nepal.gov.np'
export const GOVERNMENT_UPDATES_REVALIDATE_SECONDS = 300

export type NepalGovAttachment = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

export type NepalGovUpdate = {
  id: string
  title: string
  content: string
  status: string
  authorId: string
  author?: {
    name?: string | null
    department?: string | null
    departmentUnit?: { name?: string | null } | null
  } | null
  thumbnailFilename?: string | null
  thumbnailMimeType?: string | null
  thumbnailSize?: number | null
  createdAt: string
  updatedAt: string
  likes: unknown[]
  dislikes: unknown[]
  comments: unknown[]
  tags: unknown[]
  attachments: NepalGovAttachment[]
}

export type NepalGovUpdatesResponse = {
  items: NepalGovUpdate[]
  nextCursor: string | null
}

export type NepalGovSearchResult = {
  id: string
  title: string
  description: string
}

export type NepalGovSearchResponse = {
  updates: NepalGovSearchResult[]
  suggestions: unknown[]
  faqs: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isNepalGovUpdate(value: unknown): value is NepalGovUpdate {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.content === 'string'
    && typeof value.createdAt === 'string'
    && Array.isArray(value.attachments)
}

export function isNepalGovUpdatesResponse(value: unknown): value is NepalGovUpdatesResponse {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(isNepalGovUpdate)
    && (typeof value.nextCursor === 'string' || value.nextCursor === null)
}

export function isNepalGovSearchResponse(value: unknown): value is NepalGovSearchResponse {
  return isRecord(value)
    && Array.isArray(value.updates)
    && value.updates.every(item => isRecord(item)
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && typeof item.description === 'string')
}

export function nepalGovUpdatePageUrl(id: string): string {
  return `${NEPAL_GOV_UPDATES_SITE}/updates/${encodeURIComponent(id)}`
}

export function nepalGovThumbnailUrl(id: string): string {
  return `/api/government-updates/${encodeURIComponent(id)}/thumbnail`
}

export function nepalGovAttachmentUrl(updateId: string, attachmentId: string): string {
  return `${NEPAL_GOV_UPDATES_API}/updates/${encodeURIComponent(updateId)}/attachments/${encodeURIComponent(attachmentId)}`
}

export function nepalGovAttachmentImageUrl(updateId: string, attachmentId: string): string {
  return `/api/government-updates/${encodeURIComponent(updateId)}/attachments/${encodeURIComponent(attachmentId)}/image`
}

export function googleTranslateUrl(text: string): string {
  const excerpt = text.trim().slice(0, 6500)
  return `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(excerpt)}&op=translate`
}

export function formatNepalGovDate(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-NP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kathmandu',
  }).format(date)
}

export function isNepaliText(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

export async function fetchNepalGovUpdates(params: { cursor?: string; department?: string } = {}): Promise<NepalGovUpdatesResponse> {
  const url = new URL(`${NEPAL_GOV_UPDATES_API}/updates`)
  if (params.cursor) url.searchParams.set('cursor', params.cursor)
  if (params.department) url.searchParams.set('department', params.department)

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: GOVERNMENT_UPDATES_REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`Nepal Government updates returned ${response.status}`)

  const payload: unknown = await response.json()
  if (!isNepalGovUpdatesResponse(payload)) throw new Error('Nepal Government updates response shape changed')
  return payload
}

export async function fetchNepalGovUpdate(id: string): Promise<NepalGovUpdate | null> {
  const response = await fetch(`${NEPAL_GOV_UPDATES_API}/updates/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: GOVERNMENT_UPDATES_REVALIDATE_SECONDS },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Nepal Government update returned ${response.status}`)

  const payload: unknown = await response.json()
  if (!isNepalGovUpdate(payload)) throw new Error('Nepal Government update response shape changed')
  return payload
}

export async function searchNepalGovUpdates(query: string): Promise<NepalGovSearchResponse> {
  const url = new URL(`${NEPAL_GOV_UPDATES_API}/search`)
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: GOVERNMENT_UPDATES_REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`Nepal Government search returned ${response.status}`)

  const payload: unknown = await response.json()
  if (!isNepalGovSearchResponse(payload)) throw new Error('Nepal Government search response shape changed')
  return payload
}
