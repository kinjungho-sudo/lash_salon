'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CustomerProfilePage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<{ id: string; start_at: string; status: string; menu: { name: string; color_tag: string | null } | null }[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data: customer } = await supabase
        .from('lash_salon_customers')
        .select('id, name, phone')
        .eq('user_id', user.id)
        .maybeSingle()

      if (customer) {
        setName(customer.name ?? '')
        setPhone(customer.phone ?? '')
        const { data: bks } = await supabase
          .from('lash_salon_bookings')
          .select('id, start_at, status, menu:lash_salon_menus(name, color_tag)')
          .eq('customer_id', customer.id)
          .order('start_at', { ascending: false })
          .limit(5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBookings((bks as any) ?? [])
      } else {
        setName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '')
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
      setError('저장에 실패했습니다.')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  const statusMap: Record<string, { label: string; cls: string }> = {
    confirmed: { label: '확정', cls: 'bg-green-50 text-green-700' },
    cancelled: { label: '취소', cls: 'bg-red-50 text-red-600' },
    no_show:   { label: '노쇼', cls: 'bg-yellow-50 text-yellow-700' },
  }

  if (loading) return <div className="py-20 text-center text-sm text-gray-400">로딩 중...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">내 정보</h1>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">저장되었습니다.</div>}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">이름 *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동"
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">연락처</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000"
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">이메일</label>
          <input type="email" value={email} disabled
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-10 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </form>

      {bookings.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">최근 예약 내역</p>
          <div className="space-y-2">
            {bookings.map(b => {
              const st = statusMap[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' }
              return (
                <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full" style={{ background: b.menu?.color_tag ?? '#6b7280' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{b.menu?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(b.start_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
