export interface DatalabKeyword {
  groupName: string
  keywords: string[]
}

export interface DatalabResult {
  title: string
  keyword: string[]
  data: { period: string; ratio: number }[]
}

export async function fetchTrends(
  keywords: DatalabKeyword[],
  startDate: string, // 'YYYY-MM-DD'
  endDate: string,
  timeUnit: 'date' | 'week' | 'month' = 'date'
): Promise<DatalabResult[]> {
  const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    },
    body: JSON.stringify({ startDate, endDate, timeUnit, keywordGroups: keywords }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Naver Datalab API error: ${res.status} ${text}`)
  }

  const json = await res.json()
  return json.results ?? []
}
