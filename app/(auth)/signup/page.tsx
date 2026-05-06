'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">회원가입</h1>
        <p className="text-sm text-gray-500 mb-6">처음 오셨나요? 약관 동의 후 Google 계정으로 가입하세요.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {/* 전체 동의 */}
          <label className="flex items-center gap-2 cursor-pointer pb-3 border-b border-gray-100">
            <input
              type="checkbox"
              checked={consentPrivacy && consentTerms && consentMarketing}
              onChange={e => handleToggleAll(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-gray-800">전체 동의</span>
          </label>

          {/* 이용약관 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={consentTerms} onChange={e => setConsentTerms(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-700"><span className="text-red-500 font-medium">[필수]</span> 이용약관 동의</span>
            </label>
            <Link href="/terms" target="_blank" className="text-xs text-gray-400 hover:text-gray-600 underline ml-2">보기</Link>
          </div>

          {/* 개인정보처리방침 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={consentPrivacy} onChange={e => setConsentPrivacy(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-700"><span className="text-red-500 font-medium">[필수]</span> 개인정보처리방침 동의</span>
            </label>
            <Link href="/privacy" target="_blank" className="text-xs text-gray-400 hover:text-gray-600 underline ml-2">보기</Link>
          </div>

          {/* 마케팅 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={consentMarketing} onChange={e => setConsentMarketing(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-gray-500">[선택] 마케팅 수신 동의</span>
          </label>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading || !allRequired}
          className="w-full flex items-center justify-center gap-3 h-11 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill={allRequired ? '#4285F4' : '#aaa'}/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill={allRequired ? '#34A853' : '#aaa'}/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill={allRequired ? '#FBBC05' : '#aaa'}/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill={allRequired ? '#EA4335' : '#aaa'}/>
          </svg>
          {loading ? '처리 중...' : 'Google로 회원가입'}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          이미 회원이신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">로그인</Link>
        </p>
      </div>
    </div>
  )
}
