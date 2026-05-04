export interface GeocodeResult {
  lat: number
  lng: number
  district: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  )
  if (!res.ok) return null

  const data = await res.json()
  const doc = data.documents?.[0]
  if (!doc) return null

  const lat = parseFloat(doc.y)
  const lng = parseFloat(doc.x)

  // 동 단위 추출 (road_address → region_3depth_name, address → region_3depth_name)
  const district =
    doc.road_address?.region_3depth_name ||
    doc.address?.region_3depth_name ||
    doc.address_name ||
    address

  return { lat, lng, district }
}
