import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined'
import PlaceOutlined from '@mui/icons-material/PlaceOutlined'
import { Box, Typography } from '@mui/material'
import { DashboardStatCard } from '@/components/DashboardStatCard'
import { PageShell } from '@/components/PageShell'
import { serverFetch } from '@/lib/server-api'
import { getSession } from '@/lib/session'

export default async function DashboardPage() {
  await getSession()
  const [goodsRes, locRes, movRes] = await Promise.all([
    serverFetch('/goods-items'),
    serverFetch('/stock-locations'),
    serverFetch('/stock-movements'),
  ])
  const goods = goodsRes.ok ? ((await goodsRes.json()) as { items: unknown[] }).items.length : null
  const locs = locRes.ok ? ((await locRes.json()) as { items: unknown[] }).items.length : null
  const movs = movRes.ok ? ((await movRes.json()) as { items: unknown[] }).items.length : null

  return (
    <PageShell
      title="Dashboard"
      description="A quick overview of your goods and stock activity."
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <DashboardStatCard
          title="Goods"
          value={goods === null ? '—' : goods}
          hint={goods === null ? 'Could not load goods' : 'Tenant-scoped'}
          tone="primary"
          icon={<Inventory2Outlined fontSize="small" />}
        />
        <DashboardStatCard
          title="Locations"
          value={locs === null ? '—' : locs}
          hint={locs === null ? 'Could not load locations' : 'Warehouses / bins'}
          tone="success"
          icon={<PlaceOutlined fontSize="small" />}
        />
        <DashboardStatCard
          title="Movements"
          value={movs === null ? '—' : movs}
          hint={movs === null ? 'Could not load movements' : 'Recorded stock events'}
          tone="info"
          icon={<LocalShippingOutlined fontSize="small" />}
        />
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            Permissions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Navigation shows only pages your role allows.
          </Typography>
        </Box>
      </Box>
    </PageShell>
  )
}
