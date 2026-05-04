import { createServerClient } from '@supabase/ssr'
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

  // owner_profiles 생성 (모든 신규 사용자 — admin 포함)
  const { data: existing } = await supabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existing) {
    await supabase.from('lash_salon_owner_profiles').insert({
      id: user.id,
      consent_terms_at: new Date().toISOString(),
      consent_marketing: false,
    })
  }

  // 로그인 후 이동 경로 결정
  const dest = user.email === adminEmail ? '/admin' : '/customer'
  return NextResponse.redirect(`${origin}${dest}`)
}
