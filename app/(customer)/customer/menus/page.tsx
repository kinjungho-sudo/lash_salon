import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CustomerMenusPage() {
  const supabase = createClient()

  const { data: ownerProfile } = await supabase
    .from('lash_salon_owner_profiles')
    .select('id')
    .limit(1)
    .single()

  const MENU_ORDER = ['클래식', '볼륨', '하이브리드']

  const rawMenus = ownerProfile ? (await supabase
    .from('lash_salon_menus')
    .select('*')
    .eq('owner_id', ownerProfile.id)
    .eq('is_active', true)).data : []

  const menus = (rawMenus ?? []).sort((a, b) => {
    const ai = MENU_ORDER.indexOf(a.name)
    const bi = MENU_ORDER.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">시술 메뉴</h1>

      {menus.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400">등록된 메뉴가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {menus.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color_tag ?? '#6b7280' }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400">약 {m.duration_min}분</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">{m.price.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      )}

      <Link href="/customer/booking" className="block w-full text-center text-sm font-medium text-white bg-gray-900 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
        예약 신청하기
      </Link>
    </div>
  )
}
