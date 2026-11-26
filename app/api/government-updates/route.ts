import { NextRequest, NextResponse } from 'next/server'
import {
  fetchNepalGovUpdates,
  searchNepalGovUpdates,
} from '@/lib/nepal-gov-updates'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  try {
    if (query) {
      if (query.length > 160) return NextResponse.json({ error: 'Search is too long.' }, { status: 400 })
      return NextResponse.json(await searchNepalGovUpdates(query))
    }

    const cursor = request.nextUrl.searchParams.get('cursor')
    const department = request.nextUrl.searchParams.get('department')?.trim()
    if (cursor && !/^[\w-]{8,100}$/.test(cursor)) {
      return NextResponse.json({ error: 'Invalid page cursor.' }, { status: 400 })
    }
    if (department && department.length > 120) {
      return NextResponse.json({ error: 'Department name is too long.' }, { status: 400 })
    }
    return NextResponse.json(await fetchNepalGovUpdates({ cursor: cursor || undefined, department: department || undefined }))
  } catch {
    return NextResponse.json({ error: 'Government updates are temporarily unavailable.' }, { status: 502 })
  }
}
