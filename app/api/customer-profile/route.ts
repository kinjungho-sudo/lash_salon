import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createClient as createServiceSupabaseClient } from '@supabase/supabase-js'

const getServiceSupabase = () =>
  createServiceSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

// POST /api/customer-profile — 회원가입 시 고객 정보 저장
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, phone } = body

  const serviceSupabase = getServiceSupabase()

  // owner_profiles에서 admin id 조회 (listUsers보다 안정적)
  const { data: ownerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (!ownerProfile) return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 500 })

  const { data: existing } = await serviceSupabase
    .from('lash_salon_customers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await serviceSupabase
      .from('lash_salon_customers')
      .update({ name: name || user.email?.split('@')[0] || '고객', phone: phone || null })
      .eq('id', existing.id)
  } else {
    await serviceSupabase.from('lash_salon_customers').insert({
      owner_id: ownerProfile.id,
      user_id: user.id,
      name: name || user.email?.split('@')[0] || '고객',
      phone: phone || null,
    })
  }

  return NextResponse.json({ ok: true })
}

// PATCH /api/customer-profile — 로그인한 고객이 자신의 정보 수정
export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, phone } = body

  const { error } = await serviceSupabase
    .from('lash_salon_customers')
    .update({ name, phone: phone || null })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
