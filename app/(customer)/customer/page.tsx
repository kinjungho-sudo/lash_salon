import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function pad(n: number) { return String(n).padStart(2, '0') }

export default async function CustomerHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayStr = kstToday.toISOString().split('T')[0]

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

  const displayName = customerRecord?.name
    ?? user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.user_metadata?.name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? '고객'

  return (
    <div>
      {/* 인사 헤더 */}
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: '#2D4A3E' }}>
          MUTE EYELASH SALON
        </p>
        <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>
          안녕하세요,<br />{displayName}님
        </h1>
      </div>

      {/* 예약 상태 */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.4)' }}>
          다가오는 예약
        </p>
        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(upcomingBookings as any[]).map(b => {
              const startDt = new Date(b.start_at)
              const month = startDt.toLocaleDateString('ko-KR', { month: 'long', timeZone: 'Asia/Seoul' })
              const day = startDt.toLocaleDateString('ko-KR', { day: 'numeric', timeZone: 'Asia/Seoul' })
              const weekday = startDt.toLocaleDateString('ko-KR', { weekday: 'short', timeZone: 'Asia/Seoul' })
              const hh = pad(startDt.getHours())
              const mm = pad(startDt.getMinutes())
              return (
                <div key={b.id} className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)', boxShadow: '0 2px 12px rgba(28,28,28,0.04)' }}>
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: b.menu?.color_tag ?? '#2D4A3E', minHeight: '44px' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: '#1C1C1C' }}>{b.menu?.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(28,28,28,0.5)' }}>
                      {month} {day} ({weekday}) · {hh}:{mm}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(45,74,62,0.08)', color: '#2D4A3E' }}>
                    확정
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-7 text-center" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.06)' }}>
            <p className="text-sm mb-1" style={{ color: 'rgba(28,28,28,0.4)' }}>예약된 시술이 없습니다</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(28,28,28,0.3)' }}>원하시는 날짜와 메뉴를 선택해 예약해 보세요</p>
            <Link href="/customer/booking"
              className="inline-flex items-center h-9 px-6 rounded-xl text-sm font-semibold btn-cream">
              예약하기
            </Link>
          </div>
        )}
      </div>

      {/* 빠른 메뉴 */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.4)' }}>
          메뉴
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/customer/booking', label: '예약 신청', desc: '날짜·메뉴 선택', icon: '📅' },
            { href: '/customer/menus', label: '시술 메뉴', desc: '클래식·볼륨·하이브리드', icon: '✨' },
            { href: '/customer/profile', label: '내 정보', desc: '이름·연락처 수정', icon: '👤' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.07)' }}>
              <p className="text-lg mb-1.5">{item.icon}</p>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#1C1C1C' }}>{item.label}</p>
              <p className="text-xs" style={{ color: 'rgba(28,28,28,0.4)' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
