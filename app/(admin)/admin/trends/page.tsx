'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Plus, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface TrendKeyword {
  id: string
  keyword: string
  last_search_volume: number | null
  last_fetched_at: string | null
  history: { period_date: string; search_ratio: number }[]
}

const LINE_COLORS = ['#A8C5B8', '#6B9E8E', '#4A7C6C', '#2D5A4A', '#8BB5A5', '#C5DDD6']

export default function AdminTrendsPage() {
  const [keywords, setKeywords] = useState<TrendKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchKeywords() {
    setLoading(true)
    const res = await fetch('/api/trends')
    const data = await res.json()
    setKeywords(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchKeywords() }, [])

  async function handleAdd() {
    if (!newKeyword.trim()) return
    setAdding(true); setError(null)
    const res = await fetch('/api/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newKeyword.trim() }),
    })
    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg)
    } else {
      setNewKeyword('')
      await fetchKeywords()
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/trends?id=${id}`, { method: 'DELETE' })
    await fetchKeywords()
  }

  async function handleRefresh() {
    setRefreshing(true); setError(null)
    const res = await fetch('/api/trends/refresh', { method: 'POST' })
    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg)
    } else {
      await fetchKeywords()
    }
    setRefreshing(false)
  }

  // 차트 데이터 합산 (모든 키워드의 날짜를 합쳐 단일 배열로)
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
      .map(([date, values]) => ({ date: date.slice(5), ...values })) // MM-DD 형식
  })()

  const hasData = chartData.length > 0
  const lastFetched = keywords.find(k => k.last_fetched_at)?.last_fetched_at

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>트렌드</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,232,0.4)' }}>
            네이버 데이터랩 검색량 추이
            {lastFetched && <span> · 최근 갱신: {new Date(lastFetched).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing || keywords.length === 0}
          className="h-9 px-4 rounded-lg text-sm font-semibold btn-green flex items-center gap-2 disabled:opacity-40">
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {refreshing ? '가져오는 중...' : '데이터 새로고침'}
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg text-xs flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#F87171' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* 키워드 추가 */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(245,240,232,0.4)' }}>키워드 관리</p>
        <div className="flex gap-2 mb-4">
          <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="예: 속눈썹펌, 래쉬리프트"
            className="flex-1 h-10 px-3 rounded-lg text-sm input-luxury" />
          <button onClick={handleAdd} disabled={adding || !newKeyword.trim()}
            className="h-10 px-4 rounded-lg text-sm font-semibold btn-green flex items-center gap-1.5 disabled:opacity-40">
            {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            추가
          </button>
        </div>

        {loading ? (
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>불러오는 중...</p>
        ) : keywords.length === 0 ? (
          <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>등록된 키워드가 없습니다. 위에서 추가해 주세요.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <div key={kw.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(45,74,62,0.3)', border: '1px solid rgba(168,197,184,0.2)' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                <span style={{ color: '#A8C5B8' }}>{kw.keyword}</span>
                {kw.last_search_volume !== null && (
                  <span style={{ color: 'rgba(168,197,184,0.6)' }}>({kw.last_search_volume.toFixed(1)})</span>
                )}
                <button onClick={() => handleDelete(kw.id)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'rgba(245,240,232,0.6)' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 차트 */}
      <div className="rounded-xl p-6" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs uppercase tracking-wider mb-5" style={{ color: 'rgba(245,240,232,0.4)' }}>최근 30일 검색량 추이</p>
        {!hasData ? (
          <div className="py-16 text-center">
            <p className="text-sm mb-2" style={{ color: 'rgba(245,240,232,0.3)' }}>
              {keywords.length === 0 ? '키워드를 먼저 추가해 주세요.' : '데이터 새로고침 버튼을 눌러 검색량을 가져오세요.'}
            </p>
            {keywords.length > 0 && (
              <button onClick={handleRefresh} disabled={refreshing}
                className="mt-3 h-9 px-5 rounded-lg text-sm btn-green flex items-center gap-2 mx-auto disabled:opacity-40">
                {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                지금 가져오기
              </button>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(245,240,232,0.35)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(245,240,232,0.35)' }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(245,240,232,0.6)', marginBottom: '4px' }}
                itemStyle={{ color: '#A8C5B8' }}
                formatter={(value) => [typeof value === 'number' ? `${value.toFixed(1)}` : `${value}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(245,240,232,0.5)', paddingTop: '12px' }} />
              {keywords.map((kw, i) => (
                <Line key={kw.id} type="monotone" dataKey={kw.keyword}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 키워드별 최신 수치 */}
      {keywords.some(k => k.last_search_volume !== null) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {keywords.filter(k => k.last_search_volume !== null).map((kw, i) => (
            <div key={kw.id} className="rounded-xl p-4" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                <p className="text-xs font-medium" style={{ color: 'rgba(245,240,232,0.6)' }}>{kw.keyword}</p>
              </div>
              <p className="text-2xl font-bold text-[#F5F0E8]">{kw.last_search_volume?.toFixed(1)}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.3)' }}>최근 검색 지수</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
