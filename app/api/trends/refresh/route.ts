import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchTrends } from '@/lib/naver/datalab'

// POST /api/trends/refresh — 네이버 데이터랩 호출 후 히스토리 저장
export async function POST() {
  const supabase = createClient()
  const serviceSupabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: keywords } = await supabase
    .from('lash_salon_trend_keywords')
    .select('id, keyword')
    .eq('owner_id', user.id)

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ error: '등록된 키워드가 없습니다.' }, { status: 400 })
  }

  // 최근 30일
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const keywordGroups = keywords.map(k => ({
    groupName: k.keyword,
    keywords: [k.keyword],
  }))

  let results
  try {
    results = await fetchTrends(keywordGroups, fmt(startDate), fmt(endDate), 'date')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'API 호출 실패'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const now = new Date().toISOString()

  for (const result of results) {
    const kw = keywords.find(k => k.keyword === result.title)
    if (!kw) continue

    // 최신 검색량 (마지막 데이터 ratio)
    const lastRatio = result.data.at(-1)?.ratio ?? null

    // keyword 레코드 업데이트
    await serviceSupabase
      .from('lash_salon_trend_keywords')
      .update({ last_search_volume: lastRatio, last_fetched_at: now })
      .eq('id', kw.id)

    // 히스토리 upsert (period_date 기준)
    if (result.data.length > 0) {
      const historyRows = result.data.map(d => ({
        keyword_id: kw.id,
        period_date: d.period,
        search_ratio: d.ratio,
      }))

      await serviceSupabase
        .from('lash_salon_trend_history')
        .upsert(historyRows, { onConflict: 'keyword_id,period_date' })
    }
  }

  return NextResponse.json({ success: true, updated: results.length })
}
