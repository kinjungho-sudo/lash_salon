'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const allRequired = consentPrivacy && consentTerms

  function handleToggleAll(checked: boolean) {
    setConsentPrivacy(checked)
    setConsentTerms(checked)
    setConsentMarketing(checked)
  }

  async function handleGoogleSignup() {
    if (!allRequired) { setError('이용약관 및 개인정보처리방침에 동의해 주세요.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
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
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* 동의 섹션 */}
          <div className="mb-6 space-y-3" style={{ borderBottom: '1px solid rgba(28,28,28,0.08)', paddingBottom: '20px' }}>
            {/* 전체 동의 */}
            <label className="flex items-center gap-3 cursor-pointer pb-3" style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
              <input
                type="checkbox"
                checked={consentPrivacy && consentTerms && consentMarketing}
                onChange={e => handleToggleAll(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#2D4A3E' }}
              />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#1C1C1C' }}>
                전체 동의
              </span>
            </label>

            {/* 개인정보처리방침 */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={e => setConsentPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded"
                style={{ accentColor: '#2D4A3E' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(28,28,28,0.6)' }}>
                <span className="font-semibold" style={{ color: '#DC2626' }}>[필수] </span>
                <Link href="/privacy" target="_blank" className="font-medium hover:underline" style={{ color: '#2D4A3E' }}>개인정보처리방침</Link>에 동의합니다.
              </span>
            </label>

            {/* 이용약관 */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={e => setConsentTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded"
                style={{ accentColor: '#2D4A3E' }}
              />
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(28,28,28,0.6)' }}>
                <span className="font-semibold" style={{ color: '#DC2626' }}>[필수] </span>
                <Link href="/terms" target="_blank" className="font-medium hover:underline" style={{ color: '#2D4A3E' }}>이용약관</Link>에 동의합니다.
              </span>
            </label>

            {/* 마케팅 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={e => setConsentMarketing(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#2D4A3E' }}
              />
              <span className="text-xs" style={{ color: 'rgba(28,28,28,0.45)' }}>
                [선택] 마케팅 정보 수신에 동의합니다.
              </span>
            </label>
          </div>

          {/* Google 가입 버튼 */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading || !allRequired}
            className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-40"
            style={{
              background: allRequired ? '#2D4A3E' : 'transparent',
              border: allRequired ? 'none' : '1.5px solid rgba(28,28,28,0.12)',
              color: allRequired ? '#FFFFFF' : 'rgba(28,28,28,0.4)',
              cursor: (loading || !allRequired) ? 'not-allowed' : 'pointer',
            }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill={allRequired ? '#fff' : '#888'}/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill={allRequired ? '#fff' : '#888'}/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill={allRequired ? '#fff' : '#888'}/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill={allRequired ? '#fff' : '#888'}/>
            </svg>
            {loading ? '처리 중...' : 'Google로 가입하기'}
          </button>

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
