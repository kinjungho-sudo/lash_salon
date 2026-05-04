'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function CustomerNav() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="flex items-center gap-1">
      <Link href="/customer/booking" className="h-8 px-4 rounded-lg text-sm font-medium flex items-center transition-colors"
        style={{ color: '#2D4A3E' }}>
        예약하기
      </Link>
      <Link href="/customer/menus" className="h-8 px-4 rounded-lg text-sm font-medium flex items-center transition-colors"
        style={{ color: 'rgba(28,28,28,0.55)' }}>
        메뉴
      </Link>
      <button onClick={handleLogout} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.06)]"
        style={{ color: 'rgba(28,28,28,0.4)' }}>
        <LogOut size={15} />
      </button>
    </nav>
  )
}
