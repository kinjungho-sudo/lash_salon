'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, CalendarDays, Users, MapPin, TrendingUp, Scissors, Settings, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/calendar', label: '예약 캘린더', icon: CalendarDays },
  { href: '/admin/customers', label: '고객 관리', icon: Users },
  { href: '/admin/map', label: '동네 지도', icon: MapPin },
  { href: '/admin/trends', label: '트렌드', icon: TrendingUp },
]

const settingItems = [
  { href: '/admin/menus', label: '시술 메뉴', icon: Scissors },
  { href: '/admin/settings', label: '설정', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col"
      style={{ width: 'var(--sidebar-width)', background: '#1C1C1C', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* 로고 */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/Logo.png" alt="MUTE" width={100} height={34} className="h-7 w-auto object-contain brightness-0 invert opacity-80" />
        <p className="text-[10px] tracking-[0.2em] uppercase mt-1.5" style={{ color: 'rgba(245,240,232,0.25)' }}>Admin Console</p>
      </div>

      {/* 메인 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 mt-1" style={{ color: 'rgba(245,240,232,0.2)' }}>메인</p>
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(href, exact)
                ? 'text-[#F5F0E8]'
                : 'hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.04)]'
            }`}
            style={isActive(href, exact) ? { background: 'rgba(45,74,62,0.5)', color: '#F5F0E8' } : { color: 'rgba(245,240,232,0.45)' }}>
            <Icon size={16} style={isActive(href, exact) ? { color: '#A8C5B8' } : { color: 'rgba(245,240,232,0.35)' }} />
            {label}
          </Link>
        ))}

        <p className="px-3 text-[10px] font-semibold tracking-[0.15em] uppercase mt-5 mb-2" style={{ color: 'rgba(245,240,232,0.2)' }}>관리</p>
        {settingItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all`}
            style={isActive(href) ? { background: 'rgba(45,74,62,0.5)', color: '#F5F0E8' } : { color: 'rgba(245,240,232,0.45)' }}>
            <Icon size={16} style={isActive(href) ? { color: '#A8C5B8' } : { color: 'rgba(245,240,232,0.35)' }} />
            {label}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-900/15"
          style={{ color: 'rgba(245,240,232,0.35)' }}>
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
