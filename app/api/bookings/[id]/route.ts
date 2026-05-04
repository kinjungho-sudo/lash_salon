import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { deleteEvent } from '@/lib/google/calendar'

// PATCH /api/bookings/[id] — 상태 변경 (cancelled, no_show)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status } = body

  if (!['confirmed', 'cancelled', 'no_show'].includes(status)) {
    return NextResponse.json({ error: '올바르지 않은 상태입니다.' }, { status: 400 })
  }

  // 본인 예약인지 확인
  const { data: existing } = await supabase
    .from('lash_salon_bookings')
    .select('id, google_event_id, owner_id')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })

  // 취소 시 GCal 이벤트 삭제
  if (status === 'cancelled' && existing.google_event_id) {
    const { data: profile } = await supabase
      .from('lash_salon_owner_profiles')
      .select('gcal_access_token, gcal_refresh_token, gcal_token_expires_at, google_calendar_id')
      .eq('id', user.id)
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

  const { data: existing } = await supabase
    .from('lash_salon_bookings')
    .select('id, google_event_id')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })

  if (existing.google_event_id) {
    const { data: profile } = await supabase
      .from('lash_salon_owner_profiles')
      .select('gcal_access_token, gcal_refresh_token, gcal_token_expires_at, google_calendar_id')
      .eq('id', user.id)
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
      } catch { /* GCal 삭제 실패 무시 */ }
    }
  }

  await serviceSupabase.from('lash_salon_bookings').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
