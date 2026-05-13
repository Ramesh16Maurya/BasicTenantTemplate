import { PERMISSIONS } from '@repo/contracts'
import { PageShell } from '@/components/PageShell'
import { serverFetch } from '@/lib/server-api'
import { requireNav } from '@/lib/session'
import { LocationsTable } from './table'

export default async function LocationsPage() {
  await requireNav(PERMISSIONS.NAV_LOCATIONS)
  const res = await serverFetch('/stock-locations')
  const data = res.ok ? ((await res.json()) as { items: Record<string, unknown>[] }).items : []

  return (
    <PageShell title="Stock locations" description="Warehouses, stores, or bins.">
      <LocationsTable initialRows={data} />
    </PageShell>
  )
}
