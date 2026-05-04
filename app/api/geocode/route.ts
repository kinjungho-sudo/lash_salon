import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/kakao/local'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { address } = await request.json()
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })

  const result = await geocodeAddress(address)
  if (!result) return NextResponse.json({ error: 'geocode failed' }, { status: 422 })

  return NextResponse.json(result)
}
