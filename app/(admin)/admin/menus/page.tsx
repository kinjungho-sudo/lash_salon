'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Menu } from '@/types'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

const COLOR_OPTIONS = [
  { label: '골드', value: '#C9A961' },
  { label: '로즈', value: '#E8A4A4' },
  { label: '모브', value: '#C4A0C8' },
  { label: '민트', value: '#8BBCB8' },
]

const DEFAULT_MENUS = [
  { name: '클래식', price: 60000, duration_min: 120, color_tag: '#C9A961' },
  { name: '볼륨', price: 80000, duration_min: 120, color_tag: '#E8A4A4' },
  { name: '하이브리드', price: 70000, duration_min: 120, color_tag: '#C4A0C8' },
]

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', price: '', duration_min: '120', color_tag: '#C9A961' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchMenus() {
    const { data } = await supabase
      .from('lash_salon_menus')
      .select('*')
      .order('created_at')
    setMenus(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMenus() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function seedDefaultMenus() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    for (const m of DEFAULT_MENUS) {
      await supabase.from('lash_salon_menus').upsert(
        { ...m, owner_id: user.id, is_active: true },
        { onConflict: 'owner_id,name' }
      )
    }
    await fetchMenus()
    setSaving(false)
  }

  async function handleSave() {
    if (!form.name || !form.price) { setError('이름과 가격을 입력하세요.'); return }
    setSaving(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      owner_id: user.id,
      name: form.name,
      price: parseInt(form.price),
      duration_min: parseInt(form.duration_min),
      color_tag: form.color_tag,
      is_active: true,
    }

    if (editingId) {
      await supabase.from('lash_salon_menus').update(payload).eq('id', editingId)
    } else {
      await supabase.from('lash_salon_menus').insert(payload)
    }

    setForm({ name: '', price: '', duration_min: '120', color_tag: '#C9A961' })
    setShowForm(false); setEditingId(null)
    await fetchMenus(); setSaving(false)
  }

  function startEdit(menu: Menu) {
    setForm({ name: menu.name, price: String(menu.price), duration_min: String(menu.duration_min), color_tag: menu.color_tag ?? '#C9A961' })
    setEditingId(menu.id); setShowForm(true)
  }

  async function toggleActive(menu: Menu) {
    await supabase.from('lash_salon_menus').update({ is_active: !menu.is_active }).eq('id', menu.id)
    await fetchMenus()
  }

  async function handleDelete(id: string) {
    await supabase.from('lash_salon_menus').delete().eq('id', id)
    await fetchMenus()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>
            시술 메뉴
          </h1>
          <p className="text-sm text-[rgba(245,240,232,0.4)] mt-1">가격·소요시간 관리</p>
        </div>
        <div className="flex gap-2">
          {menus.length === 0 && (
            <button onClick={seedDefaultMenus} disabled={saving}
              className="h-9 px-4 rounded-lg text-sm font-medium border border-[rgba(201,169,97,0.3)] text-[#C9A961] hover:bg-[rgba(201,169,97,0.08)] transition-colors">
              기본 메뉴 추가
            </button>
          )}
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', price: '', duration_min: '120', color_tag: '#C9A961' }) }}
            className="h-9 px-4 rounded-lg text-sm font-semibold btn-gold flex items-center gap-2">
            <Plus size={15} /> 메뉴 추가
          </button>
        </div>
      </div>

      {/* 폼 */}
      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#111', border: '1px solid rgba(201,169,97,0.25)' }}>
          <h2 className="text-sm font-semibold text-[#F5F0E8] mb-4">{editingId ? '메뉴 수정' : '새 메뉴'}</h2>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">메뉴 이름 *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="예: 클래식" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">가격 (원) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="60000" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">소요시간 (분)</label>
              <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                placeholder="120" className="w-full h-10 px-3 rounded-lg text-sm input-luxury" />
            </div>
            <div>
              <label className="block text-xs text-[rgba(245,240,232,0.5)] mb-1.5 uppercase tracking-wider">색상</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button key={c.value} onClick={() => setForm(f => ({ ...f, color_tag: c.value }))}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{ background: c.value, borderColor: form.color_tag === c.value ? '#fff' : 'transparent' }}>
                    {form.color_tag === c.value && <Check size={12} className="text-black" />}
                  </button>
                ))}
              </div>
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

      {/* 메뉴 목록 */}
      {loading ? (
        <div className="text-center py-16 text-[rgba(245,240,232,0.3)] text-sm">불러오는 중...</div>
      ) : menus.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[rgba(245,240,232,0.3)] text-sm">등록된 메뉴가 없습니다.</p>
          <p className="text-[rgba(245,240,232,0.2)] text-xs mt-1">위의 &ldquo;기본 메뉴 추가&rdquo;로 클래식·볼륨·하이브리드를 바로 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map(menu => (
            <div key={menu.id} className="rounded-xl px-5 py-4 flex items-center gap-4"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', opacity: menu.is_active ? 1 : 0.5 }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: menu.color_tag ?? '#C9A961' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0E8]">{menu.name}</p>
                <p className="text-xs text-[rgba(245,240,232,0.4)] mt-0.5">
                  {menu.price.toLocaleString()}원 · {menu.duration_min}분
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(menu)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${menu.is_active ? 'bg-[rgba(201,169,97,0.12)] text-[#C9A961]' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(245,240,232,0.4)]'}`}>
                  {menu.is_active ? '활성' : '비활성'}
                </button>
                <button onClick={() => startEdit(menu)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(245,240,232,0.4)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(menu.id)}
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
