import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayStr = kstToday.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('lash_salon_bookings')
    .select('*, customer:lash_salon_customers(name, phone), menu:lash_salon_menus(name, color_tag, price)')
    .gte('start_at', `${todayStr}T00:00:00+09:00`)
    .lte('start_at', `${todayStr}T23:59:59+09:00`)
    .eq('status', 'confirmed')
    .order('start_at')

  const monthStart = `${todayStr.slice(0, 7)}-01T00:00:00+09:00`
  const { data: monthBookings } = await supabase
    .from('lash_salon_bookings')
    .select('menu:lash_salon_menus(price)')
    .gte('start_at', monthStart)
    .eq('status', 'confirmed')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthRevenue = (monthBookings as any[] ?? []).reduce((sum: number, b: any) => sum + (b.menu?.price ?? 0), 0)
  const monthCount = monthBookings?.length ?? 0
  const today = new Date()
  const dateLabel = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-1" style={{ fontFamily: 'var(--font-playfair,serif)' }}>오늘의 예약</h1>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>{dateLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(245,240,232,0.4)' }}>이번 달 예약</p>
          <p className="text-2xl font-bold text-[#F5F0E8]">{monthCount}<span className="text-sm font-normal ml-1" style={{ color: 'rgba(245,240,232,0.4)' }}>건</span></p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(245,240,232,0.4)' }}>이번 달 매출</p>
          <p className="text-2xl font-bold" style={{ color: '#A8C5B8' }}>{monthRevenue.toLocaleString()}<span className="text-sm font-normal ml-1" style={{ color: 'rgba(168,197,184,0.6)' }}>원</span></p>
        </div>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm mb-3" style={{ color: 'rgba(245,240,232,0.3)' }}>오늘 예약이 없습니다.</p>
          <Link href="/admin/calendar" className="inline-flex items-center gap-1.5 text-xs hover:underline" style={{ color: '#A8C5B8' }}>
            <CalendarPlus size={13} /> 예약 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(bookings as any[]).map((booking) => (
            <div key={booking.id} className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-1 self-stretch rounded-full" style={{ background: booking.menu?.color_tag || '#2D4A3E', minHeight: '44px' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0E8]">{booking.customer?.name ?? '알 수 없음'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                  {booking.menu?.name} · {new Date(booking.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} ~ {new Date(booking.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                {booking.customer?.phone && <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.3)' }}>{booking.customer.phone}</p>}
              </div>
              <div className="text-right">
                <span className="text-xs text-green-400">확정</span>
                {booking.menu?.price && <p className="text-xs mt-0.5" style={{ color: '#A8C5B8' }}>{booking.menu.price.toLocaleString()}원</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
