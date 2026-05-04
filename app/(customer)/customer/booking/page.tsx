'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Menu } from '@/types'
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react'

function pad(n: number) { return String(n).padStart(2, '0') }
function toKSTDateString(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 10) // 10~20시

export default function CustomerBookingPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedHour, setSelectedHour] = useState(10)
  const [selectedMin, setSelectedMin] = useState('00')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1:메뉴 2:날짜시간 3:확인

  const supabase = createClient()

  useEffect(() => {
    async function loadMenus() {
      // 관리자 프로필에서 활성 메뉴 조회
      const { data: profiles } = await supabase
        .from('lash_salon_owner_profiles')
        .select('id')
        .limit(1)
        .single()
      if (!profiles) return

      const { data } = await supabase
        .from('lash_salon_menus')
        .select('*')
        .eq('owner_id', profiles.id)
        .eq('is_active', true)
        .order('name')
      setMenus(data ?? [])
    }
    loadMenus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!selectedMenu || !selectedDate) return
    setLoading(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('로그인이 필요합니다.'); setLoading(false); return }

    // 고객 레코드 확인 또는 생성
    let { data: customerRecord } = await supabase
      .from('lash_salon_customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!customerRecord) {
      // 관리자 프로필 id 가져오기
      const { data: ownerProfile } = await supabase.from('lash_salon_owner_profiles').select('id').limit(1).single()
      if (!ownerProfile) { setError('예약을 처리할 수 없습니다.'); setLoading(false); return }

      const userName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? '고객'
      const { data: newCustomer } = await supabase
        .from('lash_salon_customers')
        .insert({ owner_id: ownerProfile.id, name: userName, user_id: user.id })
        .select('id')
        .single()
      customerRecord = newCustomer
    }

    if (!customerRecord) { setError('고객 정보를 생성할 수 없습니다.'); setLoading(false); return }

    const startAt = `${selectedDate}T${pad(selectedHour)}:${selectedMin}:00+09:00`
    const endAt = new Date(new Date(startAt).getTime() + selectedMenu.duration_min * 60 * 1000).toISOString()

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerRecord.id, menu_id: selectedMenu.id, start_at: startAt, end_at: endAt }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? '예약에 실패했습니다. 다른 시간을 선택해 주세요.')
      setLoading(false); return
    }

    setSuccess(true); setLoading(false)
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = toKSTDateString(new Date())
  const calendarDays: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(45,74,62,0.1)' }}>
          <Check size={28} style={{ color: '#2D4A3E' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>예약이 신청되었습니다</h2>
        <p className="text-sm mb-2" style={{ color: 'rgba(28,28,28,0.55)' }}>
          {selectedMenu?.name} · {new Date(`${selectedDate}T${pad(selectedHour)}:${selectedMin}:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} {pad(selectedHour)}:{selectedMin}
        </p>
        <p className="text-xs mb-8" style={{ color: 'rgba(28,28,28,0.4)' }}>확인 후 연락드리겠습니다.</p>
        <button onClick={() => { setSuccess(false); setStep(1); setSelectedMenu(null); setSelectedDate('') }}
          className="h-11 px-8 rounded-xl text-sm font-semibold btn-cream">
          홈으로
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

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all`}
              style={step >= s ? { background: '#2D4A3E', color: '#FFFFFF' } : { background: 'rgba(28,28,28,0.08)', color: 'rgba(28,28,28,0.35)' }}>
              {step > s ? '✓' : s}
            </div>
            <span className="text-xs" style={{ color: step >= s ? '#1C1C1C' : 'rgba(28,28,28,0.35)' }}>
              {s === 1 ? '메뉴' : s === 2 ? '날짜/시간' : '확인'}
            </span>
            {s < 3 && <div className="w-8 h-px mx-1" style={{ background: 'rgba(28,28,28,0.12)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* STEP 1: 메뉴 선택 */}
      {step === 1 && (
        <div>
          <p className="text-sm font-medium mb-4" style={{ color: '#1C1C1C' }}>시술 메뉴를 선택해 주세요</p>
          <div className="space-y-3 mb-6">
            {menus.map(m => (
              <button key={m.id} onClick={() => setSelectedMenu(m)}
                className="w-full rounded-2xl p-5 text-left transition-all"
                style={selectedMenu?.id === m.id
                  ? { background: 'rgba(45,74,62,0.08)', border: '2px solid #2D4A3E' }
                  : { background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color_tag ?? '#2D4A3E' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{m.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#2D4A3E' }}>{m.price.toLocaleString()}원</p>
                    <p className="text-xs" style={{ color: 'rgba(28,28,28,0.4)' }}>{m.duration_min}분</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { if (selectedMenu) setStep(2) }}
            disabled={!selectedMenu}
            className="w-full h-11 rounded-xl text-sm font-semibold btn-cream disabled:opacity-40">
            다음 — 날짜 선택
          </button>
        </div>
      )}

      {/* STEP 2: 날짜/시간 선택 */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs mb-5" style={{ color: 'rgba(28,28,28,0.5)' }}>
            <ChevronLeft size={14} /> 메뉴 변경
          </button>

          <div className="rounded-2xl overflow-hidden mb-5" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
            {/* 월 이동 */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.05)]" style={{ color: 'rgba(28,28,28,0.5)' }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{year}년 {month + 1}월</span>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.05)]" style={{ color: 'rgba(28,28,28,0.5)' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 달력 */}
            <div className="p-3">
              <div className="grid grid-cols-7 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                  <div key={d} className={`py-1.5 text-center text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}
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
                    <button key={dateStr} disabled={isPast}
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
            <div className="mb-5">
              <p className="text-sm font-medium mb-3" style={{ color: '#1C1C1C' }}>시간 선택</p>
              <div className="grid grid-cols-4 gap-2">
                {HOURS.map(h => (
                  ['00', '30'].map(m => (
                    <button key={`${h}:${m}`}
                      onClick={() => { setSelectedHour(h); setSelectedMin(m) }}
                      className="h-10 rounded-xl text-sm font-medium transition-all"
                      style={selectedHour === h && selectedMin === m
                        ? { background: '#2D4A3E', color: '#FFFFFF' }
                        : { background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.1)', color: '#1C1C1C' }}>
                      {pad(h)}:{m}
                    </button>
                  ))
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { if (selectedDate) setStep(3) }} disabled={!selectedDate}
            className="w-full h-11 rounded-xl text-sm font-semibold btn-cream disabled:opacity-40">
            다음 — 예약 확인
          </button>
        </div>
      )}

      {/* STEP 3: 예약 확인 */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs mb-5" style={{ color: 'rgba(28,28,28,0.5)' }}>
            <ChevronLeft size={14} /> 날짜 변경
          </button>

          <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)' }}>
            <h2 className="text-base font-bold mb-5" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>예약 확인</h2>
            <div className="space-y-4">
              {[
                { label: '시술', value: selectedMenu?.name },
                { label: '날짜', value: selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : '' },
                { label: '시간', value: `${pad(selectedHour)}:${selectedMin}` },
                { label: '소요시간', value: `약 ${selectedMenu?.duration_min}분` },
                { label: '가격', value: `${selectedMenu?.price.toLocaleString()}원` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(28,28,28,0.05)', paddingBottom: '12px' }}>
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(28,28,28,0.45)' }}>{item.label}</span>
                  <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-semibold btn-cream disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? '예약 중...' : '예약 신청하기'}
          </button>
          <p className="text-center text-xs mt-3" style={{ color: 'rgba(28,28,28,0.35)' }}>예약 확인 후 연락드립니다.</p>
        </div>
      )}
    </div>
  )
}
