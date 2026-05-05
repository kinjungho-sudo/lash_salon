import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isSlotAvailable, createEvent } from '@/lib/google/calendar'

// GET /api/bookings?year=2024&month=5
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const startOfMonth = new Date(year, month - 1, 1).toISOString()
  const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString()

  const { data, error } = await supabase
    .from('lash_salon_bookings')
    .select('*, customer:lash_salon_customers(id, name, phone), menu:lash_salon_menus(id, name, color_tag, duration_min)')
    .eq('owner_id', user.id)
    .gte('start_at', startOfMonth)
    .lte('start_at', endOfMonth)
    .order('start_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — 예약 생성 (이중 예약 차단 포함)
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { menu_id, start_at, end_at } = body

  if (!menu_id || !start_at || !end_at) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  // owner profile 조회 — lash_salon_owner_profiles 테이블에서 첫 번째 레코드를 owner로 사용
  const { data: ownerProfile, error: ownerError } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .single()
  if (ownerError || !ownerProfile) {
    return NextResponse.json({ error: '관리자 설정이 필요합니다.' }, { status: 500 })
  }

  const ownerId = ownerProfile.id

  // 고객 레코드 확인 또는 생성 (service role로 RLS 우회)
  let { data: customerRecord } = await serviceSupabase
    .from('lash_salon_customers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!customerRecord) {
    const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? '고객'
    const { data: newCustomer, error: customerError } = await serviceSupabase
      .from('lash_salon_customers')
      .insert({ owner_id: ownerId, name: userName, user_id: user.id })
      .select('id')
      .single()
    if (customerError) return NextResponse.json({ error: '고객 정보를 생성할 수 없습니다.' }, { status: 500 })
    customerRecord = newCustomer
  }

  const customer_id = customerRecord.id

  // 사장님 프로필 (GCal 토큰) 조회
  const { data: profile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('gcal_access_token, gcal_refresh_token, gcal_token_expires_at, google_calendar_id')
    .eq('id', ownerId)
    .single()

  // GCal 연동된 경우 freebusy 검증
  if (profile?.gcal_access_token && profile?.gcal_refresh_token && profile?.google_calendar_id) {
    const { available, newTokens } = await isSlotAvailable(
      profile.gcal_access_token,
      profile.gcal_refresh_token,
      profile.gcal_token_expires_at,
      profile.google_calendar_id,
      start_at,
      end_at
    )

    // 토큰 갱신된 경우 저장
    if (newTokens) {
      await serviceSupabase.from('lash_salon_owner_profiles').update({
        gcal_access_token: newTokens.access_token,
        gcal_token_expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
      }).eq('id', ownerId)
    }

    if (!available) {
      return NextResponse.json({ error: 'Google Calendar에 해당 시간대에 이미 일정이 있습니다.' }, { status: 409 })
    }
  }

  // DB INSERT — unique constraint (owner_id, start_at)으로 이중 예약 차단
  const { data: booking, error: insertError } = await serviceSupabase
    .from('lash_salon_bookings')
    .insert({
      owner_id: ownerId,
      customer_id,
      menu_id,
      start_at,
      end_at,
      status: 'confirmed',
    })
    .select('*, customer:lash_salon_customers(name), menu:lash_salon_menus(name)')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: '해당 시간에 이미 예약이 있습니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // GCal 이벤트 생성
  if (profile?.gcal_access_token && profile?.gcal_refresh_token && profile?.google_calendar_id) {
    try {
      const summary = `${booking.customer?.name} — ${booking.menu?.name}`
      const { eventId, newTokens } = await createEvent(
        profile.gcal_access_token,
        profile.gcal_refresh_token,
        profile.gcal_token_expires_at,
        profile.google_calendar_id,
        summary,
        start_at,
        end_at
      )

      if (eventId) {
        await serviceSupabase.from('lash_salon_bookings').update({ google_event_id: eventId }).eq('id', booking.id)
      }
      if (newTokens) {
        await serviceSupabase.from('lash_salon_owner_profiles').update({
          gcal_access_token: newTokens.access_token,
          gcal_token_expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
        }).eq('id', ownerId)
      }
    } catch {
      // GCal 실패는 예약 자체를 막지 않음 (이미 DB에 저장됨)
    }
  }

  return NextResponse.json(booking, { status: 201 })
}
