import { PERMISSIONS } from '@repo/contracts'
import { PageShell } from '@/components/PageShell'
import { serverFetch } from '@/lib/server-api'
import { requireNav } from '@/lib/session'
import { GoodsTable } from './table'

export default async function GoodsPage() {
  await requireNav(PERMISSIONS.NAV_GOODS)
  const res = await serverFetch('/goods-items')
  const data = res.ok ? ((await res.json()) as { items: Record<string, unknown>[] }).items : []

  return (
    <PageShell title="Goods" description="Items tracked for this tenant.">
      <GoodsTable initialRows={data} />
    </PageShell>
  )
}
