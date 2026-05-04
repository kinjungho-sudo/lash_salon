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

const fieldStyle: React.CSSProperties = {
  fontFamily: V.sans, fontSize: 16, color: V.ink,
  background: 'transparent', border: 'none',
  borderBottom: `1px solid ${V.line}`,
  padding: '10px 0', outline: 'none', width: '100%',
}
const labelStyle: React.CSSProperties = {
  fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em',
  color: V.ink3, textTransform: 'uppercase' as const, display: 'block', marginBottom: 6,
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleGoogleSignup() {
    if (!consentTerms) { setError('이용약관 및 개인정보 처리방침에 동의해 주세요.'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!consentTerms) { setError('이용약관 및 개인정보 처리방침에 동의해 주세요.'); return }
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return }
    setLoading(true); setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: { full_name: name.trim(), phone: phone.trim() },
      },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await fetch('/api/customer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim() || null,
          consent_terms_at: new Date().toISOString(),
          consent_marketing: consentMarketing,
        }),
      })
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontFamily: V.display, fontSize: 56, color: V.ink, letterSpacing: '0.04em', marginBottom: 16 }}>MUTE</div>
          <div style={{ width: 48, height: 1, background: V.line, margin: '0 auto 32px' }} />
          <h2 style={{ fontFamily: V.display, fontSize: 40, color: V.ink, margin: '0 0 16px', letterSpacing: '0.02em' }}>가입 완료</h2>
          <p style={{ fontFamily: V.sans, fontSize: 14, color: V.ink3, lineHeight: 1.8, marginBottom: 40 }}>
            이메일로 인증 링크를 발송했습니다.<br />확인 후 로그인해 주세요.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '16px 32px', background: V.ink, color: V.bgSoft,
            fontFamily: V.sans, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'all 200ms ease',
          }}>
            로그인으로 이동 <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    )
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

        {/* 오른쪽 — 폼 */}
        <div style={{ padding: '64px 56px', overflowY: 'auto' }}>
          <div style={{ fontFamily: V.sans, fontSize: 10, letterSpacing: '0.32em', color: V.ink3, textTransform: 'uppercase', marginBottom: 8 }}>New Account</div>
          <h3 style={{ fontFamily: V.display, fontSize: 36, color: V.ink, margin: '0 0 32px', letterSpacing: '0.02em' }}>회원가입</h3>

          {/* Google 가입 */}
          <button onClick={handleGoogleSignup} disabled={loading} style={{
            width: '100%', padding: '14px', border: `1px solid ${V.line}`, background: 'transparent',
            fontFamily: V.sans, fontSize: 11, letterSpacing: '0.2em', color: V.ink,
            textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: 'pointer', transition: 'all 200ms ease', marginBottom: 24,
          }}>
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 가입하기
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, fontFamily: V.sans, fontSize: 10, letterSpacing: '0.3em', color: V.ink3, textTransform: 'uppercase' }}>
            <span style={{ flex: 1, height: 1, background: V.line }} /><span>또는 이메일</span><span style={{ flex: 1, height: 1, background: V.line }} />
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.2)', fontFamily: V.sans, fontSize: 13, color: '#B42828' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 22 }}>
              <div>
                <label style={labelStyle}>이름 *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>연락처</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={fieldStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={fieldStyle} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="6자 이상" style={fieldStyle} />
            </div>

            {/* 동의 */}
            <div style={{ paddingTop: 20, borderTop: `1px solid ${V.lineSoft}`, marginBottom: 24, display: 'grid', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={consentTerms} onChange={e => setConsentTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: V.ink }} />
                <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3, lineHeight: 1.6 }}>
                  <span style={{ color: '#B42828', fontWeight: 600 }}>[필수] </span>
                  <Link href="/privacy" target="_blank" style={{ color: V.ink2, borderBottom: `1px solid ${V.line}`, textDecoration: 'none' }}>이용약관</Link>
                  {' 및 '}
                  <Link href="/privacy" target="_blank" style={{ color: V.ink2, borderBottom: `1px solid ${V.line}`, textDecoration: 'none' }}>개인정보처리방침</Link>
                  에 동의합니다.
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={consentMarketing} onChange={e => setConsentMarketing(e.target.checked)}
                  style={{ accentColor: V.ink }} />
                <span style={{ fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>[선택] 마케팅 정보 수신에 동의합니다.</span>
              </label>
            </div>

            <button type="submit" disabled={loading || !consentTerms} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '16px 28px', border: `1px solid ${V.ink}`,
              background: (loading || !consentTerms) ? 'transparent' : V.ink,
              color: (loading || !consentTerms) ? V.ink : V.bgSoft,
              fontFamily: V.sans, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase',
              cursor: (loading || !consentTerms) ? 'not-allowed' : 'pointer',
              opacity: !consentTerms ? 0.4 : 1, transition: 'all 200ms ease',
            }}>
              {loading ? '처리 중...' : '이메일로 가입'}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${V.lineSoft}`, display: 'flex', justifyContent: 'space-between', fontFamily: V.sans, fontSize: 11, color: V.ink3 }}>
            <Link href="/login" style={{ color: V.ink, borderBottom: `1px solid ${V.ink}`, textDecoration: 'none', letterSpacing: '0.1em', paddingBottom: 2 }}>로그인</Link>
            <Link href="/" style={{ color: V.ink3, textDecoration: 'none', letterSpacing: '0.1em' }}>← 홈으로</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
