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

  // 살롱 owner 조회 (고객 레코드 생성 시 owner_id 필요)
  const { data: ownerProfile } = await serviceSupabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (ownerProfile) {
    // 기존 고객 여부 확인
    const { data: existingCustomer } = await serviceSupabase
      .from('lash_salon_customers')
      .select('id, name, district')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingCustomer) {
      // 신규 — 고객 레코드를 미완성 상태로 생성 후 온보딩으로 이동
      const googleName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
      await serviceSupabase.from('lash_salon_customers').insert({
        owner_id: ownerProfile.id,
        user_id: user.id,
        name: googleName,
        phone: null,
      })
      return NextResponse.redirect(`${origin}/customer/onboarding`)
    }

    // 기존 고객이지만 지역 정보 미입력 시 온보딩으로
    if (!existingCustomer.district) {
      return NextResponse.redirect(`${origin}/customer/onboarding`)
    }
  }

  // 기존 고객 — 바로 마이페이지로
  return NextResponse.redirect(`${origin}/customer`)
}
