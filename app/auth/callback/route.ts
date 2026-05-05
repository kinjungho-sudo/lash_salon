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
  const adminEmail = process.env.ADMIN_EMAIL

  // Service client for privileged operations
  const serviceSupabase = createServiceSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  if (user.email === adminEmail) {
    // admin만 owner_profiles 생성
    const { data: existingProfile } = await supabase
      .from('lash_salon_owner_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      await supabase.from('lash_salon_owner_profiles').insert({
        id: user.id,
        consent_terms_at: new Date().toISOString(),
        consent_marketing: false,
      })
    }
  } else {
    // 일반 고객 — owner_profiles에서 admin의 id를 직접 조회
    const { data: ownerProfile } = await serviceSupabase
      .from('lash_salon_owner_profiles')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (ownerProfile) {
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
    }
  }

  const dest = user.email === adminEmail ? '/admin' : '/customer'
  return NextResponse.redirect(`${origin}${dest}`)
}
