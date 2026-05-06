import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { geocodeAddress } from '@/lib/kakao/local'

// PATCH /api/customers/onboarding — 온보딩 정보 저장 (이름 + 지역)
export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, region } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 })
  if (!region?.trim()) return NextResponse.json({ error: '지역을 입력해 주세요.' }, { status: 400 })

  // Kakao Geocoding
  const geo = await geocodeAddress(region.trim())

  const updatePayload: Record<string, unknown> = {
    name: name.trim(),
    district: geo?.district ?? region.trim(),
  }
  if (geo) {
    updatePayload.district_lat = geo.lat
    updatePayload.district_lng = geo.lng
  }

  const { error } = await serviceSupabase
    .from('lash_salon_customers')
    .update(updatePayload)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
