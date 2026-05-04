import { google } from 'googleapis'
import type { Credentials } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google-calendar-callback`
  )
}

export function getAuthUrl() {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

export async function exchangeCode(code: string) {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getCalendarClient(accessToken: string, refreshToken: string, expiresAt: string | null) {
  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiresAt ? new Date(expiresAt).getTime() : undefined,
  })

  // 만료 임박 시 자동 갱신
  const now = Date.now()
  const expiry = expiresAt ? new Date(expiresAt).getTime() : 0
  if (expiry - now < 5 * 60 * 1000) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)
    return { client: oauth2Client, newTokens: credentials }
  }

  return { client: oauth2Client, newTokens: null }
}

export async function isSlotAvailable(
  accessToken: string,
  refreshToken: string,
  expiresAt: string | null,
  calendarId: string,
  startAt: string,
  endAt: string
): Promise<{ available: boolean; newTokens: Credentials | null }> {
  const { client, newTokens } = await getCalendarClient(accessToken, refreshToken, expiresAt)
  const calendar = google.calendar({ version: 'v3', auth: client })

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: startAt,
      timeMax: endAt,
      items: [{ id: calendarId }],
    },
  })

  const busy = res.data.calendars?.[calendarId]?.busy ?? []
  return { available: busy.length === 0, newTokens }
}

export async function createEvent(
  accessToken: string,
  refreshToken: string,
  expiresAt: string | null,
  calendarId: string,
  summary: string,
  startAt: string,
  endAt: string
): Promise<{ eventId: string | null; newTokens: Credentials | null }> {
  const { client, newTokens } = await getCalendarClient(accessToken, refreshToken, expiresAt)
  const calendar = google.calendar({ version: 'v3', auth: client })

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      start: { dateTime: startAt, timeZone: 'Asia/Seoul' },
      end: { dateTime: endAt, timeZone: 'Asia/Seoul' },
    },
  })

  return { eventId: res.data.id ?? null, newTokens }
}

export async function deleteEvent(
  accessToken: string,
  refreshToken: string,
  expiresAt: string | null,
  calendarId: string,
  eventId: string
): Promise<void> {
  const { client } = await getCalendarClient(accessToken, refreshToken, expiresAt)
  const calendar = google.calendar({ version: 'v3', auth: client })
  await calendar.events.delete({ calendarId, eventId })
}
