'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const V = {
  bg: '#E9E2D2', bgSoft: '#F2ECDD', ink: '#1A2A1C', ink2: '#2A3A2C',
  ink3: '#4A5A44', line: '#C9BFA6', lineSoft: '#D9CFB8',
  display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
  serifItalic: "var(--font-cormorant-italic,'Cormorant',serif)",
  sans: "var(--font-inter,'Inter',-apple-system,sans-serif)",
}

export default function SignupPage() {
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const allRequired = consentPrivacy && consentTerms

  async function handleGoogleSignup() {
    if (!allRequired) { setError('개인정보처리방침 및 이용약관에 동의해 주세요.'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  function handleToggleAll(checked: boolean) {
    setConsentPrivacy(checked)
    setConsentTerms(checked)
    setConsentMarketing(checked)
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{
        width: 'min(880px, 100%)', display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `1px solid ${V.lineSoft}`, background: V.bgSoft,
      }}>
        {/* 왼쪽 패널 */}
        <aside style={{
          background: V.ink, color: V.bgSoft, padding: '64px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <Link href="/" style={{ fontFamily: V.display, fontSize: 28, letterSpacing: '0.2em', color: V.bgSoft, textDecoration: 'none' }}>MUTE</Link>
            <div style={{ fontFamily: V.sans, fontSize: 9, letterSpacing: '0.4em', opacity: 0.5, textTransform: 'uppercase', marginTop: 4 }}>Eyelash · Est. 2023</div>
            <h2 style={{ fontFamily: V.display, fontSize: 52, lineHeight: 1, letterSpacing: '0.02em', margin: '40px 0 20px' }}>
              Join<br />us.
            </h2>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 1.7, color: 'rgba(242,236,221,0.8)', margin: 0 }}>
              &ldquo;한 사람을 위한,<br />단 하나의 디자인.&rdquo;
            </p>
          </div>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.45, textTransform: 'uppercase' }}>
            Member benefits · 시술 5% 적립 · 우선 예약
          </div>
        </aside>

        {/* 오른쪽 — 가입 */}
        <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', color: V.ink3, textTransform: 'uppercase', marginBottom: 8 }}>New Account</div>
          <h3 style={{ fontFamily: V.display, fontSize: 36, color: V.ink, margin: '0 0 12px', letterSpacing: '0.02em' }}>회원가입</h3>
          <p style={{ fontFamily: V.sans, fontSize: 13, color: V.ink3, margin: '0 0 32px', lineHeight: 1.6 }}>
            Google 계정으로 간편하게 가입하세요.
          </p>

          {error && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
              {error}
            </div>
          )}

          {/* 동의 섹션 */}
          <div style={{ paddingBottom: 24, borderBottom: `1px solid ${V.lineSoft}`, marginBottom: 28, display: 'grid', gap: 12 }}>

            {/* 전체 동의 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 0', borderBottom: `1px solid ${V.lineSoft}` }}>
              <input
                type="checkbox"
                checked={consentPrivacy && consentTerms && consentMarketing}
                onChange={e => handleToggleAll(e.target.checked)}
                style={{ accentColor: V.ink, width: 16, height: 16 }}
              />
              <span style={{ fontFamily: V.sans, fontSize: 12, color: V.ink, fontWeight: 600, letterSpacing: '0.05em' }}>
                전체 동의
              </span>
            </label>

            {/* 개인정보처리방침 */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={e => setConsentPrivacy(e.target.checked)}
                style={{ marginTop: 2, accentColor: V.ink, width: 14, height: 14 }}
              />
              <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, lineHeight: 1.6 }}>
                <span style={{ color: '#B42828', fontWeight: 600 }}>[필수] </span>
                <Link href="/privacy" target="_blank" style={{ color: V.ink2, borderBottom: `1px solid ${V.line}`, textDecoration: 'none' }}>
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </span>
            </label>

            {/* 이용약관 */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={e => setConsentTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: V.ink, width: 14, height: 14 }}
              />
              <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, lineHeight: 1.6 }}>
                <span style={{ color: '#B42828', fontWeight: 600 }}>[필수] </span>
                <Link href="/terms" target="_blank" style={{ color: V.ink2, borderBottom: `1px solid ${V.line}`, textDecoration: 'none' }}>
                  이용약관
                </Link>
                에 동의합니다.
              </span>
            </label>

            {/* 마케팅 동의 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={e => setConsentMarketing(e.target.checked)}
                style={{ accentColor: V.ink, width: 14, height: 14 }}
              />
              <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
                <span style={{ color: V.ink3, fontWeight: 500 }}>[선택] </span>
                마케팅 정보 수신에 동의합니다.
              </span>
            </label>
          </div>

          {/* Google 가입 버튼 */}
          <button onClick={handleGoogleSignup} disabled={loading || !allRequired} style={{
            width: '100%', padding: '16px', border: `1px solid ${allRequired ? V.ink : V.line}`,
            background: allRequired ? V.ink : 'transparent',
            fontFamily: V.sans, fontSize: 12, letterSpacing: '0.2em',
            color: allRequired ? V.bgSoft : V.ink3,
            textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            cursor: (loading || !allRequired) ? 'not-allowed' : 'pointer',
            opacity: !allRequired ? 0.45 : loading ? 0.6 : 1,
            transition: 'all 200ms ease',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill={allRequired ? '#4285F4' : '#888'}/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill={allRequired ? '#34A853' : '#888'}/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill={allRequired ? '#FBBC05' : '#888'}/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill={allRequired ? '#EA4335' : '#888'}/>
            </svg>
            {loading ? '처리 중...' : 'Google로 가입하기'}
          </button>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${V.lineSoft}`, display: 'flex', justifyContent: 'space-between', fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
            <Link href="/login" style={{ color: V.ink, borderBottom: `1px solid ${V.ink}`, textDecoration: 'none', letterSpacing: '0.1em', paddingBottom: 2 }}>로그인</Link>
            <Link href="/" style={{ color: V.ink3, textDecoration: 'none', letterSpacing: '0.1em' }}>← 홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
