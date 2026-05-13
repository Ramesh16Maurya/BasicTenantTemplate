import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_ACCESS, COOKIE_TENANT } from '@/lib/cookies'
import { getServerEnv } from '@/lib/env'

export type Session = {
  user: { id: string; email: string; fullName: string }
  tenants: { tenantId: string; tenantName: string; status: string }[]
  permissionCodes: string[]
  tenantId: string | null
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  if (!token) return null
  const { API_URL } = getServerEnv()

  const r0 = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (r0.status === 401) return null
  if (!r0.ok) return null
  const j0 = (await r0.json()) as {
    user: Session['user']
    tenants: Session['tenants']
    permissionCodes: string[]
  }

  let tenantId = store.get(COOKIE_TENANT)?.value ?? null
  const firstTenant = j0.tenants[0]
  if (!tenantId && firstTenant) tenantId = firstTenant.tenantId

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (tenantId) headers['X-Tenant-Id'] = tenantId
  const r1 = await fetch(`${API_URL}/me`, { headers, cache: 'no-store' })
  const permissionCodes = r1.ok ? ((await r1.json()) as { permissionCodes: string[] }).permissionCodes : []

  return {
    user: j0.user,
    tenants: j0.tenants,
    permissionCodes,
    tenantId,
  }
}

export async function requireNav(permission: string) {
  const s = await getSession()
  if (!s) redirect('/login')
  if (!s.permissionCodes.includes(permission)) redirect('/')
  return s
}
