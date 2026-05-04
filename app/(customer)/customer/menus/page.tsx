import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CustomerMenusPage() {
  const supabase = createClient()

  // 관리자 프로필에서 활성 메뉴 조회
  const { data: ownerProfile } = await supabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .single()

  const { data: menus } = ownerProfile ? await supabase
    .from('lash_salon_menus')
    .select('*')
    .eq('owner_id', ownerProfile.id)
    .eq('is_active', true)
    .order('price') : { data: [] }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(28,28,28,0.4)' }}>MENU</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>시술 메뉴</h1>
      </div>

      {!menus || menus.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.06)' }}>
          <p className="text-sm" style={{ color: 'rgba(28,28,28,0.4)' }}>등록된 메뉴가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map(m => (
            <div key={m.id} className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: m.color_tag ?? '#2D4A3E' }} />
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-playfair,serif)', color: '#1C1C1C' }}>{m.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold" style={{ color: '#2D4A3E' }}>{m.price.toLocaleString()}원</p>
                  <p className="text-xs" style={{ color: 'rgba(28,28,28,0.4)' }}>약 {m.duration_min}분</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/customer/booking" className="w-full h-12 rounded-xl text-sm font-semibold btn-cream flex items-center justify-center">
          예약 신청하기
        </Link>
      </div>
    </div>
  )
}
