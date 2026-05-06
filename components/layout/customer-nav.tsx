'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CustomerNav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [name, setName] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setName(
        data.user.user_metadata?.full_name?.split(' ')[0]
        ?? data.user.user_metadata?.name?.split(' ')[0]
        ?? data.user.email?.split('@')[0]
        ?? null
      )
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const links = [
    { href: '/customer/booking', label: '예약' },
    { href: '/customer/menus', label: '메뉴' },
  ]

  return (
    <nav className="flex items-center gap-1">
      {links.map(l => (
        <Link key={l.href} href={l.href}
          className={`h-8 px-3 rounded text-sm font-medium transition-colors ${pathname === l.href ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
          {l.label}
        </Link>
      ))}

      <div className="relative ml-1">
        <button
          onClick={() => setOpen(v => !v)}
          className={`h-8 px-3 rounded text-sm font-medium transition-colors ${open ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
          {name ?? '내 정보'}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
              {name && <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">{name}님</div>}
              <Link href="/customer/profile" onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                내 정보
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50">
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
