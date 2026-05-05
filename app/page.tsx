'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  FlourishRule,
  MapArt,
} from '@/components/landing/mute-ornaments'

// ── 공통 CSS 변수 shorthand ──────────────────────────────────────────
const V = {
  bg: 'var(--mute-bg)',
  bgSoft: 'var(--mute-bg-soft)',
  bgPaper: 'var(--mute-bg-paper)',
  ink: 'var(--mute-ink)',
  ink2: 'var(--mute-ink-2)',
  ink3: 'var(--mute-ink-3)',
  line: 'var(--mute-line)',
  lineSoft: 'var(--mute-line-soft)',
  gold: 'var(--mute-gold)',
  serif: 'var(--mute-serif)',
  serifItalic: 'var(--mute-serif-italic)',
  display: 'var(--mute-display)',
  kr: 'var(--mute-kr)',
  sans: 'var(--mute-sans)',
}

// ────────────────────────────────────────────────────────────────────
// NAV
// ────────────────────────────────────────────────────────────────────
function Nav({ onLogin }: { onLogin: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(233,226,210,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${V.lineSoft}`,
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: '18px 56px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 32,
      }}>
        {/* 좌측 메뉴 */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {['About', 'Menu', 'Booking', 'Journal'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontFamily: V.sans, fontSize: 11, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: V.ink2,
                textDecoration: 'none', padding: '4px 0',
              }}
            >{label}</a>
          ))}
        </div>
        {/* 브랜드 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: V.display, fontSize: 22, letterSpacing: '0.2em', color: V.ink }}>MUTE</div>
          <div style={{ fontFamily: V.sans, fontSize: 9, letterSpacing: '0.4em', color: V.ink3, marginTop: 2, textTransform: 'uppercase' }}>Eyelash · Est. 2023</div>
        </div>
        {/* 우측 메뉴 */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center', justifyContent: 'flex-end' }}>
          {['Location', 'Contact'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontFamily: V.sans, fontSize: 11, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: V.ink2,
                textDecoration: 'none', padding: '4px 0',
              }}
            >{label}</a>
          ))}
          <button
            onClick={onLogin}
            aria-label="login"
            style={{
              width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${V.line}`, background: 'transparent', color: V.ink, borderRadius: '50%',
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

// ────────────────────────────────────────────────────────────────────
// HERO
// ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="about" style={{ minHeight: '92vh', padding: '80px 0 100px', position: 'relative', overflow: 'hidden', background: V.bg }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'center' }}>
          {/* 텍스트 */}
          <div>
            <div className="mute-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              No. 01
              <span style={{ display: 'inline-block', width: 4, height: 4, background: V.ink3, borderRadius: '50%', margin: '0 10px 2px' }} />
              Eyelash Atelier
              <span style={{ display: 'inline-block', width: 4, height: 4, background: V.ink3, borderRadius: '50%', margin: '0 10px 2px' }} />
              Seoul
            </div>
            <h1 style={{
              fontFamily: V.display,
              fontSize: 'clamp(72px, 10vw, 148px)',
              lineHeight: 0.92,
              letterSpacing: '0.01em',
              color: V.ink,
              margin: '32px 0 28px',
            }}>
              Quiet<br />
              <span style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontWeight: 300 }}>elegance</span><br />
              for the eyes.
            </h1>
            <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 16, lineHeight: 1.9, color: V.ink2, maxWidth: 440, marginBottom: 40 }}>
              고요한 시선의 아름다움. MUTE는 자연을 닮은 컬과 결을 손끝의 정성으로 완성합니다.
              한 사람을 위한 단 하나의 디자인, 그것이 우리의 기준입니다.
            </p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#booking" className="mute-btn">
                예약하기 <span className="material-symbols-outlined">arrow_forward</span>
              </a>
              <a href="#menu" className="mute-link">
                시술 메뉴 보기
              </a>
            </div>
            {/* 통계 */}
            <div style={{ display: 'flex', gap: 56, marginTop: 64, paddingTop: 32, borderTop: `1px solid ${V.line}` }}>
              {[
                { k: 'Established', v: '2023' },
                { k: 'Designers', v: '04' },
                { k: 'Rating', v: '4.97' },
              ].map(({ k, v }) => (
                <div key={k}>
                  <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: V.ink3 }}>{k}</div>
                  <div style={{ fontFamily: V.display, fontSize: 28, color: V.ink, marginTop: 8 }}>
                    {v}
                    {k === 'Rating' && <span style={{ fontSize: 14, color: V.gold, marginLeft: 6 }}>★</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 이미지 */}
          <div style={{ position: 'relative', aspectRatio: '4/5', background: V.bgSoft, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 2, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>
              Plate I · MMXXVI
            </div>
            <Image
              src="/images/name-card.png"
              alt="MUTE Eyelash Salon"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
            <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 2, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>
              Cilium · Atelier MUTE
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// MENU
// ────────────────────────────────────────────────────────────────────
type DbMenu = { id: string; name: string; price: number; duration_min: number; color_tag?: string }

function getCategoryLabel(name: string): string {
  // name에 키워드가 포함되어 있으면 해당 카테고리
  if (name.includes('클래식')) return '클래식'
  if (name.includes('볼륨')) return '볼륨'
  if (name.includes('하이브리드')) return '하이브리드'
  return ''
}

function Menu({ menus }: { menus: DbMenu[] }) {
  const items = menus.length > 0 ? menus : []

  return (
    <section id="menu" style={{ padding: '120px 0', background: V.bg }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        {/* 섹션 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'end', marginBottom: 72 }}>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12 }}>No. 02 / Menu</div>
          <h2 style={{ fontFamily: V.display, fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1, letterSpacing: '0.02em', color: V.ink, margin: 0 }}>A measured menu.</h2>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12, textAlign: 'right' }}>시술 메뉴 · ₩ KRW</div>
        </div>
        {/* 메뉴 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${V.line}` }}>
          {items.map((item, idx) => {
            const cat = getCategoryLabel(item.name)
            const priceK = Math.round(item.price / 1000)
            const durLabel = `${item.duration_min} MIN`
            const numStr = String(idx + 1).padStart(2, '0')
            return (
              <div
                key={item.id}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto auto', gap: 28, alignItems: 'center',
                  padding: idx % 2 === 0 ? '32px 56px 32px 0' : '32px 0 32px 56px',
                  borderBottom: `1px solid ${V.line}`,
                  borderRight: idx % 2 === 0 ? `1px solid ${V.line}` : 'none',
                  transition: 'background 200ms ease',
                }}
              >
                <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.2em', color: V.ink3 }}>{numStr}</div>
                <div>
                  <div style={{ fontFamily: V.serif, fontSize: 24, color: V.ink }}>
                    {item.name}
                    {cat && (
                      <span style={{ fontFamily: V.sans, fontSize: 12, color: V.ink3, fontWeight: 400, marginLeft: 8, letterSpacing: '0.04em' }}>
                        ({cat})
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.2em', color: V.ink3, textTransform: 'uppercase' }}>{durLabel}</div>
                <div style={{ fontFamily: V.display, fontSize: 22, color: V.ink }}>
                  {priceK}<small style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.2em', color: V.ink3, marginLeft: 4 }}>,000</small>
                </div>
              </div>
            )
          })}
        </div>
        {/* 하단 */}
        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: `1px solid ${V.line}` }}>
          <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 14, color: V.ink3, maxWidth: 520, margin: 0, lineHeight: 1.75 }}>
            모든 시술은 1:1 디자이너 상담을 통해 진행되며, 첫 방문 시 10% 할인이 적용됩니다.
          </p>
          <a href="#booking" className="mute-link">
            예약하기 <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// QUOTE BAND
// ────────────────────────────────────────────────────────────────────
function QuoteBand() {
  return (
    <section style={{ padding: '100px 0', background: V.bgPaper }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 56px', textAlign: 'center' }}>
        <FlourishRule width={96} color="#9B8559" />
        <div style={{
          fontFamily: V.serifItalic, fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(28px, 3.6vw, 44px)', lineHeight: 1.35,
          color: V.ink, margin: '24px 0 32px',
        }}>
          &ldquo;시선은 말보다 먼저 닿는다.{' '}
          <span style={{ fontFamily: V.serifItalic, fontStyle: 'italic' }}>우리는 그 첫 인사를 다듬는 사람이다.</span>
          &rdquo;
        </div>
        <div style={{ fontFamily: V.sans, fontSize: 12, letterSpacing: '0.2em', color: V.ink3, fontWeight: 500 }}>
          — Park Hyein, Founder & Lead Designer
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// CALENDAR (BOOKING)
// ────────────────────────────────────────────────────────────────────
const KOR_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const TIME_SLOTS = ['11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00']

type Picked = { y: number; m: number; d: number }

function CalendarSection({ menus, onNeedLogin }: { menus: DbMenu[]; onNeedLogin: () => void }) {
  const supabase = createClient()
  const now = new Date()
  const today = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }

  const [view, setView] = useState({ y: today.y, m: today.m })
  const [picked, setPicked] = useState<Picked | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string>(menus[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [bookingDone, setBookingDone] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // menus prop이 바뀌면 첫 번째 메뉴로 초기화
  useEffect(() => {
    if (menus.length > 0 && !menuId) setMenuId(menus[0].id)
  }, [menus, menuId])

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
    const todayDate = new Date(today.y, today.m, today.d)
    if (dt < todayDate) return false
    if (dt.getDay() === 0) return false // 일요일 휴무
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

  const selectedMenu = menus.find(m => m.id === menuId) ?? menus[0]
  const labelDate = picked ? `${KOR_MONTH[picked.m]} ${String(picked.d).padStart(2, '0')}, ${picked.y}` : '— · —'

  async function handleConfirm() {
    if (!picked || !slot || !selectedMenu) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { onNeedLogin(); return }

    const dateStr = `${picked.y}-${String(picked.m + 1).padStart(2, '0')}-${String(picked.d).padStart(2, '0')}`
    const startAt = `${dateStr}T${slot}:00+09:00`
    const endMin = (selectedMenu.duration_min ?? 120)
    const [h, min] = slot.split(':').map(Number)
    const endTotal = h * 60 + min + endMin
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0')
    const endM = String(endTotal % 60).padStart(2, '0')
    const endAt = `${dateStr}T${endH}:${endM}:00+09:00`

    setSubmitting(true)
    setBookingError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: selectedMenu.id, start_at: startAt, end_at: endAt }),
      })
      if (res.status === 201) {
        setBookingDone(true)
      } else {
        const json = await res.json().catch(() => ({}))
        setBookingError(json.error ?? `서버 오류 (${res.status})`)
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : '요청 실패')
    } finally {
      setSubmitting(false)
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

  return (
    <section id="booking" style={{ padding: '120px 0', background: V.bgSoft }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        {/* 섹션 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'end', marginBottom: 72 }}>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12 }}>No. 03 / Booking</div>
          <h2 style={{ fontFamily: V.display, fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1, letterSpacing: '0.02em', color: V.ink, margin: 0 }}>Reserve a moment.</h2>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12, textAlign: 'right' }}>예약 · 실시간 가능시간</div>
        </div>

        {/* 캘린더 카드 */}
        <div style={{
          background: V.bgSoft, border: `1px solid ${V.lineSoft}`,
          padding: 56, display: 'grid', gridTemplateColumns: '1.2fr 1px 1fr', gap: 56,
        }}>
          {/* 왼쪽: 달력 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <button
                onClick={() => moveMonth(-1)}
                style={{ width: 32, height: 32, border: `1px solid ${V.line}`, borderRadius: '50%', background: 'transparent', color: V.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms ease' }}
              ><span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span></button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: V.display, fontSize: 32, color: V.ink, letterSpacing: '0.04em' }}>{KOR_MONTH[view.m]}</div>
                <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3 }}>{view.y}</div>
              </div>
              <button
                onClick={() => moveMonth(1)}
                style={{ width: 32, height: 32, border: `1px solid ${V.line}`, borderRadius: '50%', background: 'transparent', color: V.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms ease' }}
              ><span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span></button>
            </div>

            {/* 요일 헤더 */}
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

            {/* 범례 */}
            <div style={{ display: 'flex', gap: 24, marginTop: 28, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: V.ink3, textTransform: 'uppercase' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: V.gold, display: 'inline-block' }} />예약 가능
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: V.ink, display: 'inline-block' }} />선택됨
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>일요일 휴무</span>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ background: V.lineSoft }} />

          {/* 오른쪽: 시간 + 메뉴 선택 */}
          <div>
            {bookingDone ? (
              /* 예약 완료 상태 */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontFamily: V.display, fontSize: 56, color: V.ink, letterSpacing: '0.04em', marginBottom: 16 }}>예약 완료</div>
                <div style={{ width: 48, height: 1, background: V.line, margin: '0 auto 28px' }} />
                <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 14, color: V.ink3, lineHeight: 1.8, marginBottom: 36 }}>
                  예약이 확정되었습니다.<br />변경이 필요하시면 마이페이지에서 확인하세요.
                </p>
                <button
                  onClick={() => { setBookingDone(false); setPicked(null); setSlot(null) }}
                  className="mute-btn outline"
                  style={{ border: `1px solid ${V.line}`, background: 'transparent', color: V.ink }}
                >
                  다른 일정 예약하기
                </button>
              </div>
            ) : (
              <>
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

                {/* 시술 메뉴 선택 */}
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

                {/* 오류 메시지 */}
                {bookingError && (
                  <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
                    {bookingError}
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
                  className="mute-btn"
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    width: '100%', justifyContent: 'center', marginTop: 28,
                    opacity: (picked && slot && !submitting) ? 1 : 0.4,
                    pointerEvents: (picked && slot && !submitting) ? 'auto' : 'none',
                  }}
                >
                  {submitting ? '처리 중...' : '예약 확정'}
                  {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// TREND / JOURNAL
// ────────────────────────────────────────────────────────────────────
const TREND_ARTICLES = [
  {
    tag: 'Edition 12 · Curl',
    title: '결을 다듬는다,',
    titleItalic: '자연스럽게.',
    desc: '2026년의 시선은 정돈된 자연스러움으로 향합니다. 과장 없는 곡선, 결을 따라 흐르는 부드러운 컬이 봄의 분위기를 완성합니다.',
    meta: ['READ', '05 MIN', 'By Hyein Park'],
    large: true,
    img: '/images/classic-lash.png',
    imgAlt: 'Classic Lash',
  },
  {
    tag: 'Edition 11 · Hybrid',
    title: '볼륨이 만드는 깊이',
    desc: '한 가닥의 두께보다 결의 방향이 인상을 결정합니다. 하이브리드 디자인이 만들어내는 미묘한 입체감을 소개합니다.',
    meta: ['READ', '04 MIN'],
    large: false,
    img: '/images/hybrid-lash.jpg',
    imgAlt: 'Hybrid Lash',
  },
  {
    tag: 'Edition 10 · Perm',
    title: '컬의 방향을 설계하다',
    desc: '펌 포인트 익스텐션이 만드는 섬세한 리프트. c-curl 11mm의 정밀한 각도가 시선의 인상을 바꿉니다.',
    meta: ['READ', '06 MIN'],
    large: false,
    img: '/images/perm-extension.jpg',
    imgAlt: 'Perm Extension',
  },
]

function Trend() {
  return (
    <section id="journal" style={{ padding: '120px 0', background: V.bgPaper }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'end', marginBottom: 72 }}>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12 }}>No. 04 / Journal</div>
          <h2 style={{ fontFamily: V.display, fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1, letterSpacing: '0.02em', color: V.ink, margin: 0 }}>Spring trends.</h2>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12, textAlign: 'right' }}>2026 · S/S Edition</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 32 }}>
          {TREND_ARTICLES.map((art) => (
            <article key={art.tag} style={{ borderTop: `1px solid ${V.line}`, paddingTop: 24 }}>
              <div style={{ aspectRatio: '4/5', background: V.bgSoft, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
                <Image
                  src={art.img}
                  alt={art.imgAlt}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>{art.tag}</div>
              <h3 style={{
                fontFamily: V.display,
                fontSize: art.large ? 44 : 32,
                lineHeight: 1.1, color: V.ink, margin: '16px 0', letterSpacing: '0.01em',
              }}>
                {art.title}
                {'titleItalic' in art && art.titleItalic && (
                  <> <span style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontWeight: 300 }}>{art.titleItalic}</span></>
                )}
              </h3>
              <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 14, lineHeight: 1.8, color: V.ink2, margin: 0 }}>{art.desc}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center', fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: V.ink3, textTransform: 'uppercase' }}>
                {art.meta.map((m, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {i > 0 && <span style={{ width: 3, height: 3, background: V.ink3, borderRadius: '50%', display: 'inline-block' }} />}
                    {m}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// LOCATION
// ────────────────────────────────────────────────────────────────────
function Location() {
  return (
    <section id="location" style={{ padding: '120px 0', background: V.bg }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'end', marginBottom: 72 }}>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12 }}>No. 05 / Location</div>
          <h2 style={{ fontFamily: V.display, fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1, letterSpacing: '0.02em', color: V.ink, margin: 0 }}>Find us.</h2>
          <div style={{ fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingBottom: 12, textAlign: 'right' }}>서울 · 성수동</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 64, alignItems: 'center' }}>
          {/* 주소 */}
          <div style={{ paddingRight: 32 }}>
            <div className="mute-eyebrow" style={{ marginBottom: 24 }}>The Atelier</div>
            <p style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 17, lineHeight: 1.9, color: V.ink, margin: 0 }}>
              서울특별시 성동구<br />
              성수동2가 아뜰리에길 14<br />
              <span style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16 }}>2nd floor, Maison Ode</span>
            </p>
            <div style={{ marginTop: 40, display: 'grid', gap: 24 }}>
              {[
                { k: 'Hours', v: '화 — 토 · 11:00 — 21:00', sub: '일 · 월 정기 휴무' },
                { k: 'Subway', v: '2호선 성수역 3번출구 · 도보 6분' },
                { k: 'Parking', v: '발렛 가능 · 1F 입구', sub: '제휴 주차 2시간' },
                { k: 'Reach', v: '+82 02 547 0023', last: true },
              ].map(({ k, v, sub, last }) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 20, paddingBottom: 18, borderBottom: last ? 'none' : `1px solid ${V.lineSoft}` }}>
                  <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', paddingTop: 4 }}>{k}</div>
                  <div style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 15, color: V.ink, lineHeight: 1.7 }}>
                    {v}
                    {sub && <><br /><span style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 13, color: V.ink3 }}>{sub}</span></>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <a href="https://map.kakao.com/" target="_blank" rel="noopener noreferrer" className="mute-btn outline">
                <span className="material-symbols-outlined">map</span> 지도 앱으로 열기
              </a>
            </div>
          </div>
          {/* 지도 */}
          <div style={{ position: 'relative', aspectRatio: '5/4', border: `1px solid ${V.lineSoft}`, overflow: 'hidden' }}>
            <MapArt />
            <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>
              N 37.544 · E 127.057
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: V.display, fontSize: 14, letterSpacing: '0.4em', color: V.ink }}>
              SEONGSU · SEOUL
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// FOOTER
// ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer id="contact" style={{ padding: '100px 0 56px', background: V.ink, color: V.bgSoft }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 56,
          paddingBottom: 72, borderBottom: 'rgba(242,236,221,0.15) 1px solid',
        }}>
          {/* 브랜드 */}
          <div>
            <div style={{ fontFamily: V.display, fontSize: 56, letterSpacing: '0.04em' }}>MUTE</div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.6, textTransform: 'uppercase', marginTop: 10 }}>Eyelash Salon · Est. 2023</div>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 18, marginTop: 32, opacity: 0.8, lineHeight: 1.6, maxWidth: 320 }}>
              한 사람을 위한, 단 하나의 디자인.
            </p>
          </div>
          {/* Visit */}
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.6, textTransform: 'uppercase', marginBottom: 18 }}>Visit</div>
            {['서울 성수동2가', '아뜰리에길 14, 2F', '11:00 — 21:00'].map(t => (
              <p key={t} style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 15, lineHeight: 1.9, opacity: 0.9, margin: 0 }}>{t}</p>
            ))}
          </div>
          {/* Reach */}
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.6, textTransform: 'uppercase', marginBottom: 18 }}>Reach</div>
            {['+82 02 547 0023', 'hello@mute-salon.kr', '@mute.eyelash'].map(t => (
              <a key={t} href="#" style={{ fontFamily: V.sans, fontWeight: 400, fontSize: 15, lineHeight: 1.9, opacity: 0.9, display: 'block', color: 'inherit', textDecoration: 'none' }}>{t}</a>
            ))}
          </div>
          {/* Newsletter */}
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.6, textTransform: 'uppercase', marginBottom: 18 }}>Letter</div>
            <p style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontFamily: V.sans, fontWeight: 400 }}>새 시술과 트렌드를 가장 먼저 받아보세요.</p>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(242,236,221,0.3)', paddingBottom: 8 }}>
              <input
                placeholder="email address"
                style={{ flex: 1, background: 'transparent', border: 'none', color: V.bgSoft, fontFamily: V.serif, fontSize: 16, outline: 'none' }}
              />
              <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.7 }}>arrow_forward</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 32, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', opacity: 0.5, textTransform: 'uppercase' }}>
          <span>© 2026 MUTE Eyelash Salon</span>
          <span style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>개인정보처리방침</Link>
            <span>Crafted with quiet hands · Seoul</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

// ────────────────────────────────────────────────────────────────────
// LOGIN MODAL
// ────────────────────────────────────────────────────────────────────
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(42,58,44,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 250ms ease',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(960px, 92vw)', maxHeight: '90vh', overflow: 'auto',
          background: V.bgSoft, display: 'grid', gridTemplateColumns: '1fr 1fr',
          position: 'relative', border: `1px solid ${V.lineSoft}`,
          transform: open ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 300ms ease',
        }}
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(242,236,221,0.3)',
            background: 'transparent', color: V.bgSoft,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
        {/* 왼쪽 패널 */}
        <aside style={{
          background: V.ink, color: V.bgSoft, padding: '64px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(242,236,221,0.6)' }}>Members · MUTE</div>
            <h3 style={{ fontFamily: V.display, fontSize: 56, lineHeight: 1, letterSpacing: '0.02em', margin: '24px 0 18px' }}>Welcome<br />back.</h3>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 1.7, color: 'rgba(242,236,221,0.9)', margin: 0 }}>
              &ldquo;한 사람의 시선을 기억하는 일, 그것이 우리의 시작입니다.&rdquo;
            </p>
          </div>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(242,236,221,0.5)', textTransform: 'uppercase' }}>
            Member benefits · 시술 5% 적립 · 우선 예약
          </div>
        </aside>
        {/* 오른쪽 폼 */}
        <div style={{ padding: '64px 56px' }}>
          <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${V.line}`, marginBottom: 36 }}>
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em',
                  color: tab === t ? V.ink : V.ink3,
                  textTransform: 'uppercase', background: 'none', border: 'none',
                  borderBottom: tab === t ? `1px solid ${V.ink}` : '1px solid transparent',
                  padding: '0 0 14px', marginBottom: -1, cursor: 'pointer',
                }}
              >{t === 'login' ? '로그인' : '회원가입'}</button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              {[
                { label: 'Email', type: 'email', defaultValue: '' },
                { label: 'Password', type: 'password', defaultValue: '' },
              ].map(f => (
                <div key={f.label} style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
                  <label style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>{f.label}</label>
                  <input
                    type={f.type}
                    style={{ fontFamily: V.serif, fontSize: 17, color: V.ink, background: 'transparent', border: 'none', borderBottom: `1px solid ${V.line}`, padding: '10px 0', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: V.sans, fontSize: 11, color: V.ink3, letterSpacing: '0.1em', marginBottom: 28 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> 자동 로그인
                </label>
                <Link href="/login" style={{ color: V.ink3, borderBottom: `1px solid ${V.ink3}`, textDecoration: 'none' }}>비밀번호 찾기</Link>
              </div>
              <Link href="/login" className="mute-btn" style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', textDecoration: 'none' }}>
                로그인 <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '32px 0 20px', color: V.ink3, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                <span style={{ flex: 1, height: 1, background: V.line }} />
                <span>or</span>
                <span style={{ flex: 1, height: 1, background: V.line }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {['Kakao', 'Naver', 'Apple'].map(s => (
                  <button
                    key={s}
                    style={{
                      padding: 14, border: `1px solid ${V.line}`, background: 'transparent',
                      fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: V.ink,
                      textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 200ms ease',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {[
                { label: 'Name · 성함', type: 'text' },
                { label: 'Email', type: 'email' },
                { label: 'Phone · 연락처', type: 'tel' },
                { label: 'Password', type: 'password' },
              ].map(f => (
                <div key={f.label} style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
                  <label style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>{f.label}</label>
                  <input
                    type={f.type}
                    style={{ fontFamily: V.serif, fontSize: 17, color: V.ink, background: 'transparent', border: 'none', borderBottom: `1px solid ${V.line}`, padding: '10px 0', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
                <input type="checkbox" /> 이용약관 및 개인정보 처리방침 동의
              </div>
              <Link href="/signup" className="mute-btn" style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', textDecoration: 'none' }}>
                가입하기 <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// PAGE ROOT
// ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [menus, setMenus] = useState<DbMenu[]>([])

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMenus(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="mute-body">
      <Nav onLogin={() => setShowLogin(true)} />
      <Hero />
      <Menu menus={menus} />
      <QuoteBand />
      <CalendarSection menus={menus} onNeedLogin={() => setShowLogin(true)} />
      <Trend />
      <Location />
      <Footer />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
