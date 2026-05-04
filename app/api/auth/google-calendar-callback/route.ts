import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/google/calendar'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/settings?error=no_code`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  try {
    const tokens = await exchangeCode(code)

    await supabase
      .from('lash_salon_owner_profiles')
      .update({
        gcal_access_token: tokens.access_token,
        gcal_refresh_token: tokens.refresh_token ?? undefined,
        gcal_token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        google_calendar_id: 'primary',
      })
      .eq('id', user.id)

    return NextResponse.redirect(`${origin}/admin/settings?success=calendar_connected`)
  } catch {
    return NextResponse.redirect(`${origin}/admin/settings?error=token_exchange_failed`)
  }
}
