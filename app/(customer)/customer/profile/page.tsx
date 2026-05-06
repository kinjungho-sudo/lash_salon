'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export default function CustomerProfilePage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 예약 내역
  const [bookings, setBookings] = useState<{ id: string; start_at: string; status: string; menu: { name: string; color_tag: string | null } | null }[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      // 고객 레코드
      const { data: customer } = await supabase
        .from('lash_salon_customers')
        .select('id, name, phone')
        .eq('user_id', user.id)
        .maybeSingle()

      if (customer) {
        setName(customer.name ?? '')
        setPhone(customer.phone ?? '')

        // 최근 예약 5건
        const { data: bks } = await supabase
          .from('lash_salon_bookings')
          .select('id, start_at, status, menu:lash_salon_menus(name, color_tag)')
          .eq('customer_id', customer.id)
          .order('start_at', { ascending: false })
          .limit(5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBookings((bks as any) ?? [])
      } else {
        const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
        setName(metaName)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return }
    setSaving(true); setError(null); setSuccess(false)

    const res = await fetch('/api/customer-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
    })

    if (!res.ok) {
      setError('저장에 실패했습니다. 다시 시도해 주세요.')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  function statusLabel(s: string) {
    if (s === 'confirmed') return { label: '확정', color: '#2D4A3E', bg: 'rgba(45,74,62,0.08)' }
    if (s === 'cancelled') return { label: '취소', color: '#DC2626', bg: 'rgba(220,38,38,0.07)' }
    return { label: '노쇼', color: '#D97706', bg: 'rgba(217,119,6,0.07)' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin" style={{ color: 'rgba(28,28,28,0.3)' }} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: '#2D4A3E' }}>MYPAGE</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>내 정보</h1>
      </div>

      {/* 프로필 수정 */}
      <form onSubmit={handleSave}>
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.07)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(28,28,28,0.4)' }}>
            기본 정보
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                style={{ color: 'rgba(28,28,28,0.5)' }}>이름 *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="홍길동"
                className="w-full h-11 px-4 rounded-xl text-sm input-light"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                style={{ color: 'rgba(28,28,28,0.5)' }}>연락처</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full h-11 px-4 rounded-xl text-sm input-light"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
                style={{ color: 'rgba(28,28,28,0.5)' }}>이메일</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-11 px-4 rounded-xl text-sm input-light opacity-50 cursor-not-allowed"
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(28,28,28,0.35)' }}>이메일은 변경할 수 없습니다.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-xl font-semibold text-sm btn-cream disabled:opacity-50 mt-5 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> 저장 중...</>
              : success
              ? <><Check size={15} /> 저장 완료</>
              : '저장하기'}
          </button>
        </div>
      </form>

      {/* 예약 내역 */}
      {bookings.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(28,28,28,0.4)' }}>
            최근 예약 내역
          </p>
          <div className="space-y-2">
            {bookings.map(b => {
              const st = statusLabel(b.status)
              return (
                <div key={b.id} className="rounded-2xl px-5 py-4 flex items-center gap-4"
                  style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.07)' }}>
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: b.menu?.color_tag ?? '#2D4A3E', minHeight: '36px' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{b.menu?.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(28,28,28,0.45)' }}>
                      {new Date(b.start_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
