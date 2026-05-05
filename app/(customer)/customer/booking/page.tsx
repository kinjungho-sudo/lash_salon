'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Menu } from '@/types'

const V = {
  bg: '#E9E2D2', bgSoft: '#F2ECDD', bgPaper: '#EFE7D2',
  ink: '#1A2A1C', ink2: '#2A3A2C', ink3: '#4A5A44',
  line: '#C9BFA6', lineSoft: '#D9CFB8', gold: '#7A6440',
  display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
  serif: "var(--font-cormorant,'Cormorant Garamond',serif)",
  serifItalic: "var(--font-cormorant-italic,'Cormorant',serif)",
  sans: "var(--font-inter,'Inter',-apple-system,sans-serif)",
}

const KOR_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const TIME_SLOTS = ['11:00','12:30','14:00','15:30','17:00','18:30','20:00']

function pad(n: number) { return String(n).padStart(2, '0') }

function getCategoryLabel(name: string): string {
  if (name.includes('클래식')) return '클래식'
  if (name.includes('볼륨')) return '볼륨'
  if (name.includes('하이브리드')) return '하이브리드'
  return ''
}

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

  const isToday = (d: number) => d === today.d && view.m === today.m && view.y === today.y
  const isPicked = (d: number) => !!picked && d === picked.d && picked.m === view.m && picked.y === view.y

  const moveMonth = (delta: number) => {
    let m = view.m + delta, y = view.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setView({ y, m })
  }

  const selectedMenu = menus.find(m => m.id === menuId) ?? null
  const labelDate = picked ? `${KOR_MONTH[picked.m]} ${pad(picked.d)}, ${picked.y}` : '— · —'

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

  const dayBtnStyle = (d: number): React.CSSProperties => ({
    aspectRatio: '1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: V.display, fontSize: 18,
    color: isPicked(d) ? V.bgSoft : isToday(d) ? V.gold : !isAvailable(d) ? V.ink3 : V.ink,
    border: isPicked(d) ? `1px solid ${V.ink}` : '1px solid transparent',
    borderRadius: '50%',
    background: isPicked(d) ? V.ink : 'transparent',
    opacity: !isAvailable(d) ? 0.3 : 1,
    cursor: isAvailable(d) ? 'pointer' : 'not-allowed',
    position: 'relative',
    transition: 'all 200ms ease',
  })

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontFamily: V.display, fontSize: 56, color: V.ink, letterSpacing: '0.04em', marginBottom: 16 }}>예약 완료</div>
        <div style={{ width: 48, height: 1, background: V.line, margin: '0 auto 32px' }} />
        <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 14, color: V.ink3, lineHeight: 1.8, marginBottom: 48 }}>
          {selectedMenu?.name} 예약이 확정되었습니다.<br />
          {picked && `${KOR_MONTH[picked.m]} ${pad(picked.d)}, ${picked.y}`} · {slot}<br />
          확인 후 연락드리겠습니다.
        </p>
        <button
          onClick={() => { setSuccess(false); setPicked(null); setSlot(null) }}
          style={{
            padding: '16px 32px', border: `1px solid ${V.ink}`, background: 'transparent',
            fontFamily: V.sans, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: V.ink, cursor: 'pointer', transition: 'all 200ms ease',
          }}
        >
          다른 일정 예약하기
        </button>
      </div>
    )
  }

  return (
    <div style={{
      border: `1px solid ${V.lineSoft}`,
      padding: 48, display: 'grid', gridTemplateColumns: '1.2fr 1px 1fr', gap: 48,
    }}>
      {/* 왼쪽: 달력 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <button
            onClick={() => moveMonth(-1)}
            style={{ width: 32, height: 32, border: `1px solid ${V.line}`, borderRadius: '50%', background: 'transparent', color: V.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          ><span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span></button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: V.display, fontSize: 32, color: V.ink, letterSpacing: '0.04em' }}>{KOR_MONTH[view.m]}</div>
            <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3 }}>{view.y}</div>
          </div>
          <button
            onClick={() => moveMonth(1)}
            style={{ width: 32, height: 32, border: `1px solid ${V.line}`, borderRadius: '50%', background: 'transparent', color: V.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          ><span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DOW.map(d => (
            <div key={d} style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.2em', textAlign: 'center', color: V.ink3, padding: '8px 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
          {days.map((d, i) => {
            if (!d) return <div key={i} />
            return (
              <button
                key={i}
                disabled={!isAvailable(d)}
                onClick={() => { setPicked({ y: view.y, m: view.m, d }); setSlot(null) }}
                style={dayBtnStyle(d)}
              >
                {d}
                {isAvailable(d) && !isPicked(d) && (
                  <span style={{ position: 'absolute', bottom: 4, width: 3, height: 3, borderRadius: '50%', background: V.gold }} />
                )}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 28, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: V.ink3, textTransform: 'uppercase' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: V.gold, display: 'inline-block' }} />예약 가능
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: V.ink, display: 'inline-block' }} />선택됨
          </span>
          <span style={{ opacity: 0.5 }}>일요일 휴무</span>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ background: V.lineSoft }} />

      {/* 오른쪽: 시간 + 메뉴 */}
      <div>
        <div>
          <div style={{ fontFamily: V.display, fontSize: 28, color: V.ink, letterSpacing: '0.02em' }}>
            {picked ? `${KOR_MONTH[picked.m]} ${picked.d}` : 'Choose a date'}
          </div>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.28em', color: V.ink3, textTransform: 'uppercase', marginTop: 6 }}>
            {picked ? '시간 선택' : '왼쪽 캘린더에서 날짜를 선택하세요'}
          </div>
        </div>

        {/* 시간 슬롯 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 28 }}>
          {TIME_SLOTS.map(t => {
            const selected = slot === t
            return (
              <button
                key={t}
                disabled={!picked}
                onClick={() => setSlot(t)}
                style={{
                  padding: '14px 18px',
                  border: `1px solid ${selected ? V.ink : V.lineSoft}`,
                  background: selected ? V.ink : 'transparent',
                  fontFamily: V.sans, fontSize: 13,
                  color: selected ? V.bgSoft : V.ink,
                  letterSpacing: '0.1em', textAlign: 'center',
                  opacity: !picked ? 0.3 : 1,
                  cursor: !picked ? 'not-allowed' : 'pointer',
                  transition: 'all 200ms ease',
                }}
              >{t}</button>
            )
          })}
        </div>

        {/* 메뉴 선택 */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', marginBottom: 12 }}>시술 메뉴</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {menus.map(m => {
              const cat = getCategoryLabel(m.name)
              const isSelected = menuId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMenuId(m.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 18px',
                    border: `1px solid ${isSelected ? V.ink : V.lineSoft}`,
                    background: isSelected ? V.ink : 'transparent',
                    color: isSelected ? V.bgSoft : V.ink,
                    fontFamily: V.serif,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>
                      {m.name}
                      {cat && (
                        <span style={{ fontFamily: V.sans, fontSize: 11, fontWeight: 400, marginLeft: 8, opacity: isSelected ? 0.7 : 0.6 }}>
                          ({cat})
                        </span>
                      )}
                    </span>
                    <span style={{ fontFamily: V.sans, fontSize: 11, opacity: isSelected ? 0.7 : 0.6, fontWeight: 400, marginTop: 2 }}>
                      {m.duration_min}min
                    </span>
                  </span>
                  <span style={{ fontFamily: V.display, fontSize: 18 }}>
                    ₩{Math.round(m.price / 1000)}<small style={{ fontFamily: V.sans, fontSize: 10, opacity: 0.7, marginLeft: 2 }}>K</small>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 오류 */}
        {error && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
            {error}
          </div>
        )}

        {/* 요약 */}
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${V.lineSoft}`, display: 'grid', gap: 14 }}>
          {[
            { k: 'Date', v: labelDate, dim: !picked },
            { k: 'Time', v: slot || '—', dim: !slot },
            { k: 'Service', v: selectedMenu?.name ?? '—', dim: false },
          ].map(({ k, v, dim }) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>{k}</span>
              <span style={{ fontFamily: V.serif, fontSize: 17, color: V.ink, fontStyle: dim ? 'italic' : 'normal', opacity: dim ? 0.5 : 1 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14, borderTop: `1px solid ${V.lineSoft}`, marginTop: 6 }}>
            <span style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontFamily: V.display, fontSize: 22, color: V.ink }}>₩{(selectedMenu?.price ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !picked || !slot}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '16px 28px', border: `1px solid ${V.ink}`,
            background: (loading || !picked || !slot) ? 'transparent' : V.ink,
            color: (loading || !picked || !slot) ? V.ink : V.bgSoft,
            fontFamily: V.sans, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: (loading || !picked || !slot) ? 'not-allowed' : 'pointer',
            opacity: (picked && slot && !loading) ? 1 : 0.4,
            marginTop: 28, transition: 'all 200ms ease',
          }}
        >
          {loading ? '처리 중...' : '예약 확정'}
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>}
        </button>
      </div>
    </div>
  )
}

export default function CustomerBookingPage() {
  const V_PAGE = {
    bg: '#E9E2D2', bgSoft: '#F2ECDD',
    ink: '#1A2A1C', ink3: '#4A5A44', line: '#C9BFA6', lineSoft: '#D9CFB8',
    display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
    sans: "var(--font-inter,'Inter',-apple-system,sans-serif)",
  }
  return (
    <div style={{ minHeight: '100vh', background: V_PAGE.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 56px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: V_PAGE.sans, fontSize: 11, letterSpacing: '0.3em', color: V_PAGE.ink3, textTransform: 'uppercase', marginBottom: 12 }}>No. 03 / Booking</div>
          <h1 style={{ fontFamily: V_PAGE.display, fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1, letterSpacing: '0.02em', color: V_PAGE.ink, margin: 0 }}>Reserve a moment.</h1>
        </div>
        <Suspense fallback={
          <div style={{ fontFamily: V_PAGE.sans, fontSize: 12, letterSpacing: '0.3em', color: V_PAGE.ink3, textTransform: 'uppercase', textAlign: 'center', padding: '80px 0' }}>
            Loading…
          </div>
        }>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  )
}
