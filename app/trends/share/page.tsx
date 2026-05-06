'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { TrendingUp, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface TrendKeyword {
  id: string
  keyword: string
  last_search_volume: number | null
  last_fetched_at: string | null
  history: { period_date: string; search_ratio: number }[]
}

const LINE_COLORS = ['#A8C5B8', '#6B9E8E', '#C4A882', '#D4B896', '#8BB5A5', '#B8C5A8']

function getTrend(history: { period_date: string; search_ratio: number }[]) {
  if (history.length < 7) return null
  const sorted = [...history].sort((a, b) => a.period_date.localeCompare(b.period_date))
  const recent3 = sorted.slice(-3).reduce((s, h) => s + h.search_ratio, 0) / 3
  const prev3 = sorted.slice(-7, -4).reduce((s, h) => s + h.search_ratio, 0) / 3
  if (prev3 === 0) return null
  return ((recent3 - prev3) / prev3) * 100
}

export default function TrendsSharePage() {
  const [keywords, setKeywords] = useState<TrendKeyword[]>([])
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/trends/public')
      .then(r => r.json())
      .then(data => {
        setKeywords(data.keywords ?? [])
        setLastFetched(data.lastFetched ?? null)
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  // 차트 데이터 통합
  const chartData = (() => {
    const dateMap: Record<string, Record<string, number>> = {}
    keywords.forEach(kw => {
      kw.history?.forEach(h => {
        if (!dateMap[h.period_date]) dateMap[h.period_date] = {}
        dateMap[h.period_date][kw.keyword] = h.search_ratio
      })
    })
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date: date.slice(5), ...values }))
  })()

  const hasData = chartData.length > 0
  const topKeyword = keywords.length > 0
    ? keywords.reduce((a, b) =>
        (a.last_search_volume ?? 0) > (b.last_search_volume ?? 0) ? a : b)
    : null

  const formattedDate = lastFetched
    ? new Date(lastFetched).toLocaleString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-screen" style={{ background: '#0F0F0F', color: '#F5F0E8' }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-14"
        style={{ background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
        <Link href="/" className="flex items-center gap-3">
          <Image src="/Logo.png" alt="MUTE" width={80} height={28} className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
        </Link>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
          <TrendingUp size={13} />
          <span>트렌드 리포트</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        {/* 타이틀 */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#A8C5B8', letterSpacing: '0.25em' }}>
            Naver Datalab · 속눈썹 트렌드
          </p>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair, serif)', letterSpacing: '-0.02em' }}>
            이달의 트렌드 키워드
          </h1>
          <p className="text-sm" style={{ color: 'rgba(245,240,232,0.45)' }}>
            네이버 검색량 데이터 기반 · 최근 30일 추이
            {formattedDate && <span> · {formattedDate} 기준</span>}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <RefreshCw size={18} className="animate-spin" style={{ color: 'rgba(245,240,232,0.3)' }} />
          </div>
        )}

        {error && (
          <div className="py-20 text-center text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 키워드 카드 */}
            {keywords.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {keywords.map((kw, i) => {
                  const trend = getTrend(kw.history)
                  const isTop = topKeyword?.id === kw.id
                  return (
                    <div key={kw.id} className="rounded-2xl p-5 relative overflow-hidden"
                      style={{
                        background: isTop ? 'rgba(168,197,184,0.1)' : '#1A1A1A',
                        border: isTop
                          ? '1px solid rgba(168,197,184,0.3)'
                          : '1px solid rgba(245,240,232,0.06)',
                      }}>
                      {isTop && (
                        <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(168,197,184,0.15)', color: '#A8C5B8' }}>
                          TOP
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                        <p className="text-xs font-medium truncate" style={{ color: 'rgba(245,240,232,0.5)' }}>
                          {kw.keyword}
                        </p>
                      </div>
                      <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair, serif)' }}>
                        {kw.last_search_volume !== null ? kw.last_search_volume.toFixed(1) : '—'}
                      </p>
                      {trend !== null && (
                        <div className="flex items-center gap-1 text-xs">
                          {trend > 3 ? (
                            <><ArrowUp size={11} style={{ color: '#A8C5B8' }} />
                            <span style={{ color: '#A8C5B8' }}>+{trend.toFixed(1)}%</span></>
                          ) : trend < -3 ? (
                            <><ArrowDown size={11} style={{ color: '#F87171' }} />
                            <span style={{ color: '#F87171' }}>{trend.toFixed(1)}%</span></>
                          ) : (
                            <><Minus size={11} style={{ color: 'rgba(245,240,232,0.3)' }} />
                            <span style={{ color: 'rgba(245,240,232,0.3)' }}>보합</span></>
                          )}
                          <span style={{ color: 'rgba(245,240,232,0.3)' }}>vs 지난주</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* 차트 */}
            <div className="rounded-2xl p-6 mb-8"
              style={{ background: '#1A1A1A', border: '1px solid rgba(245,240,232,0.06)' }}>
              <p className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'rgba(245,240,232,0.35)', letterSpacing: '0.2em' }}>
                30일 검색량 추이
              </p>
              <p className="text-xs mb-6" style={{ color: 'rgba(245,240,232,0.2)' }}>
                네이버 기준 100점 만점
              </p>

              {!hasData ? (
                <div className="py-16 text-center text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>
                  데이터가 아직 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 8, left: -24, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.3)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.3)' }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111',
                        border: '1px solid rgba(245,240,232,0.1)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        padding: '10px 14px',
                      }}
                      labelStyle={{ color: 'rgba(245,240,232,0.5)', marginBottom: '6px', fontSize: '11px' }}
                      itemStyle={{ color: '#A8C5B8', padding: '1px 0' }}
                      formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : v, '']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', color: 'rgba(245,240,232,0.4)', paddingTop: '16px' }}
                    />
                    {keywords.map((kw, i) => (
                      <Line
                        key={kw.id}
                        type="monotone"
                        dataKey={kw.keyword}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 인사이트 */}
            {keywords.length > 0 && (
              <div className="rounded-2xl p-6 mb-8"
                style={{ background: '#1A1A1A', border: '1px solid rgba(245,240,232,0.06)' }}>
                <p className="text-xs uppercase tracking-widest mb-5"
                  style={{ color: 'rgba(245,240,232,0.35)', letterSpacing: '0.2em' }}>
                  트렌드 인사이트
                </p>
                <div className="space-y-4">
                  {topKeyword && (
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#A8C5B8' }} />
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.65)' }}>
                        현재 <span className="font-semibold" style={{ color: '#F5F0E8' }}>&lsquo;{topKeyword.keyword}&rsquo;</span>이
                        검색 지수 <span style={{ color: '#A8C5B8' }}>{topKeyword.last_search_volume?.toFixed(1)}</span>로
                        가장 높은 관심을 받고 있습니다.
                      </p>
                    </div>
                  )}
                  {keywords.filter(k => {
                    const t = getTrend(k.history)
                    return t !== null && t > 10
                  }).map(kw => (
                    <div key={kw.id} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#A8C5B8' }} />
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.65)' }}>
                        <span className="font-semibold" style={{ color: '#F5F0E8' }}>&lsquo;{kw.keyword}&rsquo;</span>은
                        지난 1주 대비{' '}
                        <span style={{ color: '#A8C5B8' }}>+{getTrend(kw.history)!.toFixed(0)}% 상승</span> 중입니다.
                      </p>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'rgba(245,240,232,0.2)' }} />
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.4)' }}>
                      데이터 출처: 네이버 데이터랩 검색어 트렌드 (100점 기준 상대 검색량)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 빈 상태 */}
            {keywords.length === 0 && (
              <div className="py-24 text-center">
                <TrendingUp size={32} className="mx-auto mb-4" style={{ color: 'rgba(245,240,232,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(245,240,232,0.35)' }}>
                  아직 공개된 트렌드 데이터가 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t py-8 px-6 mt-4" style={{ borderColor: 'rgba(245,240,232,0.06)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/Logo.png" alt="MUTE" width={64} height={22} className="h-5 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.25)' }}>
            © 2025 MUTE Eyelash Salon
          </p>
        </div>
      </footer>
    </div>
  )
}
