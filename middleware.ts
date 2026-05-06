import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 완전 공개 경로 (로그인 불필요)
const PUBLIC_PATHS = ['/login', '/signup', '/auth', '/privacy', '/terms', '/trends/share', '/api/', '/']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)))

  // /admin/* — 관리자 전용 (owner_profiles에 레코드 있어야 접근 가능)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    // owner_profiles에 해당 user가 있는지 확인
    const { data: ownerProfile } = await supabase
      .from('lash_salon_owner_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!ownerProfile) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'not_authorized')
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // /customer/* — 로그인한 고객 전용
  if (pathname.startsWith('/customer')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 공개 경로 — 통과
  if (isPublicPath) {
    // 이미 로그인된 상태에서 /login, /signup 접근 → 고객 홈으로
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const url = request.nextUrl.clone()
      url.pathname = '/customer'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 그 외 경로 — 로그인 필요
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
