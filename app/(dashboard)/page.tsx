import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const today = new Date()
  // KST 기준 오늘 날짜
  const kstToday = new Date(today.getTime() + 9 * 60 * 60 * 1000)
  const todayStr = kstToday.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('lash_salon_bookings')
    .select('*, customer:lash_salon_customers(name, phone), menu:lash_salon_menus(name, color_tag, price)')
    .gte('start_at', `${todayStr}T00:00:00+09:00`)
    .lte('start_at', `${todayStr}T23:59:59+09:00`)
    .eq('status', 'confirmed')
    .order('start_at')

  // 이번 달 통계
  const monthStart = `${todayStr.slice(0, 7)}-01T00:00:00+09:00`
  const { data: monthBookings } = await supabase
    .from('lash_salon_bookings')
    .select('menu:lash_salon_menus(price)')
    .gte('start_at', monthStart)
    .eq('status', 'confirmed')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthRevenue = (monthBookings as any[] ?? []).reduce((sum: number, b: any) => sum + (b.menu?.price ?? 0), 0)
  const monthCount = monthBookings?.length ?? 0

  const dateLabel = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-1" style={{ fontFamily: 'var(--font-playfair,serif)' }}>
          오늘의 예약
        </h1>
        <p className="text-sm text-[rgba(245,240,232,0.4)]">{dateLabel}</p>
      </div>

      {/* 이번 달 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-[rgba(245,240,232,0.4)] uppercase tracking-wider mb-1">이번 달 예약</p>
          <p className="text-2xl font-bold text-[#F5F0E8]">{monthCount}<span className="text-sm font-normal text-[rgba(245,240,232,0.4)] ml-1">건</span></p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-[rgba(245,240,232,0.4)] uppercase tracking-wider mb-1">이번 달 매출</p>
          <p className="text-2xl font-bold text-[#C9A961]">{monthRevenue.toLocaleString()}<span className="text-sm font-normal text-[rgba(201,169,97,0.6)] ml-1">원</span></p>
        </div>
      </div>

      {/* 오늘 예약 */}
      {!bookings || bookings.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[rgba(245,240,232,0.3)] text-sm mb-3">오늘 예약이 없습니다.</p>
          <Link href="/calendar"
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A961] hover:underline">
            <CalendarPlus size={13} /> 예약 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(bookings as any[]).map((booking) => (
            <div key={booking.id}
              className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{ background: '#111111', border: '1px solid rgba(201,169,97,0.12)' }}>
              <div className="w-1 self-stretch rounded-full" style={{ background: booking.menu?.color_tag || '#C9A961', minHeight: '44px' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0E8]">{booking.customer?.name ?? '알 수 없음'}</p>
                <p className="text-xs text-[rgba(245,240,232,0.4)] mt-0.5">
                  {booking.menu?.name} · {new Date(booking.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} ~ {new Date(booking.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                {booking.customer?.phone && (
                  <p className="text-xs text-[rgba(245,240,232,0.3)] mt-0.5">{booking.customer.phone}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-green-400">확정</span>
                {booking.menu?.price && (
                  <p className="text-xs text-[#C9A961] mt-0.5">{booking.menu.price.toLocaleString()}원</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
