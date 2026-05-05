'use client'

import { useEffect, useState, useMemo } from 'react'
import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk'
import { Users, MapPin, AlertCircle } from 'lucide-react'

interface CustomerPin {
  id: string
  name: string
  district: string
  lat: number
  lng: number
  visitCount: number
  favoriteMenu: string | null
  hasNoShow: boolean
}

interface DistrictSummary {
  district: string
  lat: number
  lng: number
  customers: CustomerPin[]
  totalVisits: number
  hasNoShow: boolean
}

type PeriodFilter = '1' | '3' | 'all'

export default function AdminMapPage() {
  useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY!,
    libraries: ['clusterer'],
  })
  const [pins, setPins] = useState<CustomerPin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodFilter>('3')
  const [showNoShow, setShowNoShow] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSummary | null>(null)

  useEffect(() => {
    fetchPins()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, showNoShow])

  async function fetchPins() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ period, showNoShow: showNoShow.toString() })
      const res = await fetch(`/api/map/customers?${params}`)
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? '불러오기 실패')
        setPins([])
      } else {
        const data = await res.json()
        setPins(Array.isArray(data) ? data : [])
      }
    } catch {
      setError('네트워크 오류')
      setPins([])
    }
    setLoading(false)
  }

  // 동네별 그룹핑
  const districts = useMemo<DistrictSummary[]>(() => {
    const map: Record<string, DistrictSummary> = {}
    pins.forEach(pin => {
      const key = pin.district
      if (!map[key]) {
        map[key] = { district: key, lat: pin.lat, lng: pin.lng, customers: [], totalVisits: 0, hasNoShow: false }
      }
      map[key].customers.push(pin)
      map[key].totalVisits += pin.visitCount
      if (pin.hasNoShow) map[key].hasNoShow = true
    })
    return Object.values(map).sort((a, b) => b.totalVisits - a.totalVisits)
  }, [pins])

  const totalCustomers = pins.length
  const totalDistricts = districts.length

  // 방문수 기준 마커 크기 계산
  function markerSize(visits: number): number {
    if (visits >= 10) return 40
    if (visits >= 5) return 34
    if (visits >= 3) return 28
    return 22
  }

  // 마커 색상 (노쇼 여부)
  function markerColor(d: DistrictSummary): string {
    return d.hasNoShow ? '#E57373' : '#2D4A3E'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-playfair,serif)' }}>동네 지도</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,232,0.4)' }}>
            고객 거주지 분포 · {totalCustomers}명 · {totalDistricts}개 동네
          </p>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {([['1', '1개월'], ['3', '3개월'], ['all', '전체']] as [PeriodFilter, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setPeriod(val)}
                className="h-8 px-3 text-xs font-medium transition-colors"
                style={{
                  background: period === val ? '#2D4A3E' : 'transparent',
                  color: period === val ? '#A8C5B8' : 'rgba(245,240,232,0.4)',
                }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNoShow(v => !v)}
            className="h-8 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{
              background: showNoShow ? 'rgba(229,115,115,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showNoShow ? 'rgba(229,115,115,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: showNoShow ? '#EF9A9A' : 'rgba(245,240,232,0.4)',
            }}>
            노쇼 {showNoShow ? '포함' : '제외'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg text-xs flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#F87171' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 지도 */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden relative" style={{ height: '520px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#1A1A1A' }}>
              <p className="text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>지도 불러오는 중...</p>
            </div>
          )}
          {!loading && pins.length === 0 && !error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2" style={{ background: '#1A1A1A' }}>
              <MapPin size={28} style={{ color: 'rgba(245,240,232,0.2)' }} />
              <p className="text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>좌표가 등록된 고객이 없습니다.</p>
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>고객 등록 시 동네 주소를 입력하면 자동으로 표시됩니다.</p>
            </div>
          )}
          {!loading && pins.length > 0 && (
            <Map
              center={{ lat: 37.5665, lng: 126.9780 }}
              style={{ width: '100%', height: '100%' }}
              level={8}
            >
              <MarkerClusterer averageCenter={true} minLevel={6}>
                {districts.map(d => (
                  <MapMarker
                    key={d.district}
                    position={{ lat: d.lat, lng: d.lng }}
                    image={{
                      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="${markerSize(d.totalVisits)}" height="${markerSize(d.totalVisits)}" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="18" fill="${markerColor(d)}" opacity="0.9"/>
                          <text x="20" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${d.totalVisits}</text>
                        </svg>`
                      )}`,
                      size: { width: markerSize(d.totalVisits), height: markerSize(d.totalVisits) },
                    }}
                    onClick={() => setSelectedDistrict(d)}
                  />
                ))}
              </MarkerClusterer>
            </Map>
          )}
        </div>

        {/* 사이드 패널 */}
        <div className="flex flex-col gap-3" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {/* 선택된 동네 정보 */}
          {selectedDistrict && (
            <div className="rounded-xl p-4 flex-shrink-0" style={{ background: '#2D4A3E', border: '1px solid rgba(168,197,184,0.2)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={13} style={{ color: '#A8C5B8' }} />
                  <p className="text-sm font-semibold" style={{ color: '#A8C5B8' }}>{selectedDistrict.district}</p>
                </div>
                <button onClick={() => setSelectedDistrict(null)} className="text-xs opacity-50 hover:opacity-100" style={{ color: '#A8C5B8' }}>✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(168,197,184,0.6)' }}>고객 수</p>
                  <p className="text-lg font-bold text-[#F5F0E8]">{selectedDistrict.customers.length}명</p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(168,197,184,0.6)' }}>총 방문</p>
                  <p className="text-lg font-bold text-[#F5F0E8]">{selectedDistrict.totalVisits}회</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {selectedDistrict.customers.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <span style={{ color: '#F5F0E8' }}>{c.name}</span>
                    <span style={{ color: 'rgba(168,197,184,0.7)' }}>
                      {c.visitCount}회 {c.hasNoShow && <span style={{ color: '#EF9A9A' }}>·노쇼</span>}
                    </span>
                  </div>
                ))}
                {selectedDistrict.customers.length > 5 && (
                  <p className="text-xs text-center" style={{ color: 'rgba(168,197,184,0.4)' }}>외 {selectedDistrict.customers.length - 5}명</p>
                )}
              </div>
            </div>
          )}

          {/* 동네 순위 */}
          <div className="rounded-xl p-4" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} style={{ color: 'rgba(245,240,232,0.4)' }} />
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(245,240,232,0.4)' }}>동네별 방문 순위</p>
            </div>

            {loading ? (
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>불러오는 중...</p>
            ) : districts.length === 0 ? (
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>데이터 없음</p>
            ) : (
              <div className="space-y-2">
                {districts.slice(0, 10).map((d, i) => (
                  <button key={d.district} onClick={() => setSelectedDistrict(d)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                    style={{ background: selectedDistrict?.district === d.district ? 'rgba(45,74,62,0.4)' : 'transparent' }}>
                    <span className="text-xs font-bold w-4 flex-shrink-0" style={{ color: i < 3 ? '#A8C5B8' : 'rgba(245,240,232,0.25)' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#F5F0E8' }}>{d.district}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold" style={{ color: '#A8C5B8' }}>{d.totalVisits}회</p>
                      <p className="text-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>{d.customers.length}명</p>
                    </div>
                    {/* 방문 바 */}
                    <div className="w-12 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{
                        background: '#2D4A3E',
                        width: `${Math.min(100, (d.totalVisits / (districts[0]?.totalVisits || 1)) * 100)}%`
                      }} />
                    </div>
                  </button>
                ))}
                {districts.length > 10 && (
                  <p className="text-xs text-center pt-1" style={{ color: 'rgba(245,240,232,0.3)' }}>외 {districts.length - 10}개 동네</p>
                )}
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="rounded-xl p-4" style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(245,240,232,0.4)' }}>범례</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: '#2D4A3E' }} />
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>일반 고객 (숫자 = 방문 횟수)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: '#E57373' }} />
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>노쇼 이력 있음</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 flex-shrink-0">
                  {[22, 28, 34, 40].map(s => (
                    <div key={s} className="rounded-full" style={{ width: s / 2.5, height: s / 2.5, background: '#3D6354' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>마커 크기 = 방문 빈도</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
