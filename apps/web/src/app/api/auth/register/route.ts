import { NextResponse } from 'next/server'
import { getServerEnv } from '@/lib/env'
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_TENANT, cookieOpts } from '@/lib/cookies'

export async function POST(req: Request) {
  const body = await req.json()
  const { API_URL } = getServerEnv()
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  const out = NextResponse.json({ ok: true, tenantId: data.tenant?.id })
  out.cookies.set(COOKIE_ACCESS, data.accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  out.cookies.set(COOKIE_REFRESH, data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 })
  if (data.tenant?.id) {
    out.cookies.set(COOKIE_TENANT, data.tenant.id, { ...cookieOpts, httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
  }
  return out
}
