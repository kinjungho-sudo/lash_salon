'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const V = {
  bg: '#E9E2D2', bgSoft: '#F2ECDD', ink: '#1A2A1C', ink2: '#2A3A2C',
  ink3: '#4A5A44', line: '#C9BFA6', lineSoft: '#D9CFB8',
  display: "var(--font-italiana,'Italiana','Cormorant Garamond',serif)",
  serifItalic: "var(--font-cormorant-italic,'Cormorant',serif)",
  sans: "var(--font-inter,'Inter',-apple-system,sans-serif)",
}

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'not_authorized' ? '접근 권한이 없습니다.' : null
  )
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{
        width: 'min(880px, 100%)', display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `1px solid ${V.lineSoft}`, background: V.bgSoft,
      }}>
        {/* 왼쪽 — 브랜드 패널 */}
        <aside style={{
          background: V.ink, color: V.bgSoft, padding: '64px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <Link href="/" style={{ fontFamily: V.display, fontSize: 28, letterSpacing: '0.2em', color: V.bgSoft, textDecoration: 'none' }}>MUTE</Link>
            <div style={{ fontFamily: V.sans, fontSize: 9, letterSpacing: '0.4em', opacity: 0.5, textTransform: 'uppercase', marginTop: 4 }}>Eyelash · Est. 2023</div>
            <h2 style={{ fontFamily: V.display, fontSize: 52, lineHeight: 1, letterSpacing: '0.02em', margin: '40px 0 20px' }}>
              Welcome<br />back.
            </h2>
            <p style={{ fontFamily: V.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 1.7, color: 'rgba(242,236,221,0.8)', margin: 0 }}>
              &ldquo;한 사람의 시선을 기억하는 일,<br />그것이 우리의 시작입니다.&rdquo;
            </p>
          </div>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', opacity: 0.45, textTransform: 'uppercase' }}>
            Member benefits · 시술 5% 적립 · 우선 예약
          </div>
        </aside>

        {/* 오른쪽 — 로그인 */}
        <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', color: V.ink3, textTransform: 'uppercase', marginBottom: 8 }}>Account</div>
          <h3 style={{ fontFamily: V.display, fontSize: 36, color: V.ink, margin: '0 0 12px', letterSpacing: '0.02em' }}>로그인</h3>
          <p style={{ fontFamily: V.sans, fontSize: 13, color: V.ink3, margin: '0 0 36px', lineHeight: 1.6 }}>
            Google 계정으로 간편하게 로그인하세요.
          </p>

          {error && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
              {error}
            </div>
          )}

          <button onClick={handleGoogleLogin} disabled={loading} style={{
            width: '100%', padding: '16px', border: `1px solid ${V.ink}`, background: V.ink,
            fontFamily: V.sans, fontSize: 12, letterSpacing: '0.2em', color: V.bgSoft,
            textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 200ms ease',
            opacity: loading ? 0.6 : 1,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button>

          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${V.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
            <Link href="/signup" style={{ color: V.ink, borderBottom: `1px solid ${V.ink}`, textDecoration: 'none', letterSpacing: '0.1em', paddingBottom: 2 }}>
              회원가입
            </Link>
            <Link href="/" style={{ color: V.ink3, textDecoration: 'none', letterSpacing: '0.1em' }}>
              ← 홈으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#E9E2D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "var(--font-inter,'Inter',sans-serif)", fontSize: 12, letterSpacing: '0.3em', color: '#4A5A44', textTransform: 'uppercase' }}>Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
