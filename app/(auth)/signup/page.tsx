'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleGoogleSignup() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!consentTerms) { setError('이용약관 및 개인정보 처리방침에 동의해 주세요.'); return }
    setLoading(true); setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('lash_salon_owner_profiles').insert({
        id: data.user.id,
        consent_terms_at: new Date().toISOString(),
        consent_marketing: consentMarketing,
      })
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAFAF8' }}>
        <div className="w-full max-w-[380px] text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(45,74,62,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2D4A3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>가입 완료</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(28,28,28,0.55)' }}>이메일로 인증 링크를 발송했습니다.<br />이메일 확인 후 로그인해 주세요.</p>
          <Link href="/login" className="inline-flex items-center h-11 px-8 rounded-xl text-sm font-semibold btn-cream">
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FAFAF8' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <Link href="/">
            <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={140} height={50} className="h-10 w-auto object-contain mx-auto mb-4" />
          </Link>
          <p className="text-sm tracking-[0.15em] uppercase" style={{ color: 'rgba(28,28,28,0.4)' }}>회원가입</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)', boxShadow: '0 4px 32px rgba(28,28,28,0.06)' }}>
          {/* Google 가입 (우선) */}
          <button onClick={handleGoogleSignup} disabled={loading || !consentTerms}
            className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 disabled:opacity-40 mb-5"
            style={{ border: '1.5px solid rgba(28,28,28,0.12)', color: '#1C1C1C' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 가입하기
          </button>

          <div className="flex items-center mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(28,28,28,0.1)' }} />
            <span className="px-3 text-xs" style={{ color: 'rgba(28,28,28,0.35)' }}>또는 이메일</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(28,28,28,0.1)' }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'rgba(28,28,28,0.5)' }}>이메일 <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
                className="w-full h-11 px-4 rounded-xl text-sm input-light" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'rgba(28,28,28,0.5)' }}>비밀번호 <span className="text-red-500">*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="6자 이상"
                className="w-full h-11 px-4 rounded-xl text-sm input-light" />
            </div>

            {/* PIPA 동의 */}
            <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(28,28,28,0.08)' }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentTerms} onChange={e => setConsentTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: '#2D4A3E' }} />
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(28,28,28,0.6)' }}>
                  <span className="font-semibold" style={{ color: '#DC2626' }}>[필수] </span>
                  <Link href="/privacy" className="font-medium hover:underline" style={{ color: '#2D4A3E' }} target="_blank">이용약관</Link>
                  {' 및 '}
                  <Link href="/privacy" className="font-medium hover:underline" style={{ color: '#2D4A3E' }} target="_blank">개인정보처리방침</Link>에 동의합니다.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentMarketing} onChange={e => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: '#2D4A3E' }} />
                <span className="text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>[선택] 마케팅 정보 수신에 동의합니다.</span>
              </label>
            </div>

            <button type="submit" disabled={loading || !consentTerms}
              className="w-full h-11 rounded-xl font-semibold text-sm btn-cream disabled:opacity-40 mt-2">
              {loading ? '처리 중...' : '이메일로 가입'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(28,28,28,0.4)' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#2D4A3E' }}>로그인</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(28,28,28,0.3)' }}>
          <Link href="/" className="hover:underline">← MUTE 홈으로</Link>
        </p>
      </div>
    </div>
  )
}
