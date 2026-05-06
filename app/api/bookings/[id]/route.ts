import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { deleteEvent } from '@/lib/google/calendar'

// PATCH /api/bookings/[id] — 상태 변경 또는 예약 수정 (menu, time)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status, menu_id, start_at, end_at } = body

  // 관리자(owner)인지 확인
  const { data: ownerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  // 예약 조회: 관리자는 owner_id로, 고객은 customer → user_id로 연결하여 접근 허용
  const { data: existing } = await serviceSupabase
    .from('lash_salon_bookings')
    .select('id, google_event_id, owner_id, status')
    .eq('id', params.id)
    .single()

  if (!existing) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })

  // 관리자가 아니면 본인 예약만 접근 가능 (customer_id 검증)
  if (!ownerProfile) {
    const { data: customer } = await serviceSupabase
      .from('lash_salon_customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!customer) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })

    const { data: bookingCheck } = await serviceSupabase
      .from('lash_salon_bookings')
      .select('id')
      .eq('id', params.id)
      .eq('customer_id', customer.id)
      .maybeSingle()

    if (!bookingCheck) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
  }

  // 시간/메뉴 수정 요청
  if (start_at || end_at || menu_id) {
    const updatePayload: Record<string, unknown> = {}
    if (menu_id) updatePayload.menu_id = menu_id
    if (start_at) updatePayload.start_at = start_at
    if (end_at) updatePayload.end_at = end_at

    const { data, error } = await serviceSupabase
      .from('lash_salon_bookings')
      .update(updatePayload)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '해당 시간에 이미 예약이 있습니다.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  // 상태 변경 요청
  if (!status || !['confirmed', 'cancelled', 'no_show'].includes(status)) {
    return NextResponse.json({ error: '올바르지 않은 요청입니다.' }, { status: 400 })
  }

  // 취소 시 GCal 이벤트 삭제
  if (status === 'cancelled' && existing.google_event_id) {
    const { data: profile } = await serviceSupabase
      .from('lash_salon_owner_profiles')
      .select('gcal_access_token, gcal_refresh_token, gcal_token_expires_at, google_calendar_id')
      .eq('id', existing.owner_id)
      .single()

    if (profile?.gcal_access_token && profile?.gcal_refresh_token && profile?.google_calendar_id) {
      try {
        await deleteEvent(
          profile.gcal_access_token,
          profile.gcal_refresh_token,
          profile.gcal_token_expires_at,
          profile.google_calendar_id,
          existing.google_event_id
        )
      } catch {
        // GCal 삭제 실패해도 DB 상태는 업데이트
      }
    }
  }

  const { data, error } = await serviceSupabase
    .from('lash_salon_bookings')
    .update({ status })
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/bookings/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 관리자 확인
  const { data: ownerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!ownerProfile) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })

  const { data: booking } = await serviceSupabase
    .from('lash_salon_bookings')
    .select('id, google_event_id')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })

  if (booking.google_event_id) {
    const { data: profile } = await serviceSupabase
      .from('lash_salon_owner_profiles')
      .select('gcal_access_token, gcal_refresh_token, gcal_token_expires_at, google_calendar_id')
      .eq('id', ownerProfile.id)
      .single()

    if (profile?.gcal_access_token && profile?.gcal_refresh_token && profile?.google_calendar_id) {
      try {
        await deleteEvent(
          profile.gcal_access_token,
          profile.gcal_refresh_token,
          profile.gcal_token_expires_at,
          profile.google_calendar_id,
          booking.google_event_id
        )
      } catch { /* GCal 삭제 실패 무시 */ }
    }
  }

  await serviceSupabase.from('lash_salon_bookings').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
