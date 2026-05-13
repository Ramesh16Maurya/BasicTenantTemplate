import { cookies } from 'next/headers'
import { COOKIE_ACCESS, COOKIE_TENANT } from '@/lib/cookies'
import { getServerEnv } from '@/lib/env'

export async function serverFetch(path: string, init: RequestInit = {}) {
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  let tenant = store.get(COOKIE_TENANT)?.value ?? null
  const { API_URL } = getServerEnv()

  if (!tenant && token) {
    const r0 = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (r0.ok) {
      const j0 = (await r0.json()) as { tenants: { tenantId: string }[] }
      const t0 = j0.tenants?.[0]
      if (t0) tenant = t0.tenantId
    }
  }

  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (tenant) headers.set('X-Tenant-Id', tenant)
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' })
}
