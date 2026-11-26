import { NextResponse } from 'next/server'
import { fetchNepalGovUpdate } from '@/lib/nepal-gov-updates'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  if (!/^[\w-]{1,100}$/.test(id)) return NextResponse.json({ error: 'Invalid update id.' }, { status: 400 })
  try {
    const update = await fetchNepalGovUpdate(id)
    return update ? NextResponse.json(update) : NextResponse.json({ error: 'Update not found.' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Government update is temporarily unavailable.' }, { status: 502 })
  }
}
