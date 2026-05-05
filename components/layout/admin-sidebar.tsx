'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, CalendarDays, Users, MapPin, TrendingUp, Scissors, Settings, LogOut, Menu, X } from 'lucide-react'

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

const allItems = [...navItems, ...settingItems]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* 로고 */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/Logo.png" alt="MUTE" width={100} height={34} className="h-7 w-auto object-contain brightness-0 invert opacity-80" />
        <p className="text-[10px] tracking-[0.2em] uppercase mt-1.5" style={{ color: 'rgba(245,240,232,0.25)' }}>Admin Console</p>
      </div>

      {/* 메인 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 mt-1" style={{ color: 'rgba(245,240,232,0.2)' }}>메인</p>
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={isActive(href, exact)
              ? { background: 'rgba(45,74,62,0.5)', color: '#F5F0E8' }
              : { color: 'rgba(245,240,232,0.45)' }}>
            <Icon size={16} style={isActive(href, exact) ? { color: '#A8C5B8' } : { color: 'rgba(245,240,232,0.35)' }} />
            {label}
          </Link>
        ))}

        <p className="px-3 text-[10px] font-semibold tracking-[0.15em] uppercase mt-5 mb-2" style={{ color: 'rgba(245,240,232,0.2)' }}>관리</p>
        {settingItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
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
    </>
  )

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen flex-col"
        style={{ width: 'var(--sidebar-width)', background: '#1C1C1C', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 40 }}>
        <SidebarContent />
      </aside>

      {/* 모바일 상단 헤더 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: '#1C1C1C', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-70" />
        <button onClick={() => setMobileOpen(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ color: 'rgba(245,240,232,0.6)' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <aside className="absolute left-0 top-0 h-full flex flex-col"
            style={{ width: '260px', background: '#1C1C1C', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 모바일 하단 탭바 (빠른 접근용) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{ background: '#1C1C1C', borderTop: '1px solid rgba(255,255,255,0.06)', height: '56px' }}>
        {allItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={isActive(href) ? { color: '#A8C5B8' } : { color: 'rgba(245,240,232,0.35)' }}>
            <Icon size={18} />
            <span className="text-[9px] font-medium">{label.replace(' 관리', '').replace('예약 ', '')}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
