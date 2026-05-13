import { PERMISSIONS } from '@repo/contracts'
import { PageShell } from '@/components/PageShell'
import { serverFetch } from '@/lib/server-api'
import { requireNav } from '@/lib/session'
import { MovementsTable } from './table'

export default async function MovementsPage() {
  await requireNav(PERMISSIONS.NAV_MOVEMENTS)
  const res = await serverFetch('/stock-movements')
  const data = res.ok ? ((await res.json()) as { items: Record<string, unknown>[] }).items : []

  return (
    <PageShell title="Stock movements" description="Append-only style stock events.">
      <MovementsTable initialRows={data} />
    </PageShell>
  )
}
