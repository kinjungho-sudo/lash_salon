'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  TrendingUp,
  Scissors,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/calendar', label: '예약 캘린더', icon: CalendarDays },
  { href: '/customers', label: '고객 관리', icon: Users },
  { href: '/map', label: '동네 지도', icon: MapPin },
  { href: '/trends', label: '트렌드', icon: TrendingUp },
]

const adminItems = [
  { href: '/admin/menus', label: '시술 메뉴', icon: Scissors },
  { href: '/admin/settings', label: '설정', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: 'var(--sidebar-width)',
        background: '#0D0D0D',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* 브랜드 로고 */}
      <div className="px-6 py-7 border-b border-[rgba(255,255,255,0.06)]">
        <h1
          className="text-xl font-bold text-[#F5F0E8] tracking-tight"
          style={{ fontFamily: 'var(--font-playfair, serif)' }}
        >
          살롱 관리자
        </h1>
        <p className="text-[10px] text-[rgba(245,240,232,0.3)] tracking-widest uppercase mt-0.5">
          Admin Console
        </p>
      </div>

      {/* 메인 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold tracking-widest uppercase text-[rgba(245,240,232,0.25)] mb-2 mt-1">
          메인
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-[rgba(201,169,97,0.12)] text-[#C9A961]'
                : 'text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            <Icon
              size={16}
              className={isActive(href) ? 'text-[#C9A961]' : 'text-[rgba(245,240,232,0.4)]'}
            />
            {label}
          </Link>
        ))}

        <p className="px-3 text-[10px] font-semibold tracking-widest uppercase text-[rgba(245,240,232,0.25)] mt-5 mb-2">
          관리
        </p>
        {adminItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-[rgba(201,169,97,0.12)] text-[#C9A961]'
                : 'text-[rgba(245,240,232,0.5)] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            <Icon
              size={16}
              className={isActive(href) ? 'text-[#C9A961]' : 'text-[rgba(245,240,232,0.4)]'}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[rgba(245,240,232,0.4)] hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
