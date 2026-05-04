'use client'

import { useEffect, useState } from 'react'
import type { Menu } from '@/types'
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react'

function pad(n: number) { return String(n).padStart(2, '0') }
function toKSTDateString(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 10) // 10~20시

export default function CustomerBookingPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [menusLoading, setMenusLoading] = useState(true)
  const [selectedMenuId, setSelectedMenuId] = useState('')
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedHour, setSelectedHour] = useState(10)
  const [selectedMin, setSelectedMin] = useState('00')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(data => { setMenus(Array.isArray(data) ? data : []); setMenusLoading(false) })
      .catch(() => { setMenus([]); setMenusLoading(false) })
  }, [])

  const selectedMenu = menus.find(m => m.id === selectedMenuId) ?? null

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = toKSTDateString(new Date())
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMenu || !selectedDate) return
    setLoading(true); setError(null)

    const startAt = `${selectedDate}T${pad(selectedHour)}:${selectedMin}:00+09:00`
    const endAt = new Date(new Date(startAt).getTime() + selectedMenu.duration_min * 60 * 1000).toISOString()

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_id: selectedMenu.id, start_at: startAt, end_at: endAt }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? '예약에 실패했습니다. 다른 시간을 선택해 주세요.')
      setLoading(false); return
    }

    setSuccess(true); setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(45,74,62,0.1)' }}>
          <Check size={28} style={{ color: '#2D4A3E' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>예약이 신청되었습니다</h2>
        <p className="text-sm mb-2" style={{ color: 'rgba(28,28,28,0.55)' }}>
          {selectedMenu?.name} · {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} {pad(selectedHour)}:{selectedMin}
        </p>
        <p className="text-xs mb-8" style={{ color: 'rgba(28,28,28,0.4)' }}>확인 후 연락드리겠습니다.</p>
        <button
          onClick={() => { setSuccess(false); setSelectedMenuId(''); setSelectedDate('') }}
          className="h-11 px-8 rounded-xl text-sm font-semibold btn-cream"
        >
          다시 예약하기
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(28,28,28,0.4)' }}>RESERVATION</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>예약 신청</h1>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 시술 메뉴 — 콤보박스 */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.45)' }}>
            시술 메뉴
          </label>
          <div className="relative">
            <select
              value={selectedMenuId}
              onChange={e => setSelectedMenuId(e.target.value)}
              required
              disabled={menusLoading}
              className="w-full h-11 pl-4 pr-10 rounded-xl text-sm font-medium appearance-none cursor-pointer"
              style={{
                background: '#FAFAF8',
                border: '1.5px solid rgba(28,28,28,0.1)',
                color: selectedMenuId ? '#1C1C1C' : 'rgba(28,28,28,0.4)',
                outline: 'none',
              }}
            >
              <option value="">{menusLoading ? '불러오는 중...' : '메뉴를 선택해 주세요'}</option>
              {menus.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.price.toLocaleString()}원 ({m.duration_min}분)
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(28,28,28,0.4)' }} />
          </div>
          {selectedMenu && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: selectedMenu.color_tag ?? '#2D4A3E' }} />
              <span className="text-xs" style={{ color: 'rgba(28,28,28,0.55)' }}>
                소요시간 약 {selectedMenu.duration_min}분 · {selectedMenu.price.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        {/* 날짜 선택 */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(28,28,28,0.45)' }}>날짜</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(28,28,28,0.04)' }}>
            <button type="button"
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.05)]"
              style={{ color: 'rgba(28,28,28,0.5)' }}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{year}년 {month + 1}월</span>
            <button type="button"
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.05)]"
              style={{ color: 'rgba(28,28,28,0.5)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <div key={d}
                  className={`py-1.5 text-center text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}
                  style={i !== 0 && i !== 6 ? { color: 'rgba(28,28,28,0.4)' } : {}}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} className="h-9" />
                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
                const isPast = dateStr < todayStr
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === todayStr
                return (
                  <button key={dateStr} type="button" disabled={isPast}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 w-full rounded-lg flex items-center justify-center text-sm transition-all ${isPast ? 'cursor-not-allowed' : 'hover:bg-[rgba(45,74,62,0.08)]'}`}
                    style={isSelected ? { background: '#2D4A3E', color: '#FFFFFF', fontWeight: 600 }
                      : isToday ? { color: '#2D4A3E', fontWeight: 700 }
                      : isPast ? { color: 'rgba(28,28,28,0.2)' }
                      : { color: '#1C1C1C' }}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 시간 선택 */}
        {selectedDate && (
          <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.45)' }}>시간</p>
            <div className="grid grid-cols-4 gap-2">
              {HOURS.map(h =>
                ['00', '30'].map(m => (
                  <button key={`${h}:${m}`} type="button"
                    onClick={() => { setSelectedHour(h); setSelectedMin(m) }}
                    className="h-10 rounded-xl text-sm font-medium transition-all"
                    style={selectedHour === h && selectedMin === m
                      ? { background: '#2D4A3E', color: '#FFFFFF' }
                      : { background: '#FAFAF8', border: '1.5px solid rgba(28,28,28,0.1)', color: '#1C1C1C' }}>
                    {pad(h)}:{m}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 예약 요약 */}
        {selectedMenu && selectedDate && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(45,74,62,0.05)', border: '1.5px solid rgba(45,74,62,0.15)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#2D4A3E' }}>예약 내용</p>
            <div className="space-y-2">
              {[
                { label: '시술', value: selectedMenu.name },
                { label: '날짜', value: new Date(`${selectedDate}T12:00:00`).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) },
                { label: '시간', value: `${pad(selectedHour)}:${selectedMin}` },
                { label: '소요시간', value: `약 ${selectedMenu.duration_min}분` },
                { label: '가격', value: `${selectedMenu.price.toLocaleString()}원` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span style={{ color: 'rgba(28,28,28,0.45)' }}>{item.label}</span>
                  <span className="font-medium" style={{ color: '#1C1C1C' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedMenu || !selectedDate}
          className="w-full h-12 rounded-xl text-sm font-semibold btn-cream disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? '예약 중...' : '예약 신청하기'}
        </button>
        <p className="text-center text-xs -mt-2" style={{ color: 'rgba(28,28,28,0.35)' }}>예약 확인 후 연락드립니다.</p>
      </form>
    </div>
  )
}
