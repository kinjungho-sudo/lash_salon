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
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 mb-1">MUTE EYELASH SALON</p>
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, {displayName}님</h1>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">다가오는 예약</p>
        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(upcomingBookings as any[]).map(b => {
              const startDt = new Date(b.start_at)
              const month = startDt.toLocaleDateString('ko-KR', { month: 'long', timeZone: 'Asia/Seoul' })
              const day = startDt.toLocaleDateString('ko-KR', { day: 'numeric', timeZone: 'Asia/Seoul' })
              const weekday = startDt.toLocaleDateString('ko-KR', { weekday: 'short', timeZone: 'Asia/Seoul' })
              const hh = pad(startDt.getHours())
              const mm = pad(startDt.getMinutes())
              return (
                <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: b.menu?.color_tag ?? '#6b7280' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{b.menu?.name}</p>
                    <p className="text-xs text-gray-400">{month} {day} ({weekday}) · {hh}:{mm}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">확정</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">예약된 시술이 없습니다.</p>
            <Link href="/customer/booking" className="inline-block text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              예약하기
            </Link>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">메뉴</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: '/customer/booking', label: '예약 신청', desc: '날짜·메뉴 선택' },
            { href: '/customer/menus', label: '시술 메뉴', desc: '클래식·볼륨·하이브리드' },
            { href: '/customer/profile', label: '내 정보', desc: '이름·연락처 수정' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
