'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Menu } from '@/types'

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DOW = ['일','월','화','수','목','금','토']
const TIME_SLOTS = ['11:00','12:30','14:00','15:30','17:00','18:30','20:00']

function pad(n: number) { return String(n).padStart(2, '0') }

function BookingForm() {
  const searchParams = useSearchParams()
  const menuNameFromQuery = searchParams.get('menu') ?? ''

  const now = new Date()
  const today = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }

  const [menus, setMenus] = useState<Menu[]>([])
  const [menuId, setMenuId] = useState('')
  const [view, setView] = useState({ y: today.y, m: today.m })
  const [picked, setPicked] = useState<{ y: number; m: number; d: number } | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monthBookedMap, setMonthBookedMap] = useState<Record<string, string[]>>({})
  const [monthLoading, setMonthLoading] = useState(false)

  useEffect(() => {
    const yr = view.y, mo = view.m + 1
    setMonthLoading(true)
    fetch(`/api/bookings?date=month&year=${yr}&month=${mo}`)
      .then(r => r.json())
      .then((data: { start_at: string }[]) => {
        if (!Array.isArray(data)) return
        const map: Record<string, string[]> = {}
        data.forEach(b => {
          const d = new Date(b.start_at)
          const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
          const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`
          if (!map[key]) map[key] = []
          map[key].push(timeStr)
        })
        setMonthBookedMap(map)
      })
      .catch(() => {})
      .finally(() => setMonthLoading(false))
  }, [view])

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then((data: Menu[]) => {
        const list = Array.isArray(data) ? data : []
        setMenus(list)
        if (menuNameFromQuery) {
          const matched = list.find(m => m.name === menuNameFromQuery)
          if (matched) setMenuId(matched.id)
          else if (list.length > 0) setMenuId(list[0].id)
        } else if (list.length > 0) {
          setMenuId(list[0].id)
        }
      })
      .catch(() => {})
  }, [menuNameFromQuery])

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1)
    const startDow = first.getDay()
    const last = new Date(view.y, view.m + 1, 0).getDate()
    const arr: (number | null)[] = []
    for (let i = 0; i < startDow; i++) arr.push(null)
    for (let d = 1; d <= last; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [view])

  const isAvailable = (d: number | null): boolean => {
    if (!d) return false
    const dt = new Date(view.y, view.m, d)
    if (dt < new Date(today.y, today.m, today.d)) return false
    if (dt.getDay() === 0) return false
    return true
  }

  const bookedSlots: string[] = picked
    ? monthBookedMap[`${picked.y}-${pad(picked.m + 1)}-${pad(picked.d)}`] ?? []
    : []

  const isFullyBooked = (d: number): boolean => {
    const dateStr = `${view.y}-${pad(view.m + 1)}-${pad(d)}`
    return (monthBookedMap[dateStr]?.length ?? 0) >= TIME_SLOTS.length
  }

  const isToday = (d: number) => d === today.d && view.m === today.m && view.y === today.y
  const isPicked = (d: number) => !!picked && d === picked.d && picked.m === view.m && picked.y === view.y

  const moveMonth = (delta: number) => {
    let m = view.m + delta, y = view.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setView({ y, m })
  }

  const selectedMenu = menus.find(m => m.id === menuId) ?? null

  async function handleSubmit() {
    if (!picked || !slot || !selectedMenu) return
    setLoading(true); setError(null)

    const dateStr = `${picked.y}-${pad(picked.m + 1)}-${pad(picked.d)}`
    const startAt = `${dateStr}T${slot}:00+09:00`
    const [h, min] = slot.split(':').map(Number)
    const endTotal = h * 60 + min + (selectedMenu.duration_min ?? 120)
    const endAt = `${dateStr}T${pad(Math.floor(endTotal / 60))}:${pad(endTotal % 60)}:00+09:00`

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: selectedMenu.id, start_at: startAt, end_at: endAt }),
      })
      if (res.status === 201) {
        setSuccess(true)
      } else {
        const json = await res.json()
        setError(json.error ?? '예약에 실패했습니다.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청 실패')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-3">
        <p className="text-2xl font-bold text-gray-900">예약 완료</p>
        <p className="text-sm text-gray-500">
          {selectedMenu?.name} ·{' '}
          {picked && `${picked.y}년 ${picked.m + 1}월 ${picked.d}일`} · {slot}
        </p>
        <button
          onClick={() => { setSuccess(false); setPicked(null); setSlot(null) }}
          className="mt-2 text-sm font-medium text-white bg-gray-900 px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          다른 일정 예약하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 캘린더 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => moveMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-lg">‹</button>
          <p className="text-sm font-semibold text-gray-900">{view.y}년 {MONTHS[view.m]}</p>
          <button onClick={() => moveMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-lg">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />
            const avail = isAvailable(d)
            const full = avail && isFullyBooked(d)
            const picked_ = isPicked(d)
            const today_ = isToday(d)
            return (
              <button
                key={i}
                disabled={!avail || full}
                onClick={() => { if (avail && !full) { setPicked({ y: view.y, m: view.m, d }); setSlot(null) } }}
                className={[
                  'aspect-square flex flex-col items-center justify-center rounded-full text-sm transition-colors',
                  picked_ ? 'bg-gray-900 text-white' :
                  full ? 'text-gray-300 cursor-not-allowed' :
                  !avail ? 'text-gray-200 cursor-not-allowed' :
                  today_ ? 'text-blue-600 font-semibold hover:bg-gray-100' :
                  'text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                <span>{d}</span>
                {full && !picked_ && <span className="text-[9px] text-gray-300 leading-none">Full</span>}
              </button>
            )
          })}
        </div>

        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span>● 예약 가능</span>
          <span className="text-gray-300">● 마감</span>
          <span>일요일 휴무</span>
        </div>
      </div>

      {/* 시간 선택 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          {picked ? `${picked.m + 1}월 ${picked.d}일 · 시간 선택` : '날짜를 먼저 선택하세요'}
        </p>
        {monthLoading && picked ? (
          <p className="text-sm text-gray-400 text-center py-4">로딩 중...</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map(t => {
              const isBooked = bookedSlots.includes(t)
              const isSelected = slot === t
              const disabled = !picked || isBooked
              return (
                <button
                  key={t}
                  disabled={disabled}
                  onClick={() => !isBooked && setSlot(t)}
                  className={[
                    'py-2.5 text-sm rounded-lg border transition-colors',
                    isSelected ? 'bg-gray-900 text-white border-gray-900' :
                    isBooked ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' :
                    !picked ? 'text-gray-300 border-gray-100 cursor-not-allowed' :
                    'border-gray-200 text-gray-700 hover:border-gray-400',
                  ].join(' ')}
                >
                  {t}
                  {isBooked && <span className="block text-[10px]">마감</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 메뉴 선택 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">시술 메뉴</p>
        <div className="space-y-2">
          {menus.map(m => (
            <button
              key={m.id}
              onClick={() => setMenuId(m.id)}
              className={[
                'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors',
                menuId === m.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:border-gray-400',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: menuId === m.id ? '#fff' : (m.color_tag ?? '#6b7280') }} />
                <span className="text-sm font-medium">{m.name}</span>
                <span className={`text-xs ${menuId === m.id ? 'text-gray-300' : 'text-gray-400'}`}>{m.duration_min}분</span>
              </div>
              <span className="text-sm font-semibold">{m.price.toLocaleString()}원</span>
            </button>
          ))}
        </div>
      </div>

      {/* 예약 요약 + 제출 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="text-sm space-y-1.5 text-gray-600">
          <div className="flex justify-between"><span>날짜</span><span className="font-medium text-gray-900">{picked ? `${picked.y}년 ${picked.m + 1}월 ${picked.d}일` : '—'}</span></div>
          <div className="flex justify-between"><span>시간</span><span className="font-medium text-gray-900">{slot ?? '—'}</span></div>
          <div className="flex justify-between"><span>메뉴</span><span className="font-medium text-gray-900">{selectedMenu?.name ?? '—'}</span></div>
          <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-semibold text-gray-900">합계</span><span className="font-bold text-gray-900">{(selectedMenu?.price ?? 0).toLocaleString()}원</span></div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !picked || !slot}
          className="w-full h-11 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '처리 중...' : '예약 확정'}
        </button>
      </div>
    </div>
  )
}

export default function CustomerBookingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">예약 신청</h1>
      <Suspense fallback={<p className="text-sm text-gray-400 text-center py-8">로딩 중...</p>}>
        <BookingForm />
      </Suspense>
    </div>
  )
}
