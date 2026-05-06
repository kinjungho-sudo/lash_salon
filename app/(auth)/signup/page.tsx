'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const V = {
  bg: '#E9E2D2', bgSoft: '#F2ECDD', ink: '#2A3A2C', ink2: '#3F4F3A',
  ink3: '#6B7363', line: '#C9BFA6', lineSoft: '#D9CFB8',
  display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
  serifItalic: "var(--font-cormorant-italic,'Cormorant',serif)",
  serif: "var(--font-cormorant,'Cormorant Garamond',serif)",
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
    if (!allRequired) { setError('약관에 동의해주세요.'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?from=signup&marketing=' + consentMarketing },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  function handleToggleAll(checked: boolean) {
    setConsentPrivacy(checked); setConsentTerms(checked); setConsentMarketing(checked)
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{
        width: 'min(960px, 100%)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: V.bgSoft, border: `1px solid ${V.lineSoft}`,
        boxShadow: '0 24px 80px rgba(42,58,44,0.12)',
      }}>
        {/* 왼쪽 — 브랜드 패널 */}
        <aside style={{
          background: V.ink, color: V.bgSoft, padding: '64px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(242,236,221,0.6)', marginBottom: 4 }}>Members · MUTE</div>
            <Link href="/" style={{ fontFamily: V.display, fontSize: 32, letterSpacing: '0.15em', color: V.bgSoft, textDecoration: 'none', display: 'block', marginTop: 8 }}>MUTE</Link>
            <h2 style={{ fontFamily: V.display, fontSize: 56, lineHeight: 1, letterSpacing: '0.02em', margin: '24px 0 18px', color: V.bgSoft }}>
              Join<br />us.
            </h2>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 1.6, color: 'rgba(242,236,221,0.75)', margin: 0 }}>
              &ldquo;한 사람을 위한,<br />단 하나의 디자인.&rdquo;
            </p>
          </div>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(242,236,221,0.5)', textTransform: 'uppercase' }}>
            Member benefits · 시술 5% 적립 · 우선 예약
          </div>
        </aside>

        {/* 오른쪽 — 회원가입 */}
        <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* 탭 */}
          <div style={{ display: 'flex', gap: 32, borderBottom: `1px solid ${V.line}`, marginBottom: 36 }}>
            <Link href="/login" style={{
              fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink3,
              textTransform: 'uppercase', paddingBottom: 14, textDecoration: 'none',
            }}>로그인</Link>
            <span style={{
              fontFamily: V.sans, fontSize: 11, letterSpacing: '0.3em', color: V.ink,
              textTransform: 'uppercase', paddingBottom: 14, borderBottom: `1px solid ${V.ink}`, marginBottom: -1,
            }}>회원가입</span>
          </div>

          <p style={{ fontFamily: V.serif, fontSize: 16, color: V.ink3, margin: '0 0 28px', lineHeight: 1.6 }}>
            처음 오셨나요? 약관 동의 후 Google 계정으로 가입하세요.
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
              {error}
            </div>
          )}

          {/* 동의 섹션 */}
          <div style={{ marginBottom: 28, display: 'grid', gap: 16 }}>
            {/* 전체 동의 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', paddingBottom: 16, borderBottom: `1px solid ${V.lineSoft}` }}>
              <input
                type="checkbox"
                checked={consentPrivacy && consentTerms && consentMarketing}
                onChange={e => handleToggleAll(e.target.checked)}
                style={{ accentColor: V.ink, width: 15, height: 15 }}
              />
              <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                전체 동의
              </span>
            </label>

            {/* 이용약관 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox" checked={consentTerms}
                  onChange={e => setConsentTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: V.ink, width: 14, height: 14 }}
                />
                <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, lineHeight: 1.6, letterSpacing: '0.05em' }}>
                  <span style={{ color: '#B42828', fontWeight: 600 }}>[필수] </span>이용약관 동의
                </span>
              </label>
              <Link href="/terms" target="_blank" style={{ fontFamily: V.sans, fontSize: 10, color: V.ink3, borderBottom: `1px solid ${V.line}`, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', paddingBottom: 1 }}>
                전체 보기
              </Link>
            </div>

            {/* 개인정보처리방침 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox" checked={consentPrivacy}
                  onChange={e => setConsentPrivacy(e.target.checked)}
                  style={{ marginTop: 2, accentColor: V.ink, width: 14, height: 14 }}
                />
                <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, lineHeight: 1.6, letterSpacing: '0.05em' }}>
                  <span style={{ color: '#B42828', fontWeight: 600 }}>[필수] </span>개인정보처리방침 동의
                </span>
              </label>
              <Link href="/privacy" target="_blank" style={{ fontFamily: V.sans, fontSize: 10, color: V.ink3, borderBottom: `1px solid ${V.line}`, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', paddingBottom: 1 }}>
                전체 보기
              </Link>
            </div>

            {/* 마케팅 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox" checked={consentMarketing}
                  onChange={e => setConsentMarketing(e.target.checked)}
                  style={{ accentColor: V.ink, width: 14, height: 14 }}
                />
                <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, letterSpacing: '0.05em' }}>
                  <span style={{ fontWeight: 500 }}>[선택] </span>마케팅 수신 동의
                </span>
              </label>
              <Link href="#" style={{ fontFamily: V.sans, fontSize: 10, color: V.ink3, borderBottom: `1px solid ${V.line}`, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', paddingBottom: 1 }}>
                전체 보기
              </Link>
            </div>
          </div>

          {/* Google 가입 버튼 */}
          <button onClick={handleGoogleSignup} disabled={loading || !allRequired} style={{
            width: '100%', padding: '16px', border: `1px solid ${allRequired ? V.ink : V.lineSoft}`,
            background: allRequired ? V.ink : 'transparent',
            fontFamily: V.sans, fontSize: 10, letterSpacing: '0.25em',
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
            {loading ? '처리 중...' : 'Google로 회원가입'}
          </button>

          {!allRequired && (
            <p style={{ marginTop: 10, fontFamily: V.sans, fontSize: 11, color: '#B42828', textAlign: 'center' }}>
              약관에 동의해주세요.
            </p>
          )}

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${V.lineSoft}`, display: 'flex', justifyContent: 'space-between', fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
            <Link href="/login" style={{ color: V.ink, borderBottom: `1px solid ${V.ink}`, textDecoration: 'none', letterSpacing: '0.1em', paddingBottom: 2 }}>이미 회원이신가요? 로그인</Link>
            <Link href="/" style={{ color: V.ink3, textDecoration: 'none', letterSpacing: '0.1em' }}>← 홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
