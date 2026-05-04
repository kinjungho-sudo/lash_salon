'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'not_authorized' ? '이 계정은 살롱 관리자로 등록되어 있지 않습니다.' : null
  )

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      setError('Google 로그인에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* 로고 */}
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

      {/* 카드 */}
      <div
        className="rounded-xl p-8"
        style={{
          background: '#111111',
          border: '1px solid rgba(201,169,97,0.25)',
        }}
      >
        <h2 className="text-lg font-semibold text-[#F5F0E8] mb-6">로그인</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[rgba(245,240,232,0.5)] mb-1.5 tracking-wider uppercase">
              이메일
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
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-lg text-sm text-[#F5F0E8] placeholder-[rgba(245,240,232,0.25)] input-luxury"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg font-semibold text-sm tracking-wide btn-gold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          <span className="px-3 text-xs text-[rgba(245,240,232,0.3)]">또는</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-11 rounded-lg border text-sm font-medium text-[#F5F0E8] flex items-center justify-center gap-3 transition-colors hover:bg-white/5 disabled:opacity-50"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 로그인
        </button>

        <p className="text-center text-xs text-[rgba(245,240,232,0.3)] mt-6">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-[#C9A961] hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <Suspense fallback={<div className="text-[rgba(245,240,232,0.3)] text-sm">로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
