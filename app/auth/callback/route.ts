import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const user = data.user

  // Service client for privileged operations
  const serviceSupabase = createServiceSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // owner_profiles에 이미 레코드가 있는지 확인 (사장님 계정 판별)
  const { data: existingOwnerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingOwnerProfile) {
    // 사장님 계정 — 관리자 페이지로
    return NextResponse.redirect(`${origin}/admin`)
  }

  // owner_profiles에 없는 경우: 첫 번째 owner(사장님)가 있는지 확인
  const { data: ownerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (!ownerProfile) {
    // owner_profiles가 비어있음 = 최초 로그인 사장님 → owner_profiles 생성
    await serviceSupabase.from('lash_salon_owner_profiles').insert({
      id: user.id,
      consent_terms_at: new Date().toISOString(),
      consent_marketing: false,
    })
    return NextResponse.redirect(`${origin}/admin`)
  }

  // 일반 고객 — customers 레코드 자동 생성
  const { data: existingCustomer } = await serviceSupabase
    .from('lash_salon_customers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existingCustomer) {
    const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? '고객'
    await serviceSupabase.from('lash_salon_customers').insert({
      owner_id: ownerProfile.id,
      user_id: user.id,
      name: userName,
      phone: user.user_metadata?.phone ?? null,
    })
  }

  return NextResponse.redirect(`${origin}/customer`)
}
