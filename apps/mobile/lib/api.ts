import Constants from 'expo-constants'

const base =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:4000'

export async function apiGet(path: string, token: string, tenantId?: string | null) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (tenantId) headers['X-Tenant-Id'] = tenantId
  const res = await fetch(`${base}${path}`, { headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<unknown>
}
