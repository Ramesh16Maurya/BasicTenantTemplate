import { NextResponse } from 'next/server'
import { getServerEnv } from '@/lib/env'
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_TENANT, cookieOpts } from '@/lib/cookies'

export async function POST(req: Request) {
  const body = await req.json()
  const { API_URL } = getServerEnv()
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  const out = NextResponse.json({ ok: true })
  out.cookies.set(COOKIE_ACCESS, data.accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  out.cookies.set(COOKIE_REFRESH, data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 })
  const me = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${data.accessToken}` },
    cache: 'no-store',
  })
  if (me.ok) {
    const mj = (await me.json()) as { tenants?: { tenantId: string }[] }
    const tid = mj.tenants?.[0]?.tenantId
    if (tid) {
      out.cookies.set(COOKIE_TENANT, tid, { ...cookieOpts, httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
    }
  }
  return out
}
