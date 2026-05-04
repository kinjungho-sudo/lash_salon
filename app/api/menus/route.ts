import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/menus — 활성 메뉴 목록 (고객용, 인증 불필요)
export async function GET() {
  const serviceSupabase = createServiceClient()

  // 관리자 프로필 ID 조회 (service role로 RLS 우회)
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return NextResponse.json({ error: '관리자 설정이 필요합니다.' }, { status: 500 })
  }

  const { data: authUser } = await serviceSupabase.auth.admin.listUsers()
  const adminUser = authUser?.users?.find(u => u.email === adminEmail)
  if (!adminUser) {
    return NextResponse.json([], { status: 200 })
  }

  const { data: menus, error } = await serviceSupabase
    .from('lash_salon_menus')
    .select('*')
    .eq('owner_id', adminUser.id)
    .eq('is_active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(menus ?? [])
}
