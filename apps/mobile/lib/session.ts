import * as SecureStore from 'expo-secure-store'

const ACCESS = 'gt_access'
const TENANT = 'gt_tenant'

export async function saveTokens(access: string) {
  await SecureStore.setItemAsync(ACCESS, access)
}

export async function saveTenantId(tenantId: string) {
  await SecureStore.setItemAsync(TENANT, tenantId)
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS)
}

export async function getTenantId() {
  return SecureStore.getItemAsync(TENANT)
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(ACCESS)
  await SecureStore.deleteItemAsync(TENANT)
}
