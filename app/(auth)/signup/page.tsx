'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [shopName, setShopName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!consentTerms) {
      setError('이용약관 및 개인정보 처리방침에 동의해 주세요.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // lash_salon_owner_profiles 생성
      const { error: profileError } = await supabase
        .from('lash_salon_owner_profiles')
        .insert({
          id: data.user.id,
          shop_name: shopName || null,
          consent_terms_at: new Date().toISOString(),
          consent_marketing: consentMarketing,
        })

      if (profileError) {
        setError('프로필 생성에 실패했습니다. 다시 시도해 주세요.')
        setLoading(false)
        return
      }

      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="w-full max-w-[400px] text-center">
          <div className="text-[#C9A961] text-5xl mb-6">✓</div>
          <h2 className="text-xl font-semibold text-[#F5F0E8] mb-3">가입 완료</h2>
          <p className="text-sm text-[rgba(245,240,232,0.5)] mb-6">
            이메일로 인증 링크를 발송했습니다.<br />
            이메일을 확인한 후 로그인해 주세요.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg btn-gold text-sm font-semibold"
          >
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight text-[#F5F0E8] mb-1"
            style={{ fontFamily: 'var(--font-playfair, serif)' }}
          >
            살롱 관리자
          </h1>
          <p className="text-sm text-[rgba(245,240,232,0.4)] tracking-widest uppercase">
            Lash Studio Admin
          </p>
        </div>

        <div
          className="rounded-xl p-8"
          style={{ background: '#111111', border: '1px solid rgba(201,169,97,0.25)' }}
        >
          <h2 className="text-lg font-semibold text-[#F5F0E8] mb-6">회원가입</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[rgba(245,240,232,0.5)] mb-1.5 tracking-wider uppercase">
                살롱 이름 <span className="text-[rgba(245,240,232,0.3)] normal-case">(선택)</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="예: 라라 래쉬 스튜디오"
                className="w-full h-11 px-4 rounded-lg text-sm text-[#F5F0E8] placeholder-[rgba(245,240,232,0.25)] input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(245,240,232,0.5)] mb-1.5 tracking-wider uppercase">
                이메일 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full h-11 px-4 rounded-lg text-sm text-[#F5F0E8] placeholder-[rgba(245,240,232,0.25)] input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgba(245,240,232,0.5)] mb-1.5 tracking-wider uppercase">
                비밀번호 <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="6자 이상"
                className="w-full h-11 px-4 rounded-lg text-sm text-[#F5F0E8] placeholder-[rgba(245,240,232,0.25)] input-luxury"
              />
            </div>

            {/* PIPA 동의 */}
            <div className="pt-2 space-y-3 border-t border-[rgba(255,255,255,0.08)]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={e => setConsentTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#C9A961]"
                />
                <span className="text-xs text-[rgba(245,240,232,0.6)] leading-relaxed">
                  <span className="text-red-400 font-medium">[필수] </span>
                  <Link href="/privacy" className="text-[#C9A961] hover:underline" target="_blank">
                    이용약관
                  </Link>
                  {' 및 '}
                  <Link href="/privacy" className="text-[#C9A961] hover:underline" target="_blank">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={e => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#C9A961]"
                />
                <span className="text-xs text-[rgba(245,240,232,0.4)]">
                  [선택] 마케팅 정보 수신에 동의합니다.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !consentTerms}
              className="w-full h-11 rounded-lg font-semibold text-sm tracking-wide btn-gold disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '처리 중...' : '가입하기'}
            </button>
          </form>

          <p className="text-center text-xs text-[rgba(245,240,232,0.3)] mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#C9A961] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
