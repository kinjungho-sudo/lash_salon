import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Google OAuth로 첫 로그인 시 owner_profiles 자동 생성
  const { data: existing } = await supabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!existing) {
    await supabase.from('lash_salon_owner_profiles').insert({
      id: data.user.id,
      consent_terms_at: new Date().toISOString(),
      consent_marketing: false,
    })
  }

  return NextResponse.redirect(`${origin}${next}`)
}
