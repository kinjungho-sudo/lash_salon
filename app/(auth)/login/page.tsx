'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const redirectTo = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'not_authorized' ? '접근 권한이 없습니다.' : null
  )

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''
    const dest = redirectTo ?? (adminEmail && data.user?.email === adminEmail ? '/admin' : '/customer')
    router.push(dest)
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) { setError('Google 로그인에 실패했습니다.'); setLoading(false) }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-10">
        <Link href="/">
          <Image src="/Logo.png" alt="MUTE EYELASH SALON" width={140} height={50} className="h-10 w-auto object-contain mx-auto mb-4" />
        </Link>
        <p className="text-sm tracking-[0.15em] uppercase" style={{ color: 'rgba(28,28,28,0.4)' }}>로그인</p>
      </div>

      <div className="rounded-2xl p-8" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)', boxShadow: '0 4px 32px rgba(28,28,28,0.06)' }}>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'rgba(28,28,28,0.5)' }}>이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
              className="w-full h-11 px-4 rounded-xl text-sm input-light" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'rgba(28,28,28,0.5)' }}>비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl text-sm input-light" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-sm btn-cream disabled:opacity-50 mt-2">
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(28,28,28,0.1)' }} />
          <span className="px-3 text-xs" style={{ color: 'rgba(28,28,28,0.35)' }}>또는</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(28,28,28,0.1)' }} />
        </div>

        <button onClick={handleGoogleLogin} disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 disabled:opacity-50"
          style={{ border: '1.5px solid rgba(28,28,28,0.12)', color: '#1C1C1C' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(28,28,28,0.4)' }}>
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium hover:underline" style={{ color: '#2D4A3E' }}>회원가입</Link>
        </p>
      </div>

      <p className="text-center text-xs mt-5" style={{ color: 'rgba(28,28,28,0.3)' }}>
        <Link href="/" className="hover:underline">← MUTE 홈으로</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FAFAF8' }}>
      <Suspense fallback={<div className="text-sm" style={{ color: 'rgba(28,28,28,0.4)' }}>로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
