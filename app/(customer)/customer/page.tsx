import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CustomerHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayStr = kstToday.toISOString().split('T')[0]

  // 이 고객의 예약 (본인 이름으로 등록된 것)
  const { data: customerRecord } = await supabase
    .from('lash_salon_customers')
    .select('id, name')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  let upcomingBookings = null
  if (customerRecord) {
    const { data } = await supabase
      .from('lash_salon_bookings')
      .select('*, menu:lash_salon_menus(name, color_tag)')
      .eq('customer_id', customerRecord.id)
      .gte('start_at', `${todayStr}T00:00:00+09:00`)
      .eq('status', 'confirmed')
      .order('start_at')
      .limit(3)
    upcomingBookings = data
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '고객'

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm tracking-wider uppercase mb-1" style={{ color: 'rgba(28,28,28,0.4)' }}>Welcome</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>
          안녕하세요, {firstName}님
        </h1>
      </div>

      {/* 예약 상태 */}
      {upcomingBookings && upcomingBookings.length > 0 ? (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.4)' }}>다가오는 예약</p>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(upcomingBookings as any[]).map(b => (
              <div key={b.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)', boxShadow: '0 2px 12px rgba(28,28,28,0.04)' }}>
                <div className="w-1 self-stretch rounded-full" style={{ background: b.menu?.color_tag ?? '#2D4A3E', minHeight: '40px' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{b.menu?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(28,28,28,0.5)' }}>
                    {new Date(b.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} · {new Date(b.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl p-6 text-center" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.06)' }}>
          <p className="text-sm mb-3" style={{ color: 'rgba(28,28,28,0.45)' }}>예약된 시술이 없습니다.</p>
          <Link href="/customer/booking" className="inline-flex items-center h-9 px-6 rounded-xl text-sm font-semibold btn-cream">
            예약하기
          </Link>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/customer/booking', label: '예약 신청', desc: '원하는 날짜와 메뉴 선택' },
          { href: '/customer/menus', label: '시술 메뉴', desc: '클래식 · 볼륨 · 하이브리드' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="rounded-2xl p-5 transition-all hover:shadow-md"
            style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.07)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#1C1C1C' }}>{item.label}</p>
            <p className="text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
