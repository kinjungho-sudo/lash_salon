import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/map/customers?period=1|3|all&showNoShow=true|false
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? '3'
  const showNoShow = searchParams.get('showNoShow') !== 'false'

  // 기간 필터 계산
  let startAt: string | null = null
  if (period === '1') {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    startAt = d.toISOString()
  } else if (period === '3') {
    const d = new Date(); d.setMonth(d.getMonth() - 3)
    startAt = d.toISOString()
  }

  // 고객 목록 (좌표 있는 것만)
  const { data: customers, error: custErr } = await supabase
    .from('lash_salon_customers')
    .select('id, name, district, district_lat, district_lng')
    .eq('owner_id', user.id)
    .not('district_lat', 'is', null)
    .not('district_lng', 'is', null)

  if (custErr || !customers || customers.length === 0) {
    return NextResponse.json([])
  }

  const customerIds = customers.map(c => c.id)

  // 예약 조회 (기간 + 노쇼 필터)
  let query = supabase
    .from('lash_salon_bookings')
    .select('customer_id, status, menu_id, lash_salon_menus(name)')
    .eq('owner_id', user.id)
    .in('customer_id', customerIds)

  if (startAt) query = query.gte('start_at', startAt)
  if (!showNoShow) query = query.neq('status', 'no_show')

  const { data: bookings } = await query

  // 고객별 방문 수 + 노쇼 + 인기 메뉴 집계
  const bookingMap: Record<string, { count: number; hasNoShow: boolean; menus: Record<string, number> }> = {}
  bookings?.forEach(b => {
    if (!bookingMap[b.customer_id]) {
      bookingMap[b.customer_id] = { count: 0, hasNoShow: false, menus: {} }
    }
    bookingMap[b.customer_id].count++
    if (b.status === 'no_show') bookingMap[b.customer_id].hasNoShow = true
    const menuName = (b.lash_salon_menus as unknown as { name: string } | null)?.name
    if (menuName) {
      bookingMap[b.customer_id].menus[menuName] = (bookingMap[b.customer_id].menus[menuName] ?? 0) + 1
    }
  })

  // 기간 필터가 있을 때 예약이 없는 고객은 제외
  const result = customers
    .filter(c => {
      if (!startAt) return true
      return !!bookingMap[c.id]
    })
    .map(c => {
      const bk = bookingMap[c.id]
      let favoriteMenu: string | null = null
      if (bk?.menus) {
        const sorted = Object.entries(bk.menus).sort((a, b) => b[1] - a[1])
        favoriteMenu = sorted[0]?.[0] ?? null
      }
      return {
        id: c.id,
        name: c.name,
        district: c.district,
        lat: c.district_lat,
        lng: c.district_lng,
        visitCount: bk?.count ?? 0,
        favoriteMenu,
        hasNoShow: bk?.hasNoShow ?? false,
      }
    })

  return NextResponse.json(result)
}
