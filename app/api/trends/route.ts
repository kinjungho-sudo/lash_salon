import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trends — 키워드 목록 + 최신 히스토리
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: keywords } = await supabase
    .from('lash_salon_trend_keywords')
    .select('*, history:lash_salon_trend_history(period_date, search_ratio)')
    .eq('owner_id', user.id)
    .order('created_at')

  return NextResponse.json(keywords ?? [])
}

// POST /api/trends — 키워드 추가
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyword } = await request.json()
  if (!keyword?.trim()) return NextResponse.json({ error: '키워드를 입력하세요.' }, { status: 400 })

  const { data, error } = await supabase
    .from('lash_salon_trend_keywords')
    .insert({ owner_id: user.id, keyword: keyword.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 등록된 키워드입니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/trends?id=xxx — 키워드 삭제
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabase.from('lash_salon_trend_keywords').delete().eq('id', id).eq('owner_id', user.id)
  return NextResponse.json({ success: true })
}
