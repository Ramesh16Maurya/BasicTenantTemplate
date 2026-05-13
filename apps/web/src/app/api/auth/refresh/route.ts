import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerEnv } from '@/lib/env'
import { COOKIE_ACCESS, COOKIE_REFRESH, cookieOpts } from '@/lib/cookies'

export async function POST() {
  const store = await cookies()
  const refresh = store.get(COOKIE_REFRESH)?.value
  if (!refresh) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { API_URL } = getServerEnv()
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  const out = NextResponse.json({ ok: true })
  out.cookies.set(COOKIE_ACCESS, data.accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  out.cookies.set(COOKIE_REFRESH, data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 })
  return out
}
