'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, Customer, Menu } from '@/types'
import { ChevronLeft, ChevronRight, Plus, X, Check, Loader2, AlertCircle } from 'lucide-react'

type BookingWithRels = Booking & {
  customer: { id: string; name: string; phone: string | null } | null
  menu: { id: string; name: string; color_tag: string | null; duration_min: number } | null
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9)

function pad(n: number) { return String(n).padStart(2, '0') }
function toKSTDateString(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function AdminCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date())
  const [bookings, setBookings] = useState<BookingWithRels[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRels | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ customer_id: '', menu_id: '', date: '', start_hour: '10', start_min: '00' })

  const supabase = createClient()

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/bookings?year=${viewDate.getFullYear()}&month=${viewDate.getMonth() + 1}`)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [viewDate])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    async function loadMeta() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from('lash_salon_customers').select('*').eq('owner_id', user.id).order('name'),
        supabase.from('lash_salon_menus').select('*').eq('owner_id', user.id).eq('is_active', true).order('name'),
      ])
      setCustomers(c ?? [])
      setMenus(m ?? [])
    }
    loadMeta()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateBooking() {
    if (!form.customer_id || !form.menu_id || !form.date) { setError('고객, 메뉴, 날짜를 모두 선택해 주세요.'); return }
    setSaving(true); setError(null)
    const menu = menus.find(m => m.id === form.menu_id)
    const duration = menu?.duration_min ?? 120
    const startAt = `${form.date}T${pad(parseInt(form.start_hour))}:${form.start_min}:00+09:00`
    const endAt = new Date(new Date(startAt).getTime() + duration * 60 * 1000).toISOString()
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: form.customer_id, menu_id: form.menu_id, start_at: startAt, end_at: endAt }),
    })
    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? '예약 등록에 실패했습니다.')
      setSaving(false); return
    }
    setShowForm(false)
    setForm({ customer_id: '', menu_id: '', date: '', start_hour: '10', start_min: '00' })
    await fetchBookings(); setSaving(false)
  }

  async function handleStatusChange(id: string, status: 'cancelled' | 'no_show') {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setSelectedBooking(null); await fetchBookings()
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = toKSTDateString(new Date())

  const bookingsByDate: Record<string, BookingWithRels[]> = {}
  bookings.forEach(b => {
    const dateStr = toKSTDateString(new Date(b.start_at))
    if (!bookingsByDate[dateStr]) bookingsByDate[dateStr] = []
    bookingsByDate[dateStr].push(b)
  })

  const calendarDays: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const selectedDateBookings = form.date ? (bookingsByDate[form.date] ?? []) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>예약 캘린더</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,232,0.4)' }}>예약 등록 및 관리</p>
        </div>
        <button onClick={() => { setShowForm(true); setSelectedBooking(null); setError(null) }}
          className="h-9 px-4 rounded-lg text-sm font-semibold btn-green flex items-center gap-2">
          <Plus size={15} /> 예약 등록
        </button>
      </div>

      {/* 월 이동 */}
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.06)]" style={{ color: 'rgba(245,240,232,0.5)' }}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-[#F5F0E8] min-w-[90px] text-center">{year}년 {month + 1}월</span>
        <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.06)]" style={{ color: 'rgba(245,240,232,0.5)' }}>
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setViewDate(new Date())}
          className="ml-2 px-3 h-7 rounded-md text-xs transition-colors" style={{ color: 'rgba(245,240,232,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
          오늘
        </button>
      </div>

      {/* 달력 */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-7">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`py-2.5 text-center text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}
              style={i !== 0 && i !== 6 ? { color: 'rgba(245,240,232,0.4)' } : {}}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} className="h-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }} />
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
            const dayBookings = bookingsByDate[dateStr] ?? []
            const isToday = dateStr === todayStr
            const isSun = (firstDay + day - 1) % 7 === 0
            const isSat = (firstDay + day - 1) % 7 === 6
            return (
              <div key={dateStr} className="h-20 p-1.5 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
                onClick={() => setForm(f => ({ ...f, date: dateStr }))}>
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'text-[#1C1C1C]' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-[rgba(245,240,232,0.6)]'}`}
                  style={isToday ? { background: '#A8C5B8' } : {}}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 2).map(b => (
                    <div key={b.id} className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer"
                      style={{ background: 'rgba(45,74,62,0.35)', color: '#A8C5B8' }}
                      onClick={e => { e.stopPropagation(); setSelectedBooking(b) }}>
                      {new Date(b.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} {b.customer?.name}
                    </div>
                  ))}
                  {dayBookings.length > 2 && <div className="text-[10px] px-1" style={{ color: 'rgba(245,240,232,0.4)' }}>+{dayBookings.length - 2}개</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 예약 등록 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#2C2C2C', border: '1px solid rgba(45,74,62,0.4)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#F5F0E8]">새 예약</h2>
              <button onClick={() => { setShowForm(false); setError(null) }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.06)]" style={{ color: 'rgba(245,240,232,0.4)' }}>
                <X size={16} />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#F87171' }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'rgba(245,240,232,0.5)' }}>고객 *</label>
                <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm input-luxury">
                  <option value="">고객 선택</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'rgba(245,240,232,0.5)' }}>시술 메뉴 *</label>
                <select value={form.menu_id} onChange={e => setForm(f => ({ ...f, menu_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm input-luxury">
                  <option value="">메뉴 선택</option>
                  {menus.map(m => <option key={m.id} value={m.id}>{m.name} ({m.duration_min}분 / {m.price.toLocaleString()}원)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'rgba(245,240,232,0.5)' }}>날짜 *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'rgba(245,240,232,0.5)' }}>시작 시간 *</label>
                <div className="flex gap-2">
                  <select value={form.start_hour} onChange={e => setForm(f => ({ ...f, start_hour: e.target.value }))}
                    className="flex-1 h-10 px-3 rounded-lg text-sm input-luxury">
                    {HOURS.map(h => <option key={h} value={h}>{pad(h)}시</option>)}
                  </select>
                  <select value={form.start_min} onChange={e => setForm(f => ({ ...f, start_min: e.target.value }))}
                    className="flex-1 h-10 px-3 rounded-lg text-sm input-luxury">
                    {['00', '30'].map(m => <option key={m} value={m}>{m}분</option>)}
                  </select>
                </div>
              </div>
              {form.date && selectedDateBookings.filter(b => b.status === 'confirmed').length > 0 && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(45,74,62,0.15)', border: '1px solid rgba(45,74,62,0.3)' }}>
                  <p className="text-xs mb-2" style={{ color: '#A8C5B8' }}>해당 날짜 기존 예약</p>
                  {selectedDateBookings.filter(b => b.status === 'confirmed').map(b => (
                    <p key={b.id} className="text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>
                      {new Date(b.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}~{new Date(b.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} {b.customer?.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setShowForm(false); setError(null) }}
                className="h-9 px-4 rounded-lg text-sm transition-colors" style={{ color: 'rgba(245,240,232,0.5)' }}>취소</button>
              <button onClick={handleCreateBooking} disabled={saving}
                className="h-9 px-5 rounded-lg text-sm font-semibold btn-green flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? '저장 중...' : '예약 확정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#2C2C2C', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#F5F0E8]">예약 상세</h2>
              <button onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.06)]" style={{ color: 'rgba(245,240,232,0.4)' }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>고객</p>
                <p className="text-sm font-medium text-[#F5F0E8]">{selectedBooking.customer?.name}</p>
                {selectedBooking.customer?.phone && <p className="text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>{selectedBooking.customer.phone}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>시술</p>
                <p className="text-sm text-[#F5F0E8]">{selectedBooking.menu?.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>일시</p>
                <p className="text-sm text-[#F5F0E8]">{new Date(selectedBooking.start_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  {new Date(selectedBooking.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} ~ {new Date(selectedBooking.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>상태</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedBooking.status === 'confirmed' ? 'bg-green-900/30 text-green-400' : selectedBooking.status === 'cancelled' ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'}`}>
                  {selectedBooking.status === 'confirmed' ? '확정' : selectedBooking.status === 'cancelled' ? '취소' : '노쇼'}
                </span>
              </div>
            </div>
            {selectedBooking.status === 'confirmed' && (
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(selectedBooking.id, 'no_show')}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors" style={{ border: '1px solid rgba(251,146,60,0.3)', color: '#FB923C' }}>
                  노쇼 처리
                </button>
                <button onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors" style={{ border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
                  예약 취소
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 이번 달 예약 목록 */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(245,240,232,0.5)' }}>{month + 1}월 전체 예약</h2>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>불러오는 중...</div>
        ) : bookings.filter(b => b.status === 'confirmed').length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>이번 달 예약이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.filter(b => b.status === 'confirmed').map(b => (
              <div key={b.id} className="rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setSelectedBooking(b)}>
                <div className="w-1 self-stretch rounded-full" style={{ background: b.menu?.color_tag ?? '#2D4A3E', minHeight: '36px' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F0E8]">{b.customer?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                    {b.menu?.name} · {new Date(b.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} {new Date(b.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(245,240,232,0.3)' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
