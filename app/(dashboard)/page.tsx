import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('lash_salon_bookings')
    .select('*, customer:lash_salon_customers(name), menu:lash_salon_menus(name, color_tag)')
    .gte('start_at', `${todayStr}T00:00:00`)
    .lte('start_at', `${todayStr}T23:59:59`)
    .eq('status', 'confirmed')
    .order('start_at')

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[#F5F0E8] mb-1"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          오늘의 예약
        </h1>
        <p className="text-sm text-[rgba(245,240,232,0.4)]">
          {today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[rgba(245,240,232,0.3)] text-sm">오늘 예약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(bookings as any[]).map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{ background: '#111111', border: '1px solid rgba(201,169,97,0.15)' }}
            >
              <div
                className="w-1 self-stretch rounded-full"
                style={{ background: booking.menu?.color_tag || '#C9A961', minHeight: '40px' }}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0E8]">
                  {booking.customer?.name ?? '알 수 없음'}
                </p>
                <p className="text-xs text-[rgba(245,240,232,0.4)] mt-0.5">
                  {booking.menu?.name} · {new Date(booking.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="text-xs text-[#C9A961] font-medium">확정</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
