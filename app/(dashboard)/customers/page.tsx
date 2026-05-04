'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types'
import { Plus, Search, MapPin, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'

type FormState = {
  name: string
  phone: string
  address: string
  memo: string
}

const EMPTY_FORM: FormState = { name: '', phone: '', address: '', memo: '' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number; district: string } | null>(null)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchCustomers() {
    const { data } = await supabase
      .from('lash_salon_customers')
      .select('*')
      .order('created_at', { ascending: false })
    setCustomers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCustomers() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGeocode() {
    if (!form.address) return
    setGeocoding(true); setGeocodeError(null); setGeocodeResult(null)
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: form.address }),
      })
      if (!res.ok) { setGeocodeError('주소를 찾을 수 없습니다. 더 구체적으로 입력해 주세요.'); return }
      const data = await res.json()
      setGeocodeResult(data)
    } catch {
      setGeocodeError('좌표 변환에 실패했습니다.')
    } finally {
      setGeocoding(false)
    }
  }

  async function handleSave() {
    if (!form.name) { setError('이름을 입력하세요.'); return }
    if (form.address && !geocodeResult) { setError('주소 좌표 변환을 먼저 해주세요. (검색 버튼 클릭)'); return }
    setSaving(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      owner_id: user.id,
      name: form.name,
      phone: form.phone || null,
      district: geocodeResult?.district ?? null,
      district_lat: geocodeResult?.lat ?? null,
      district_lng: geocodeResult?.lng ?? null,
      memo: form.memo || null,
    }

    if (editingId) {
      await supabase.from('lash_salon_customers').update(payload).eq('id', editingId)
    } else {
      await supabase.from('lash_salon_customers').insert(payload)
    }

    setForm(EMPTY_FORM); setGeocodeResult(null)
    setShowForm(false); setEditingId(null)
    await fetchCustomers(); setSaving(false)
  }

  function startEdit(c: Customer) {
    setForm({ name: c.name, phone: c.phone ?? '', address: c.district ?? '', memo: c.memo ?? '' })
    setGeocodeResult(c.district_lat ? { lat: c.district_lat, lng: c.district_lng!, district: c.district! } : null)
    setEditingId(c.id); setShowForm(true)
  }

  async function handleDelete(id: string) {
    await supabase.from('lash_salon_customers').delete().eq('id', id)
    await fetchCustomers()
  }

  const filtered = customers.filter(c =>
    c.name.includes(search) || (c.phone ?? '').includes(search) || (c.district ?? '').includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>
            고객 관리
          </h1>
          <p className="text-sm text-[rgba(245,240,232,0.4)] mt-1">총 {customers.length}명</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setGeocodeResult(null) }}
          className="h-9 px-4 rounded-lg text-sm font-semibold btn-gold flex items-center gap-2">
          <Plus size={15} /> 고객 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(245,240,232,0.3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="이름·연락처·동네 검색"
          className="w-full h-10 pl-9 pr-4 rounded-lg text-sm input-luxury" />
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#111', border: '1px solid rgba(201,169,97,0.25)' }}>
          <h2 className="text-sm font-semibold text-[#F5F0E8] mb-4">{editingId ? '고객 수정' : '새 고객'}</h2>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">이름 *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="홍길동" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">연락처</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="010-0000-0000" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">거주 주소 (동 단위 입력)</label>
              <div className="flex gap-2">
                <input value={form.address} onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setGeocodeResult(null) }}
                  placeholder="예: 서울 강남구 역삼동" className="flex-1 h-10 px-3 rounded-lg text-sm input-luxury"
                  onKeyDown={e => e.key === 'Enter' && handleGeocode()} />
                <button onClick={handleGeocode} disabled={geocoding || !form.address}
                  className="h-10 px-3 rounded-lg text-sm border border-[rgba(201,169,97,0.3)] text-[#C9A961] hover:bg-[rgba(201,169,97,0.08)] transition-colors flex items-center gap-1.5 disabled:opacity-40">
                  {geocoding ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                  {geocoding ? '검색 중' : '좌표 검색'}
                </button>
              </div>
              {geocodeError && <p className="text-red-400 text-xs mt-1.5">{geocodeError}</p>}
              {geocodeResult && (
                <p className="text-[#C9A961] text-xs mt-1.5 flex items-center gap-1">
                  <Check size={12} /> {geocodeResult.district} ({geocodeResult.lat.toFixed(4)}, {geocodeResult.lng.toFixed(4)})
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">메모</label>
              <input value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="특이사항 등" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); setEditingId(null) }}
              className="h-9 px-4 rounded-lg text-sm text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8] transition-colors flex items-center gap-1">
              <X size={14} /> 취소
            </button>
            <button onClick={handleSave} disabled={saving}
              className="h-9 px-4 rounded-lg text-sm font-semibold btn-gold flex items-center gap-1 disabled:opacity-50">
              <Check size={14} /> {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* 고객 목록 */}
      {loading ? (
        <div className="text-center py-16 text-[rgba(245,240,232,0.3)] text-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[rgba(245,240,232,0.3)] text-sm">{search ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F5F0E8]">{c.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {c.phone && <span className="text-xs text-[rgba(245,240,232,0.4)]">{c.phone}</span>}
                  {c.district && (
                    <span className="text-xs text-[rgba(245,240,232,0.4)] flex items-center gap-1">
                      <MapPin size={10} /> {c.district}
                    </span>
                  )}
                </div>
                {c.memo && <p className="text-xs text-[rgba(245,240,232,0.3)] mt-0.5 truncate">{c.memo}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(c)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:text-red-400 hover:bg-red-900/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
