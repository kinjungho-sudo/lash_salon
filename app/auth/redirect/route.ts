import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 로그인 후 서버사이드에서 admin/customer 분기 처리
export async function GET() {
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

  const { data: { user } } = await supabase.auth.getUser()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const dest = adminEmail && user.email === adminEmail ? '/admin' : '/customer'
  return NextResponse.redirect(`${siteUrl}${dest}`)
}
