import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerEnv } from '@/lib/env'
import { COOKIE_ACCESS, COOKIE_TENANT, cookieOpts } from '@/lib/cookies'

export async function POST(req: Request) {
  const { tenantId } = (await req.json()) as { tenantId?: string }
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { API_URL } = getServerEnv()
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
    },
  })
  if (!res.ok) return NextResponse.json({ error: 'Invalid tenant' }, { status: 403 })
  const out = NextResponse.json({ ok: true })
  out.cookies.set(COOKIE_TENANT, tenantId, { ...cookieOpts, httpOnly: false, maxAge: 60 * 60 * 24 * 365 })
  return out
}
