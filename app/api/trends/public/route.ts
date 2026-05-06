import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/trends/public — 인증 없이 최신 트렌드 데이터 반환 (공유 페이지용)
export async function GET() {
  const supabase = createServiceClient()

  // 가장 최근 갱신 데이터가 있는 owner 기준으로 키워드 조회
  const { data: keywords, error } = await supabase
    .from('lash_salon_trend_keywords')
    .select(`
      id,
      keyword,
      last_search_volume,
      last_fetched_at,
      history:lash_salon_trend_history(period_date, search_ratio)
    `)
    .not('last_fetched_at', 'is', null)
    .order('last_fetched_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 중복 keyword 제거 (같은 키워드가 여러 owner에 있을 경우 최신 것만)
  const seen = new Set<string>()
  const unique = (keywords ?? []).filter(k => {
    if (seen.has(k.keyword)) return false
    seen.add(k.keyword)
    return true
  })

  const lastFetched = unique[0]?.last_fetched_at ?? null

  return NextResponse.json({ keywords: unique, lastFetched }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
