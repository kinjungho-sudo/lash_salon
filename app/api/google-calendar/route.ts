import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google/calendar'
import { createClient } from '@/lib/supabase/server'

// GET /api/google-calendar → OAuth 인증 URL 반환
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = getAuthUrl()
  return NextResponse.json({ url })
}
