import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/menus — 활성 메뉴 목록 (고객용, 인증 불필요)
export async function GET() {
  const serviceSupabase = createServiceClient()

  // lash_salon_owner_profiles에서 owner ID 조회
  const { data: profile, error: profileError } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: '관리자 설정이 필요합니다.' }, { status: 500 })
  }

  const MENU_ORDER = ['클래식', '볼륨', '하이브리드']

  const { data: rawMenus, error } = await serviceSupabase
    .from('lash_salon_menus')
    .select('*')
    .eq('owner_id', profile.id)
    .eq('is_active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const menus = (rawMenus ?? []).sort((a, b) => {
    const ai = MENU_ORDER.indexOf(a.name)
    const bi = MENU_ORDER.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name, 'ko')
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return NextResponse.json(menus)
}
