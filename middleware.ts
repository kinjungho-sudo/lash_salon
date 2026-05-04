import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/auth', '/privacy', '/api/auth']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // 비로그인 → 공개 경로 통과, 나머지는 /login 리다이렉트
  if (!user) {
    if (isPublicPath) return supabaseResponse
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // 로그인 상태 + 공개 경로 → 대시보드로
  if (isPublicPath && pathname !== '/privacy') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/'
    return NextResponse.redirect(dashboardUrl)
  }

  // 공유 Supabase 인스턴스 보안: lash_salon_owner_profiles 존재 확인
  const { data: ownerProfile } = await supabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!ownerProfile) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('error', 'not_authorized')
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
