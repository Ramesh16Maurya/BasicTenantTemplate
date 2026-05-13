import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerEnv } from '@/lib/env'
import { COOKIE_ACCESS, COOKIE_TENANT } from '@/lib/cookies'

export async function GET() {
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tenant = store.get(COOKIE_TENANT)?.value
  const { API_URL } = getServerEnv()
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (tenant) headers['X-Tenant-Id'] = tenant
  const res = await fetch(`${API_URL}/me`, { headers, cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
