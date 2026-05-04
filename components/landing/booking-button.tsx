'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  size?: 'sm' | 'lg'
  variant?: 'cream' | 'white'
}

export default function BookingButton({ size = 'sm', variant = 'cream' }: Props) {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick() {
    router.push(loggedIn ? '/customer/booking' : '/login')
  }

  const heightClass = size === 'lg' ? 'h-12 px-10 text-sm' : 'h-9 px-5 text-sm'
  const styleProps = variant === 'white'
    ? { background: '#FFFFFF', color: '#2D4A3E' }
    : undefined

  return (
    <button
      onClick={handleClick}
      className={`${heightClass} rounded-xl font-semibold flex items-center transition-all hover:opacity-90 ${variant === 'cream' ? 'btn-cream' : ''}`}
      style={styleProps}
    >
      예약하기
    </button>
  )
}
