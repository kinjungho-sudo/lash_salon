'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const V = {
  bg: '#E9E2D2',
  bgSoft: '#F2ECDD',
  ink: '#1A2A1C',
  ink2: '#2A3A2C',
  ink3: '#4A5A44',
  line: '#C9BFA6',
  lineSoft: '#D9CFB8',
  display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
  serifItalic: "var(--font-cormorant-italic,'Cormorant',serif)",
  serif: "var(--font-cormorant,'Cormorant Garamond',serif)",
  sans: "var(--font-inter,'Inter',-apple-system,sans-serif)",
}

const REGION_SUGGESTIONS = [
  '서울시 강남구', '서울시 서초구', '서울시 마포구', '서울시 용산구',
  '서울시 은평구', '서울시 노원구', '서울시 송파구', '서울시 영등포구',
  '서울시 종로구', '서울시 성동구', '서울시 강동구', '서울시 강서구',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleName, setGoogleName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const gName = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? ''
      setGoogleName(gName)
      setName(gName)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleRegionChange(val: string) {
    setRegion(val)
    if (val.length >= 2) {
      setSuggestions(REGION_SUGGESTIONS.filter(s => s.includes(val)))
    } else {
      setSuggestions([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return }
    if (!region.trim()) { setError('사는 지역을 입력해 주세요.'); return }

    setSaving(true); setError(null)

    const res = await fetch('/api/customers/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), region: region.trim() }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? '저장에 실패했습니다.')
      setSaving(false)
      return
    }

    router.push('/customer')
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{
        width: '100%', maxWidth: 1000,
        display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)',
        background: V.bgSoft, border: `1px solid ${V.lineSoft}`,
        boxShadow: '0 24px 80px rgba(26,42,28,0.12)',
      }}>

        {/* 왼쪽 — 브랜드 패널 */}
        <aside style={{
          background: V.ink, color: V.bgSoft, padding: 'clamp(40px,6vw,72px) clamp(32px,4vw,56px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 480,
        }}>
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(242,236,221,0.55)', marginBottom: 8 }}>
              Welcome · MUTE
            </div>
            <div style={{ marginBottom: 24 }}>
              <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-80" />
            </div>
            <h2 style={{
              fontFamily: V.display,
              fontSize: 'clamp(36px,4vw,56px)',
              lineHeight: 1.05, letterSpacing: '0.02em',
              margin: '0 0 20px', color: V.bgSoft,
              whiteSpace: 'pre-line',
            }}>
              {googleName
                ? `반갑습니다,\n${googleName.split(' ')[0]}님.`
                : '처음\n오셨군요.'}
            </h2>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 1.65, color: 'rgba(242,236,221,0.72)', margin: 0 }}>
              &ldquo;한 사람을 위한,<br />단 하나의 디자인.&rdquo;
            </p>
          </div>
          <div>
            <div style={{ width: 40, height: 1, background: 'rgba(242,236,221,0.2)', margin: '0 0 16px' }} />
            <p style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: 'rgba(242,236,221,0.4)', textTransform: 'uppercase', lineHeight: 1.8 }}>
              멤버 혜택<br />
              시술 5% 적립 · 우선 예약
            </p>
          </div>
        </aside>

        {/* 오른쪽 — 정보 입력 */}
        <div style={{ padding: 'clamp(40px,6vw,72px) clamp(32px,5vw,64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* 헤더 */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: V.ink3, marginBottom: 10 }}>
              Step 1 / 1 · 회원 정보 입력
            </div>
            <h3 style={{ fontFamily: V.display, fontSize: 28, color: V.ink, margin: 0, letterSpacing: '0.04em' }}>
              간단한 정보만 알려주세요
            </h3>
            <p style={{ fontFamily: V.sans, fontSize: 12, color: V.ink3, margin: '10px 0 0', lineHeight: 1.6 }}>
              예약 확인 및 맞춤 서비스를 위해 사용됩니다.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* 이름 */}
            <div>
              <label style={{ display: 'block', fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', marginBottom: 10 }}>
                이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 김지은"
                style={{
                  width: '100%', fontFamily: V.serif, fontSize: 18, color: V.ink,
                  background: 'transparent', border: 'none', borderBottom: `1px solid ${V.line}`,
                  padding: '10px 0', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <p style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, margin: '8px 0 0', opacity: 0.6 }}>
                예약 시 표시되는 이름입니다.
              </p>
            </div>

            {/* 지역 */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase', marginBottom: 10 }}>
                사는 지역 *
              </label>
              <input
                type="text"
                value={region}
                onChange={e => handleRegionChange(e.target.value)}
                placeholder="예: 서울시 은평구"
                autoComplete="off"
                style={{
                  width: '100%', fontFamily: V.serif, fontSize: 18, color: V.ink,
                  background: 'transparent', border: 'none', borderBottom: `1px solid ${V.line}`,
                  padding: '10px 0', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <p style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, margin: '8px 0 0', opacity: 0.6 }}>
                구 단위까지 입력해 주세요. 통계용으로만 사용됩니다.
              </p>

              {/* 자동완성 드롭다운 */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: V.bgSoft, border: `1px solid ${V.line}`,
                  boxShadow: '0 8px 24px rgba(26,42,28,0.1)',
                  marginTop: 2,
                }}>
                  {suggestions.slice(0, 5).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setRegion(s); setSuggestions([]) }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '12px 16px',
                        fontFamily: V.sans, fontSize: 13, color: V.ink2,
                        background: 'transparent', border: 'none', borderBottom: `1px solid ${V.lineSoft}`,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Google 계정 표시 */}
            {googleName && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', background: 'rgba(26,42,28,0.04)',
                border: `1px solid ${V.lineSoft}`,
              }}>
                <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                <span style={{ fontFamily: V.sans, fontSize: 12, color: V.ink3 }}>
                  Google 계정으로 연결됨 · {googleName}
                </span>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={saving || !name.trim() || !region.trim()}
              style={{
                width: '100%', padding: '16px',
                border: `1px solid ${V.ink}`, background: V.ink,
                fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em', color: V.bgSoft,
                textTransform: 'uppercase', cursor: (saving || !name.trim() || !region.trim()) ? 'not-allowed' : 'pointer',
                opacity: (saving || !name.trim() || !region.trim()) ? 0.5 : 1,
                transition: 'all 200ms ease', marginTop: 4,
              }}
            >
              {saving ? '저장 중...' : '완료 — 시작하기'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
