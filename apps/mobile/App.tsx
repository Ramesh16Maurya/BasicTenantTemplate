import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { PERMISSIONS } from '@repo/contracts'
import { apiGet } from './lib/api'
import { getAccessToken, getTenantId, saveTenantId, saveTokens } from './lib/session'

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [tenant, setTenant] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const t = await getAccessToken()
      const tid = await getTenantId()
      setToken(t)
      setTenant(tid)
      setLoading(false)
    })()
  }, [])

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json()) as { accessToken?: string; error?: string }
    if (!res.ok || !data.accessToken) throw new Error(data.error ?? 'Login failed')
    await saveTokens(data.accessToken)
    setToken(data.accessToken)
    const me = (await apiGet('/me', data.accessToken, null)) as {
      tenants: { tenantId: string }[]
      permissionCodes?: string[]
    }
    if (me.tenants?.[0]?.tenantId) {
      await saveTenantId(me.tenants[0].tenantId)
      setTenant(me.tenants[0].tenantId)
    }
  }

  const loadGoods = async () => {
    if (!token) return
    const tid = tenant ?? (await getTenantId())
    const j = (await apiGet('/goods-items', token, tid)) as { items: unknown[] }
    setCount(j.items.length)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!token) {
    return (
      <View style={styles.pad}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Goods Tracker</Text>
        <Text style={styles.hint}>API: {API}</Text>
        <Text style={styles.hint}>Example permission key: {PERMISSIONS.NAV_GOODS}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        <Button title="Sign in" onPress={() => login().catch(() => {})} />
      </View>
    )
  }

  return (
    <View style={styles.pad}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Signed in</Text>
      <Text style={styles.hint}>Tenant: {tenant ?? 'none'}</Text>
      <Button title="Load goods count" onPress={() => loadGoods().catch(() => {})} />
      {count !== null ? <Text style={styles.count}>Items: {count}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { flex: 1, padding: 24, gap: 12, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: '700' },
  hint: { color: '#666' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  count: { fontSize: 16, fontWeight: '600' },
})
