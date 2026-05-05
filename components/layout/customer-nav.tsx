'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

export default function CustomerNav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const name = data.user.user_metadata?.full_name?.split(' ')[0]
        ?? data.user.user_metadata?.name?.split(' ')[0]
        ?? data.user.email?.split('@')[0]
        ?? null
      setDisplayName(name)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/customer/booking', label: '예약' },
    { href: '/customer/menus', label: '메뉴' },
  ]

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map(link => (
        <Link key={link.href} href={link.href}
          className="h-8 px-3 rounded-lg text-sm font-medium flex items-center transition-colors"
          style={{ color: pathname === link.href ? '#2D4A3E' : 'rgba(28,28,28,0.5)', fontWeight: pathname === link.href ? 600 : 400 }}>
          {link.label}
        </Link>
      ))}

      {/* 사용자 메뉴 */}
      <div className="relative ml-1">
        <button
          onClick={() => setOpen(v => !v)}
          className="h-8 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors hover:bg-[rgba(28,28,28,0.05)]"
          style={{ color: open || pathname.startsWith('/customer/profile') ? '#2D4A3E' : 'rgba(28,28,28,0.6)' }}>
          <User size={14} />
          {displayName && <span className="max-w-[60px] truncate">{displayName}</span>}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl py-1.5 z-40"
              style={{ background: '#FFFFFF', border: '1.5px solid rgba(28,28,28,0.08)', boxShadow: '0 8px 24px rgba(28,28,28,0.1)' }}>
              {displayName && (
                <div className="px-4 py-2 mb-1" style={{ borderBottom: '1px solid rgba(28,28,28,0.07)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#1C1C1C' }}>{displayName}님</p>
                </div>
              )}
              <Link href="/customer/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[rgba(28,28,28,0.04)] transition-colors"
                style={{ color: '#1C1C1C' }}>
                <User size={13} />
                내 정보
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[rgba(28,28,28,0.04)] transition-colors"
                style={{ color: 'rgba(28,28,28,0.55)' }}>
                <LogOut size={13} />
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
