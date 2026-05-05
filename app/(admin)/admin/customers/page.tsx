'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types'
import { Search, MapPin, Pencil, Trash2, X, Check, Loader2, UserCheck, User } from 'lucide-react'

type EditState = {
  phone: string
  memo: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ phone: '', memo: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function startEdit(c: Customer) {
    setEditingId(c.id)
    setEditForm({ phone: c.phone ?? '', memo: c.memo ?? '' })
  }

  async function handleSave(id: string) {
    setSaving(true)
    await supabase.from('lash_salon_customers').update({
      phone: editForm.phone || null,
      memo: editForm.memo || null,
    }).eq('id', id)
    setEditingId(null)
    await fetchCustomers()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('lash_salon_customers').delete().eq('id', id)
    setDeletingId(null)
    await fetchCustomers()
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search) ||
    (c.district ?? '').includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>
            고객 관리
          </h1>
          <p className="text-sm text-[rgba(245,240,232,0.4)] mt-1">
            총 {customers.length}명 · 예약 시 자동 등록됩니다
          </p>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(245,240,232,0.3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="이름·연락처·동네 검색"
          className="w-full h-10 pl-9 pr-4 rounded-lg text-sm input-luxury" />
      </div>

      {/* 고객 목록 */}
      {loading ? (
        <div className="text-center py-16 text-[rgba(245,240,232,0.3)] text-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[rgba(245,240,232,0.3)] text-sm">
            {search ? '검색 결과가 없습니다.' : '아직 등록된 고객이 없습니다.\n고객이 예약하면 자동으로 등록됩니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl px-5 py-4"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              {editingId === c.id ? (
                /* 편집 모드 */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {c.user_id ? <UserCheck size={14} className="text-[#A8C5B8]" /> : <User size={14} className="text-[rgba(245,240,232,0.3)]" />}
                      <p className="text-sm font-semibold text-[#F5F0E8]">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleSave(c.id)} disabled={saving}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8C5B8] hover:bg-[rgba(168,197,184,0.1)] transition-colors disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[rgba(245,240,232,0.4)] mb-1 uppercase tracking-wider">연락처</label>
                      <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="010-0000-0000" className="w-full h-9 px-3 rounded-lg text-sm input-luxury" />
                    </div>
                    <div>
                      <label className="block text-xs text-[rgba(245,240,232,0.4)] mb-1 uppercase tracking-wider">메모</label>
                      <input value={editForm.memo} onChange={e => setEditForm(f => ({ ...f, memo: e.target.value }))}
                        placeholder="특이사항 등" className="w-full h-9 px-3 rounded-lg text-sm input-luxury" />
                    </div>
                  </div>
                </div>
              ) : (
                /* 보기 모드 */
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {c.user_id ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(168,197,184,0.15)', color: '#A8C5B8' }}>앱 가입</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,232,0.3)' }}>수동</span>
                      )}
                      <p className="text-sm font-semibold text-[#F5F0E8]">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {c.phone && <span className="text-xs text-[rgba(245,240,232,0.45)]">{c.phone}</span>}
                      {c.district && (
                        <span className="text-xs text-[rgba(245,240,232,0.35)] flex items-center gap-1">
                          <MapPin size={10} /> {c.district}
                        </span>
                      )}
                      {c.memo && <span className="text-xs text-[rgba(245,240,232,0.3)] truncate max-w-[160px]">{c.memo}</span>}
                      {!c.phone && !c.district && !c.memo && (
                        <span className="text-xs text-[rgba(245,240,232,0.2)]">추가 정보 없음</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[rgba(245,240,232,0.2)] mt-0.5">
                      등록 {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(c)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-50">
                      {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
