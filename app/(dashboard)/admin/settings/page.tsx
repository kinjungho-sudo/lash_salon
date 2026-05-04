'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { OwnerProfile } from '@/types'
import { CalendarCheck, Link2, Link2Off, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function SettingsContent() {
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  const errorParam = searchParams.get('error')

  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [savingName, setSavingName] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('lash_salon_owner_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) { setProfile(data); setShopName(data.shop_name ?? '') }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConnectCalendar() {
    setConnecting(true)
    const res = await fetch('/api/google-calendar')
    const { url } = await res.json()
    window.location.href = url
  }

  async function handleDisconnect() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('lash_salon_owner_profiles').update({
      gcal_access_token: null,
      gcal_refresh_token: null,
      gcal_token_expires_at: null,
      google_calendar_id: null,
    }).eq('id', user.id)
    setProfile(p => p ? { ...p, gcal_access_token: null, google_calendar_id: null } : p)
  }

  async function handleSaveName() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSavingName(true)
    await supabase.from('lash_salon_owner_profiles').update({ shop_name: shopName }).eq('id', user.id)
    setProfile(p => p ? { ...p, shop_name: shopName } : p)
    setSavingName(false)
  }

  const isCalendarConnected = !!(profile?.gcal_access_token && profile?.google_calendar_id)

  if (loading) return <div className="text-center py-20 text-[rgba(245,240,232,0.3)] text-sm">불러오는 중...</div>

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>설정</h1>
        <p className="text-sm text-[rgba(245,240,232,0.4)] mt-1">살롱 정보 및 캘린더 연동</p>
      </div>

      {/* 성공/에러 알림 */}
      {successParam === 'calendar_connected' && (
        <div className="mb-5 p-3 rounded-lg bg-green-900/20 border border-green-800/40 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={15} /> Google Calendar가 연결되었습니다.
        </div>
      )}
      {errorParam && (
        <div className="mb-5 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={15} /> 연결에 실패했습니다. 다시 시도해 주세요. ({errorParam})
        </div>
      )}

      {/* 살롱 이름 */}
      <div className="rounded-xl p-6 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-semibold text-[#F5F0E8] mb-4">살롱 정보</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">살롱 이름</label>
            <input value={shopName} onChange={e => setShopName(e.target.value)}
              placeholder="예: 라라 래쉬 스튜디오"
              className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSaveName} disabled={savingName}
              className="h-10 px-4 rounded-lg text-sm font-semibold btn-gold disabled:opacity-50">
              {savingName ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      {/* Google Calendar 연동 */}
      <div className="rounded-xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <CalendarCheck size={18} className="text-[#C9A961]" />
          <h2 className="text-sm font-semibold text-[#F5F0E8]">Google Calendar 연동</h2>
        </div>

        {isCalendarConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Link2 size={14} />
              <span>연결됨 — {profile?.google_calendar_id}</span>
            </div>
            <p className="text-xs text-[rgba(245,240,232,0.4)]">
              예약 시 사장님의 Google Calendar에 자동으로 일정이 추가됩니다.
            </p>
            <button onClick={handleDisconnect}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors">
              <Link2Off size={13} /> 연동 해제
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[rgba(245,240,232,0.5)]">
              Google Calendar를 연결하면 예약이 자동으로 캘린더에 등록되고,
              모바일 앱에서 알림을 받을 수 있습니다.
            </p>
            <ul className="text-xs text-[rgba(245,240,232,0.35)] space-y-1 list-disc pl-4">
              <li>이중 예약 자동 차단</li>
              <li>모바일 캘린더 앱 알림</li>
              <li>예약 취소 시 자동 삭제</li>
            </ul>
            <button onClick={handleConnectCalendar} disabled={connecting}
              className="h-10 px-5 rounded-lg text-sm font-semibold btn-gold flex items-center gap-2 disabled:opacity-50">
              {connecting ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
              {connecting ? '연결 중...' : 'Google Calendar 연결'}
            </button>
            <p className="text-xs text-[rgba(245,240,232,0.25)]">
              연결 시 calendar.events 권한이 요청됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[rgba(245,240,232,0.3)] text-sm">불러오는 중...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
