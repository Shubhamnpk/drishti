import { NextResponse } from 'next/server'
import { NEPAL_GOV_UPDATES_API } from '@/lib/nepal-gov-updates'

type Props = { params: Promise<{ id: string; attachmentId: string }> }

export async function GET(_request: Request, { params }: Props) {
  const { id, attachmentId } = await params
  if (!/^[\w-]{1,100}$/.test(id) || !/^[\w-]{1,100}$/.test(attachmentId)) {
    return NextResponse.json({ error: 'Invalid attachment.' }, { status: 400 })
  }
  try {
    const response = await fetch(`${NEPAL_GOV_UPDATES_API}/updates/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}`, {
      headers: { Accept: 'image/*' },
      next: { revalidate: 3600 },
    })
    if (!response.ok || !response.body) return new Response(null, { status: response.status === 404 ? 404 : 502 })
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) return new Response(null, { status: 415 })
    const length = Number(response.headers.get('content-length') || 0)
    if (length > 12 * 1024 * 1024) return new Response(null, { status: 413 })
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > 12 * 1024 * 1024) return new Response(null, { status: 413 })
    return new Response(bytes, { headers: {
      'Content-Type': contentType,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch {
    return new Response(null, { status: 502 })
  }
}
